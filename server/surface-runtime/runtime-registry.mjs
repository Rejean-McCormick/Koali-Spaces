import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../runtime-config.mjs';
import { assertResolvedEmbedBase } from './transport-registry.mjs';

const RUNTIME_STATES = new Set(['inactive', 'starting', 'ready', 'degraded', 'failed', 'missing']);
const HEALTH_STATES = new Set(['ready', 'degraded', 'failed', 'unknown']);
const OFFLINE_CLASSES = new Set(['local_required', 'local_optional', 'network_optional']);
const EMBED_POLICIES = new Set(['required', 'supported', 'not_supported']);
const MODULE_ID = /^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$/;
const ACCENT_TOKEN_REF = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

const SANDBOX_TOKENS = new Set([
  'allow-downloads', 'allow-forms', 'allow-modals', 'allow-orientation-lock', 'allow-pointer-lock',
  'allow-popups', 'allow-popups-to-escape-sandbox', 'allow-presentation', 'allow-same-origin',
  'allow-scripts', 'allow-storage-access-by-user-activation', 'allow-top-navigation-by-user-activation',
]);

const BROWSER_PERMISSIONS = new Set([
  'autoplay', 'camera', 'clipboard-read', 'clipboard-write', 'display-capture',
  'encrypted-media', 'fullscreen', 'geolocation', 'microphone', 'payment',
  'picture-in-picture', 'publickey-credentials-get', 'screen-wake-lock', 'web-share',
]);

function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value;
}
function strings(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item)) throw new Error(`${label} must be an array of non-empty strings`);
  return value;
}
function unique(items, key, label) {
  const values = items.map(key);
  if (new Set(values).size !== values.length) throw new Error(`${label} contains duplicate identities`);
}
function uniqueStrings(items, label) {
  if (new Set(items).size !== items.length) throw new Error(`${label} contains duplicate values`);
}

export function surfaceRegistryFile() {
  return process.env.KOALI_SPACES_SURFACE_REGISTRY
    ? path.resolve(process.env.KOALI_SPACES_SURFACE_REGISTRY)
    : path.join(config.stateRoot, 'surface-runtime.json');
}

export function assertSurfaceRuntimeRegistry(value) {
  const registry = object(value, 'surface runtime registry');
  if (registry.schemaVersion !== 1) throw new Error('surface runtime registry schemaVersion must be 1');
  for (const key of ['runtimeRegistrations', 'presentationPolicies', 'resolvedTargets']) {
    if (!Array.isArray(registry[key])) throw new Error(`${key} must be an array`);
  }
  if (registry.runtimeObservations != null && !Array.isArray(registry.runtimeObservations)) throw new Error('runtimeObservations must be an array');
  if (registry.healthObservations != null && !Array.isArray(registry.healthObservations)) throw new Error('healthObservations must be an array');

  for (const item of registry.runtimeRegistrations) {
    object(item, 'runtime registration');
    if (!item.registrationId || !MODULE_ID.test(item.moduleId ?? '') || !item.runtimeRef) throw new Error('runtime registration identity incomplete or invalid');
    if (!['web_app', 'registered_component', 'shell_page'].includes(item.adapter)) throw new Error('unsupported runtime adapter');
    if (!OFFLINE_CLASSES.has(item.offlineClass)) throw new Error('invalid offline class');
    if (!EMBED_POLICIES.has(item.embedPolicy)) throw new Error('invalid embed policy');
    if (item.embedPolicy !== 'not_supported' && item.adapter === 'web_app' && !item.transportProfileRef) {
      throw new Error('embeddable web_app runtime requires transportProfileRef');
    }
  }
  unique(registry.runtimeRegistrations, (item) => item.registrationId, 'runtime registrations');
  unique(registry.runtimeRegistrations, (item) => item.moduleId, 'runtime registrations by module');

  for (const item of registry.presentationPolicies) {
    object(item, 'presentation policy');
    if (!MODULE_ID.test(item.moduleId ?? '') || item.chromeProfile !== 'minimal') throw new Error('invalid presentation policy');
    if (item.accentTokenRef != null && !ACCENT_TOKEN_REF.test(item.accentTokenRef)) throw new Error('invalid accent token reference');
    const modes = strings(item.allowedModes, 'allowedModes');
    uniqueStrings(modes, 'allowedModes');
    if (!modes.every((mode) => mode === 'framed' || mode === 'immersive') || !modes.includes(item.defaultMode)) throw new Error('invalid presentation mode policy');
  }
  unique(registry.presentationPolicies, (item) => item.moduleId, 'presentation policies');

  for (const item of registry.resolvedTargets) {
    object(item, 'resolved target');
    if (!item.transportProfileRef || !MODULE_ID.test(item.moduleId ?? '') || !item.embedBase) throw new Error('resolved target identity incomplete');
    item.embedBase = assertResolvedEmbedBase(item.embedBase);
    const sandboxTokens = strings(item.sandboxTokens, 'sandboxTokens');
    uniqueStrings(sandboxTokens, 'sandboxTokens');
    if (sandboxTokens.some((token) => !SANDBOX_TOKENS.has(token))) throw new Error('unsupported iframe sandbox token');
    const browserPermissions = strings(item.browserPermissions, 'browserPermissions');
    uniqueStrings(browserPermissions, 'browserPermissions');
    if (browserPermissions.some((token) => !BROWSER_PERMISSIONS.has(token))) throw new Error('unsupported browser permission token');
    if (item.embedBase.startsWith('/') && sandboxTokens.includes('allow-scripts') && sandboxTokens.includes('allow-same-origin')) {
      throw new Error('same-origin embed cannot combine allow-scripts and allow-same-origin');
    }
  }
  unique(registry.resolvedTargets, (item) => `${item.moduleId}:${item.transportProfileRef}`, 'resolved targets');

  for (const item of registry.runtimeObservations ?? []) {
    object(item, 'runtime observation');
    if (!item.runtimeRef || !RUNTIME_STATES.has(item.state)) throw new Error('invalid runtime observation');
  }
  unique(registry.runtimeObservations ?? [], (item) => item.runtimeRef, 'runtime observations');

  for (const item of registry.healthObservations ?? []) {
    object(item, 'health observation');
    if (!item.healthRef || !HEALTH_STATES.has(item.state)) throw new Error('invalid health observation');
  }
  unique(registry.healthObservations ?? [], (item) => item.healthRef, 'health observations');

  const targets = new Set(registry.resolvedTargets.map((item) => `${item.moduleId}:${item.transportProfileRef}`));
  for (const registration of registry.runtimeRegistrations) {
    if (registration.adapter === 'web_app' && registration.embedPolicy !== 'not_supported' && !targets.has(`${registration.moduleId}:${registration.transportProfileRef}`)) {
      // Missing target is allowed operationally so a runtime can be installed/admitted before its transport is ready.
      // Resolution remains unavailable/degraded; no fallback is invented.
      continue;
    }
  }
  return registry;
}

export async function readSurfaceRuntimeRegistry() {
  try {
    return assertSurfaceRuntimeRegistry(JSON.parse(await fs.readFile(surfaceRegistryFile(), 'utf8')));
  } catch (error) {
    if (error?.code === 'ENOENT') return { schemaVersion: 1, runtimeRegistrations: [], presentationPolicies: [], resolvedTargets: [], runtimeObservations: [], healthObservations: [] };
    throw error;
  }
}
