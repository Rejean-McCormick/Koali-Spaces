import fs from 'node:fs/promises';
import path from 'node:path';

function defaultRuntimeState(product) {
  if ((!product.repoFound && !product.externallyManaged) || !product.integrationReady) return 'missing';
  return 'starting';
}

export function buildSurfaceRuntimeRegistry(discovery, runtimeStates = new Map()) {
  const runtimeRegistrations = [];
  const presentationPolicies = [];
  const resolvedTargets = [];
  const runtimeObservations = [];
  const healthObservations = [];
  const observedAt = new Date().toISOString();

  for (const product of discovery.products) {
    const runtimeRef = `runtime.${product.id}.web`;
    const healthRef = `health.${product.id}.web`;
    const transportProfileRef = `transport.${product.id}.local`;
    const current = runtimeStates.get(product.id) ?? { state: defaultRuntimeState(product), reason: product.discoveryReason ?? undefined };

    runtimeRegistrations.push({
      registrationId: `${product.id}.web`,
      moduleId: product.moduleId,
      adapter: 'web_app',
      runtimeRef,
      healthRef,
      lifecycleProfileRef: `lifecycle.${product.id}.linked-repo`,
      transportProfileRef,
      offlineClass: 'local_optional',
      embedPolicy: 'supported',
    });
    presentationPolicies.push({
      moduleId: product.moduleId,
      accentTokenRef: product.accentTokenRef,
      allowedModes: ['framed', 'immersive'],
      defaultMode: 'framed',
      chromeProfile: 'minimal',
    });
    if (product.integrationReady && product.embedBase) {
      resolvedTargets.push({
        transportProfileRef,
        moduleId: product.moduleId,
        embedBase: product.embedBase,
        iframeTitle: product.publicName,
        sandboxTokens: ['allow-scripts', 'allow-same-origin', 'allow-forms', 'allow-modals', 'allow-popups', 'allow-downloads'],
        browserPermissions: ['clipboard-read', 'clipboard-write', 'fullscreen'],
      });
    }
    runtimeObservations.push({
      runtimeRef,
      state: current.state,
      observedAt,
      ...(current.reason ? { reason: current.reason } : {}),
    });
    healthObservations.push({
      healthRef,
      state: current.state === 'ready' ? 'ready' : current.state === 'degraded' ? 'degraded' : current.state === 'failed' ? 'failed' : 'unknown',
      observedAt,
      ...(current.reason ? { reason: current.reason } : {}),
    });
  }

  return {
    schemaVersion: 1,
    runtimeRegistrations,
    presentationPolicies,
    resolvedTargets,
    runtimeObservations,
    healthObservations,
  };
}

export async function atomicWriteJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.tmp-${process.pid}`;
  await fs.writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await fs.rename(temp, filePath);
}

export async function writeSurfaceRuntimeRegistry(stateRoot, discovery, runtimeStates = new Map()) {
  const filePath = path.join(stateRoot, 'surface-runtime.json');
  await atomicWriteJson(filePath, buildSurfaceRuntimeRegistry(discovery, runtimeStates));
  return filePath;
}

export async function writeEcosystemStatus(stateRoot, discovery, runtimeStates = new Map(), processStates = new Map()) {
  const value = {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    discovery: {
      discoveredAt: discovery.discoveredAt,
      products: discovery.products.map((product) => ({
        id: product.id,
        moduleId: product.moduleId,
        publicName: product.publicName,
        repoFound: product.repoFound,
        repoPath: product.repoPath,
        selectedVariant: product.selectedVariant,
        availableVariants: product.variants.filter((variant) => variant.found).map((variant) => ({ id: variant.id, path: variant.path })),
        externallyManaged: product.externallyManaged,
        integrationReady: product.integrationReady,
        integrationOwner: product.integration?.owner ?? null,
        integrationFile: product.integration?.filePath ?? null,
        embedBase: product.embedBase,
      })),
      sources: discovery.sources.map((source) => ({
        id: source.id,
        publicName: source.publicName,
        found: source.found,
        repoPath: source.path,
      })),
    },
    runtimes: Object.fromEntries([...runtimeStates.entries()]),
    processes: Object.fromEntries([...processStates.entries()]),
  };
  const filePath = path.join(stateRoot, 'ecosystem-status.json');
  await atomicWriteJson(filePath, value);
  return filePath;
}
