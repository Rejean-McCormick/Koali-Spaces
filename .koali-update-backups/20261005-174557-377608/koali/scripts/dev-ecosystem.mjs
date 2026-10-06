import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readEcosystemCatalog } from '../server/ecosystem/catalog.mjs';
import { discoverEcosystem, writeWorkspaceHints } from '../server/ecosystem/discovery.mjs';
import {
  probeProduct,
  productAutostartEnabled,
  startProductProcesses,
  stopChildren,
} from '../tools/workspace-launcher/manifest-runner.mjs';
import {
  atomicWriteJson,
  buildSurfaceRuntimeRegistry,
  writeEcosystemStatus,
} from '../server/ecosystem/runtime-state.mjs';
import { writeDevelopmentShellState } from '../server/ecosystem/shell-state-compiler.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const stateRoot = path.resolve(process.env.KOALI_SPACES_STATE_ROOT || path.join(appRoot, '.koali-dev', 'state'));
const surfaceRegistryFile = path.resolve(process.env.KOALI_SPACES_SURFACE_REGISTRY || path.join(stateRoot, 'surface-runtime.json'));
const workspaceFile = path.resolve(process.env.KOALI_ECOSYSTEM_WORKSPACE || path.join(appRoot, '.koali-dev', 'workspace.json'));
process.env.KOALI_ECOSYSTEM_WORKSPACE = workspaceFile;
const autostartAll = !['0', 'false', 'no', 'off'].includes((process.env.KOALI_ECOSYSTEM_AUTOSTART ?? '1').toLowerCase());
const processStates = new Map();
const runtimeStates = new Map();
let children = [];
let koali = null;
let monitor = null;
let shuttingDown = false;
let refreshRunning = false;

process.env.KOALI_SPACES_STATE_ROOT = stateRoot;
process.env.KOALI_SPACES_SURFACE_REGISTRY = surfaceRegistryFile;
process.env.KOALI_SPACES_DEV_FALLBACK = '1';

function log(message) {
  console.log(`[koali:ecosystem] ${message}`);
}

async function refresh(discovery) {
  if (refreshRunning) return;
  refreshRunning = true;
  try {
    for (const product of discovery.products) {
      if (!product.repoFound && !product.externallyManaged) {
        runtimeStates.set(product.id, { state: 'missing', reason: product.discoveryReason ?? 'repository not found' });
        continue;
      }
      const localAutostart = autostartAll && productAutostartEnabled(product);
      const probe = await probeProduct(product);
      const processState = processStates.get(product.id);
      if (probe.state === 'starting' && processState?.state === 'failed') {
        runtimeStates.set(product.id, { ...probe, state: 'failed', reason: processState.reason ?? probe.reason });
      } else if (!product.externallyManaged && !localAutostart && probe.state === 'starting') {
        runtimeStates.set(product.id, { ...probe, state: 'inactive', reason: `autostart disabled; ${probe.reason}` });
      } else {
        runtimeStates.set(product.id, probe);
      }
    }
    await atomicWriteJson(surfaceRegistryFile, buildSurfaceRuntimeRegistry(discovery, runtimeStates));
    await writeEcosystemStatus(stateRoot, discovery, runtimeStates, processStates);
    await writeDevelopmentShellState(stateRoot, appRoot, discovery, runtimeStates);
  } finally {
    refreshRunning = false;
  }
}

async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (monitor) clearInterval(monitor);
  if (koali && koali.exitCode === null && koali.signalCode === null) {
    try { koali.kill('SIGTERM'); } catch {}
  }
  await stopChildren(children, processStates);
  process.exit(code);
}

const catalog = await readEcosystemCatalog();
const discovery = await discoverEcosystem({ appRoot, catalog, workspacePath: workspaceFile });
await writeWorkspaceHints(workspaceFile, discovery);

const existingFrameSources = (process.env.KOALI_SPACES_FRAME_SRC ?? '').split(/\s+/).filter(Boolean);
const linkedFrameSources = discovery.products
  .filter((product) => product.integrationReady && product.embedBase)
  .map((product) => new URL(product.embedBase).origin);
process.env.KOALI_SPACES_FRAME_SRC = [...new Set([...existingFrameSources, ...linkedFrameSources])].join(' ');

log(`state root: ${stateRoot}`);
for (const product of discovery.products) {
  const source = product.externallyManaged ? 'external URL' : product.repoFound ? `${product.selectedVariant} linked` : 'missing';
  const contract = product.integrationReady ? 'owner contract ready' : `contract unavailable: ${product.discoveryReason ?? 'unknown'}`;
  log(`${product.publicName}: ${source}; ${contract}${product.embedBase ? ` -> ${product.embedBase}` : ''}`);
}
for (const source of discovery.sources) {
  log(`${source.publicName}: ${source.found ? 'linked' : 'not found'} (source-only)`);
}

await refresh(discovery);
if (autostartAll) {
  children = await startProductProcesses(discovery, processStates);
  await refresh(discovery);
} else {
  log('runtime autostart disabled globally (KOALI_ECOSYSTEM_AUTOSTART=0)');
}

monitor = setInterval(() => {
  void refresh(discovery).catch((error) => console.error('[koali:ecosystem] monitor error', error));
}, Number(process.env.KOALI_ECOSYSTEM_POLL_MS || 2500));
monitor.unref?.();

koali = spawn(process.execPath, [path.join(appRoot, 'server', 'main.mjs')], {
  cwd: appRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    KOALI_SPACES_STATE_ROOT: stateRoot,
    KOALI_SPACES_SURFACE_REGISTRY: surfaceRegistryFile,
    KOALI_SPACES_DEV_FALLBACK: '1',
  },
});

koali.once('error', (error) => {
  console.error('[koali:ecosystem] Koali failed to start:', error);
  void shutdown(1);
});
koali.once('exit', (code, signal) => {
  if (shuttingDown) return;
  log(`Koali exited (${signal ?? code ?? 'unknown'})`);
  void shutdown(code ?? 1);
});

process.once('SIGINT', () => void shutdown(0));
process.once('SIGTERM', () => void shutdown(0));
