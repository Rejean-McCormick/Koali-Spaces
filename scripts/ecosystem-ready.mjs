import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readEcosystemCatalog } from '../server/ecosystem/catalog.mjs';
import { discoverEcosystem, writeWorkspaceHints } from '../server/ecosystem/discovery.mjs';
import { probeProduct } from '../tools/workspace-launcher/manifest-runner.mjs';
import { atomicWriteJson, buildSurfaceRuntimeRegistry, writeEcosystemStatus } from '../server/ecosystem/runtime-state.mjs';
import { writeDevelopmentShellState } from '../server/ecosystem/shell-state-compiler.mjs';
import { qualifySources } from '../server/ecosystem/source-qualification.mjs';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stateRoot = path.resolve(process.env.KOALI_SPACES_STATE_ROOT || path.join(appRoot, '.koali-dev', 'state'));
const registryPath = path.resolve(process.env.KOALI_SPACES_SURFACE_REGISTRY || path.join(stateRoot, 'surface-runtime.json'));
const workspacePath = path.resolve(process.env.KOALI_ECOSYSTEM_WORKSPACE || path.join(appRoot, '.koali-dev', 'workspace.json'));
const timeoutMs = Math.max(1000, Number(process.env.KOALI_ECOSYSTEM_READY_TIMEOUT_MS || 60000));
const pollMs = Math.max(250, Number(process.env.KOALI_ECOSYSTEM_READY_POLL_MS || 1000));
const deadline = Date.now() + timeoutMs;
const catalog = await readEcosystemCatalog();
const discovery = await discoverEcosystem({ appRoot, catalog, workspacePath });
await writeWorkspaceHints(workspacePath, discovery);
const sourceStates = await qualifySources(discovery);
const requiredForBootstrap = (product) => product.requiredForBootstrap === true;
const requiredProducts = discovery.products.filter(requiredForBootstrap);

for (const product of discovery.products) {
  if (!product.repoFound && !product.externallyManaged) {
    const level = requiredForBootstrap(product) ? 'error' : 'warn';
    console[level](`[koali:ready] ${product.publicName}: repository missing${requiredForBootstrap(product) ? '' : ' (optional)'}`);
    if (requiredForBootstrap(product)) process.exitCode = 2;
  } else if (!product.integrationReady) {
    const level = requiredForBootstrap(product) ? 'error' : 'warn';
    console[level](`[koali:ready] ${product.publicName}: owner integration contract unavailable (${product.discoveryReason ?? 'unknown'})${requiredForBootstrap(product) ? '' : ' (optional)'}`);
    if (requiredForBootstrap(product)) process.exitCode = 2;
  }
}
for (const source of discovery.sources) {
  if (source.requiredForBootstrap !== true) continue;
  const state = sourceStates.get(source.id);
  if (state?.state !== 'ready') {
    console.error(`[koali:ready] ${source.publicName}: ${state?.state ?? 'unknown'} — ${state?.reason ?? 'qualification unavailable'}`);
    process.exitCode = 2;
  }
}
if (process.exitCode) process.exit(process.exitCode);

let lastStates = new Map();
while (Date.now() <= deadline) {
  const states = new Map();
  await Promise.all(discovery.products.map(async (product) => {
    states.set(product.id, await probeProduct(product));
  }));
  lastStates = states;
  await atomicWriteJson(registryPath, buildSurfaceRuntimeRegistry(discovery, states));
  await writeEcosystemStatus(stateRoot, discovery, states, new Map(), sourceStates);
  await writeDevelopmentShellState(stateRoot, appRoot, discovery, states, sourceStates);
  const pending = requiredProducts.filter((product) => states.get(product.id)?.state !== 'ready');
  if (pending.length === 0) {
    console.log(`[koali:ready] Koali shell ready; ${requiredProducts.length} required owner product(s) ready`);
    process.exit(0);
  }
  console.log(`[koali:ready] waiting: ${pending.map((product) => `${product.publicName}=${states.get(product.id)?.state ?? 'unknown'}`).join(', ')}`);
  await new Promise((resolve) => setTimeout(resolve, pollMs));
}

for (const product of requiredProducts) {
  const state = lastStates.get(product.id);
  if (state?.state !== 'ready') console.error(`[koali:ready] ${product.publicName}: ${state?.state ?? 'unknown'} — ${state?.reason ?? 'no observation'}`);
}
process.exit(1);
