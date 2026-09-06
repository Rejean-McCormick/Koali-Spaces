import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { validateRegisteredEmbedBase } from './url-policy';
import { isSafeAccentTokenRef } from './accent-policy';
import { SURFACE_BROWSER_PERMISSIONS, SURFACE_SANDBOX_TOKENS } from './embed-policy';
import type {
  HealthObservation,
  RuntimeObservation,
  RuntimeRegistration,
  SurfacePresentationPolicy,
  SurfaceRuntimeRegistry,
  SurfaceTargetRegistration,
} from './types';

const displayMode = z.enum(['framed', 'immersive']);
const runtimeState = z.enum(['inactive', 'starting', 'ready', 'degraded', 'failed', 'missing']);

const sandboxToken = z.enum(SURFACE_SANDBOX_TOKENS);
const browserPermission = z.enum(SURFACE_BROWSER_PERMISSIONS);

const runtimeRegistration = z.object({
  registrationId: z.string().min(1),
  moduleId: z.string().regex(/^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$/),
  adapter: z.enum(['web_app', 'registered_component', 'shell_page']),
  artifactRef: z.string().min(1).optional(),
  runtimeRef: z.string().min(1),
  healthRef: z.string().min(1).optional(),
  lifecycleProfileRef: z.string().min(1).optional(),
  transportProfileRef: z.string().min(1).optional(),
  offlineClass: z.enum(['local_required', 'local_optional', 'network_optional']),
  embedPolicy: z.enum(['required', 'supported', 'not_supported']),
}).superRefine((value, ctx) => {
  if (value.adapter === 'web_app' && value.embedPolicy !== 'not_supported' && !value.transportProfileRef) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['transportProfileRef'], message: 'embeddable web_app runtime requires transportProfileRef' });
  }
});

const presentationPolicy = z.object({
  moduleId: z.string().regex(/^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$/),
  labelKey: z.string().min(1).optional(),
  accentTokenRef: z.string().min(1).refine(isSafeAccentTokenRef, 'invalid accent token reference').optional(),
  allowedModes: z.array(displayMode).min(1).refine((items) => new Set(items).size === items.length, 'duplicate display mode'),
  defaultMode: displayMode,
  chromeProfile: z.literal('minimal'),
}).superRefine((value, ctx) => {
  if (!value.allowedModes.includes(value.defaultMode)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'defaultMode must be included in allowedModes' });
  }
});

const resolvedTarget = z.object({
  transportProfileRef: z.string().min(1),
  moduleId: z.string().regex(/^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$/),
  embedBase: z.string().min(1),
  iframeTitle: z.string().min(1).optional(),
  sandboxTokens: z.array(sandboxToken).refine((items) => new Set(items).size === items.length, 'duplicate iframe sandbox token'),
  browserPermissions: z.array(browserPermission).refine((items) => new Set(items).size === items.length, 'duplicate browser permission'),
  bridgeProtocolRef: z.string().min(1).optional(),
}).superRefine((value, ctx) => {
  let normalized: string;
  try {
    normalized = validateRegisteredEmbedBase(value.embedBase);
  } catch (error) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['embedBase'], message: error instanceof Error ? error.message : 'invalid embed base' });
    return;
  }
  if (normalized.startsWith('/') && value.sandboxTokens.includes('allow-scripts') && value.sandboxTokens.includes('allow-same-origin')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sandboxTokens'], message: 'same-origin embed cannot combine allow-scripts and allow-same-origin' });
  }
});

const runtimeObservation = z.object({
  runtimeRef: z.string().min(1),
  state: runtimeState,
  observedAt: z.string().min(1).optional(),
  reason: z.string().optional(),
});

const healthObservation = z.object({
  healthRef: z.string().min(1),
  state: z.enum(['ready', 'degraded', 'failed', 'unknown']),
  observedAt: z.string().min(1).optional(),
  reason: z.string().optional(),
});

