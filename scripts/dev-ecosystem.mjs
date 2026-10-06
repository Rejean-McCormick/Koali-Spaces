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
import { qualifySources } from '../server/ecosystem/source-qualification.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const stateRoot = path.resolve(process.env.KOALI_SPACES_STATE_ROOT || path.join(appRoot, '.koali-dev', 'state'));
const surfaceRegistryFile = path.resolve(process.env.KOALI_SPACES_SURFACE_REGISTRY || path.join(stateRoot, 'surface-runtime.json'));
const workspaceFile = path.resolve(process.env.KOALI_ECOSYSTEM_WORKSPACE || path.join(appRoot, '.koali-dev', 'workspace.json'));
process.env.KOALI_ECOSYSTEM_WORKSPACE = workspaceFile;
const autostartAll = !['0', 'false', 'no', 'off'].includes((process.env.KOALI_ECOSYSTEM_AUTOSTART ?? '1').toLowerCase());
const processStates = new Map();
const runtimeStates = new Map();
let sourceStates = new Map();
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


function requiredAdmissionIssues(discovery, sourceStates) {
  const issues = [];
  for (const product of discovery.products ?? []) {
    if (product.requiredForBootstrap !== true) continue;
    if (!product.repoFound && !product.externallyManaged) issues.push(`${product.publicName}: repository missing`);
    else if (!product.integrationReady) issues.push(`${product.publicName}: ${product.discoveryReason ?? 'integration contract unavailable'}`);
  }
  for (const source of discovery.sources ?? []) {
    if (source.requiredForBootstrap !== true) continue;
    const qualified = sourceStates.get(source.id);
    if (qualified?.state !== 'ready') issues.push(`${source.publicName}: ${qualified?.state ?? 'unqualified'} — ${qualified?.reason ?? 'qualification failed'}`);
  }
  return issues;
}

async function waitForRequiredProducts(discovery) {
  const required = discovery.products.filter((product) => product.requiredForBootstrap === true);
  const timeoutMs = Math.max(5000, Number(process.env.KOALI_ECOSYSTEM_STARTUP_TIMEOUT_MS || 180000));
  const pollMs = Math.max(250, Number(process.env.KOALI_ECOSYSTEM_STARTUP_POLL_MS || 1000));
  const deadline = Date.now() + timeoutMs;
  let pending = required;
  while (Date.now() <= deadline) {
    await refresh(discovery);
    const failedProcesses = required.filter((product) => processStates.get(product.id)?.state === 'failed');
    if (failedProcesses.length) {
      throw new Error(`required product process failed: ${failedProcesses.map((product) => `${product.publicName} (${processStates.get(product.id)?.reason ?? 'unknown'})`).join('; ')}`);
    }
    pending = required.filter((product) => runtimeStates.get(product.id)?.state !== 'ready');
    if (!pending.length) {
      log(`all ${required.length} required product(s) are ready`);
      return;
    }
    log(`startup waiting: ${pending.map((product) => `${product.publicName}=${runtimeStates.get(product.id)?.state ?? 'unknown'}`).join(', ')}`);
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  throw new Error(`required products did not become ready within ${timeoutMs}ms: ${pending.map((product) => `${product.publicName}=${runtimeStates.get(product.id)?.state ?? 'unknown'} (${runtimeStates.get(product.id)?.reason ?? 'no readiness observation'})`).join('; ')}`);
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
      if (processState?.state === 'failed') {
        runtimeStates.set(product.id, { ...probe, state: 'failed', reason: processState.reason ?? probe.reason });
      } else if (!product.externallyManaged && !localAutostart && probe.state === 'starting') {
        runtimeStates.set(product.id, { ...probe, state: 'inactive', reason: `autostart disabled; ${probe.reason}` });
      } else {
        runtimeStates.set(product.id, probe);
        if (probe.state === 'ready' && processState?.state === 'starting') processState.state = 'running';
      }
    }
    await atomicWriteJson(surfaceRegistryFile, buildSurfaceRuntimeRegistry(discovery, runtimeStates));
    await writeEcosystemStatus(stateRoot, discovery, runtimeStates, processStates, sourceStates);
    await writeDevelopmentShellState(stateRoot, appRoot, discovery, runtimeStates, sourceStates);
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
sourceStates = await qualifySources(discovery);
const admissionIssues = requiredAdmissionIssues(discovery, sourceStates);
if (admissionIssues.length) {
  for (const issue of admissionIssues) console.error(`[koali:ecosystem] admission failed: ${issue}`);
  process.exit(2);
}

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
  const qualification = sourceStates.get(source.id);
  log(`${source.publicName}: ${source.found ? 'linked' : 'not found'}; ${qualification?.state ?? 'unqualified'}${qualification?.reason ? ` — ${qualification.reason}` : ''}`);
}

await refresh(discovery);
if (autostartAll) {
  children = await startProductProcesses(discovery, processStates);
  try {
    await waitForRequiredProducts(discovery);
  } catch (error) {
    console.error(`[koali:ecosystem] startup qualification failed: ${error instanceof Error ? error.message : error}`);
    await stopChildren(children, processStates);
    process.exit(3);
  }
} else {
  log('runtime autostart disabled globally (KOALI_ECOSYSTEM_AUTOSTART=0)');
  const required = discovery.products.filter((product) => product.requiredForBootstrap === true);
  if (required.length) {
    console.error(`[koali:ecosystem] autostart cannot be disabled for the complete profile; ${required.length} required product(s) are declared`);
    process.exit(3);
  }
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
