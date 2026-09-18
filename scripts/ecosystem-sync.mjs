import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readEcosystemCatalog } from '../server/ecosystem/catalog.mjs';
import { discoverEcosystem, publicDiscovery, writeWorkspaceHints } from '../server/ecosystem/discovery.mjs';
import { probeProduct } from '../tools/workspace-launcher/manifest-runner.mjs';
import { atomicWriteJson, buildSurfaceRuntimeRegistry, writeEcosystemStatus } from '../server/ecosystem/runtime-state.mjs';
import { writeDevelopmentShellState } from '../server/ecosystem/shell-state-compiler.mjs';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stateRoot = path.resolve(process.env.KOALI_SPACES_STATE_ROOT || path.join(appRoot, '.koali-dev', 'state'));
const registryPath = path.resolve(process.env.KOALI_SPACES_SURFACE_REGISTRY || path.join(stateRoot, 'surface-runtime.json'));
const workspacePath = path.resolve(process.env.KOALI_ECOSYSTEM_WORKSPACE || path.join(appRoot, '.koali-dev', 'workspace.json'));
const catalog = await readEcosystemCatalog();
const discovery = await discoverEcosystem({ appRoot, catalog, workspacePath });
await writeWorkspaceHints(workspacePath, discovery);
const runtimeStates = new Map();

for (const product of discovery.products) {
  if (!product.repoFound && !product.externallyManaged) {
    runtimeStates.set(product.id, { state: 'missing', reason: product.discoveryReason ?? 'repository not found' });
  } else {
    runtimeStates.set(product.id, await probeProduct(product));
  }
}
await atomicWriteJson(registryPath, buildSurfaceRuntimeRegistry(discovery, runtimeStates));
await writeEcosystemStatus(stateRoot, discovery, runtimeStates, new Map());
await writeDevelopmentShellState(stateRoot, appRoot, discovery, runtimeStates);
console.log(JSON.stringify({ ...publicDiscovery(discovery), stateRoot, registryPath }, null, 2));