const registrySchema = z.object({
  schemaVersion: z.literal(1),
  runtimeRegistrations: z.array(runtimeRegistration),
  presentationPolicies: z.array(presentationPolicy),
  resolvedTargets: z.array(resolvedTarget),
  runtimeObservations: z.array(runtimeObservation).optional(),
  healthObservations: z.array(healthObservation).optional(),
});

export const EMPTY_SURFACE_RUNTIME_REGISTRY: SurfaceRuntimeRegistry = Object.freeze({
  schemaVersion: 1 as const,
  runtimeRegistrations: [],
  presentationPolicies: [],
  resolvedTargets: [],
  runtimeObservations: [],
  healthObservations: [],
});

function assertUnique(values: string[], label: string) {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} contains duplicate identities`);
  }
}

export function validateSurfaceRuntimeRegistry(value: unknown): SurfaceRuntimeRegistry {
  const parsed = registrySchema.parse(value) as SurfaceRuntimeRegistry;
  assertUnique(parsed.runtimeRegistrations.map((item) => item.registrationId), 'runtimeRegistrations');
  assertUnique(parsed.runtimeRegistrations.map((item) => item.moduleId), 'runtimeRegistrations moduleId');
  assertUnique(parsed.presentationPolicies.map((item) => item.moduleId), 'presentationPolicies moduleId');
  assertUnique(parsed.resolvedTargets.map((item) => `${item.moduleId}:${item.transportProfileRef}`), 'resolvedTargets');
  assertUnique((parsed.runtimeObservations ?? []).map((item) => item.runtimeRef), 'runtimeObservations runtimeRef');
  assertUnique((parsed.healthObservations ?? []).map((item) => item.healthRef), 'healthObservations healthRef');
  return parsed;
}

export function surfaceRegistryPath() {
  if (process.env.KOALI_SPACES_SURFACE_REGISTRY) {
    return path.resolve(process.env.KOALI_SPACES_SURFACE_REGISTRY);
  }
  const root = process.env.KOALI_SPACES_STATE_ROOT || '/var/lib/koa/integrations/koa-spaces';
  return path.join(root, 'surface-runtime.json');
}

export async function readSurfaceRuntimeRegistry(): Promise<SurfaceRuntimeRegistry> {
  try {
    const raw = JSON.parse(await fs.readFile(surfaceRegistryPath(), 'utf8')) as unknown;
    return validateSurfaceRuntimeRegistry(raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return EMPTY_SURFACE_RUNTIME_REGISTRY;
    console.error('Koali Spaces surface runtime registry rejected:', error);
    return EMPTY_SURFACE_RUNTIME_REGISTRY;
  }
}

export function runtimeRegistrationFor(
  registry: SurfaceRuntimeRegistry,
  moduleId: string,
): RuntimeRegistration | null {
  return registry.runtimeRegistrations.find((item) => item.moduleId === moduleId) ?? null;
}

export function presentationPolicyFor(
  registry: SurfaceRuntimeRegistry,
  moduleId: string,
): SurfacePresentationPolicy | null {
  return registry.presentationPolicies.find((item) => item.moduleId === moduleId) ?? null;
}

export function targetFor(
  registry: SurfaceRuntimeRegistry,
  moduleId: string,
  transportProfileRef: string | undefined,
): SurfaceTargetRegistration | null {
  if (!transportProfileRef) return null;
  return registry.resolvedTargets.find(
    (item) => item.moduleId === moduleId && item.transportProfileRef === transportProfileRef,
  ) ?? null;
}

export function runtimeObservationFor(
  registry: SurfaceRuntimeRegistry,
  runtimeRef: string,
): RuntimeObservation | null {
  return (registry.runtimeObservations ?? []).find((item) => item.runtimeRef === runtimeRef) ?? null;
}

export function healthObservationFor(
  registry: SurfaceRuntimeRegistry,
  healthRef: string | undefined,
): HealthObservation | null {
  if (!healthRef) return null;
  return (registry.healthObservations ?? []).find((item) => item.healthRef === healthRef) ?? null;
}
