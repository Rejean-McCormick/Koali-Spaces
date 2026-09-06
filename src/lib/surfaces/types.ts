import type { SurfaceBrowserPermission, SurfaceSandboxToken } from './embed-policy';

export type SurfaceKind =
  | 'local_shell_page'
  | 'registered_component_surface'
  | 'local_module_surface';

export type SurfaceDisplayMode = 'framed' | 'immersive';

export type SurfaceStatus = {
  access: 'allowed' | 'blocked';
  runtime: 'inactive' | 'starting' | 'ready' | 'degraded' | 'failed' | 'missing';
  connectivity: 'online' | 'offline' | 'unknown';
  render: 'idle' | 'resolving' | 'loading' | 'ready' | 'error';
};

export type RuntimeRegistration = {
  registrationId: string;
  moduleId: string;
  adapter: 'web_app' | 'registered_component' | 'shell_page';
  artifactRef?: string;
  runtimeRef: string;
  healthRef?: string;
  lifecycleProfileRef?: string;
  transportProfileRef?: string;
  offlineClass: 'local_required' | 'local_optional' | 'network_optional';
  embedPolicy: 'required' | 'supported' | 'not_supported';
};

export type SurfacePresentationPolicy = {
  moduleId: string;
  labelKey?: string;
  accentTokenRef?: string;
  allowedModes: SurfaceDisplayMode[];
  defaultMode: SurfaceDisplayMode;
  chromeProfile: 'minimal';
};

export type RuntimeObservation = {
  runtimeRef: string;
  state: SurfaceStatus['runtime'];
  observedAt?: string;
  reason?: string;
};

export type HealthObservation = {
  healthRef: string;
  state: 'ready' | 'degraded' | 'failed' | 'unknown';
  observedAt?: string;
  reason?: string;
};

/**
 * A pre-resolved presentation target supplied by the trusted Koali control side.
 * This does not define the canonical transport catalogue (OPEN-KS-SURF-001).
 */
export type SurfaceTargetRegistration = {
  transportProfileRef: string;
  moduleId: string;
  embedBase: string;
  iframeTitle?: string;
  sandboxTokens: SurfaceSandboxToken[];
  browserPermissions: SurfaceBrowserPermission[];
  bridgeProtocolRef?: string;
};

export type SurfaceRuntimeRegistry = {
  schemaVersion: 1;
  runtimeRegistrations: RuntimeRegistration[];
  presentationPolicies: SurfacePresentationPolicy[];
  resolvedTargets: SurfaceTargetRegistration[];
  runtimeObservations?: RuntimeObservation[];
  healthObservations?: HealthObservation[];
};

export type ResolvedSurfaceInternal = {
  kind: SurfaceKind;
  spaceId: string;
  moduleId: string;
  routeId: string;
  routePath: string;
  pageRef: string;
  entrypoint?: string | null;
  runtime?: {
    registrationId: string;
    runtimeRef: string;
    healthRef?: string;
    lifecycleProfileRef?: string;
    transportProfileRef?: string;
  };
  status: SurfaceStatus;
  presentation: SurfacePresentationPolicy;
  target?: SurfaceTargetRegistration;
};

export type SurfaceDescriptorPublic = {
  surfaceId: string;
  moduleId: string;
  routeId: string;
  kind: SurfaceKind;
  status: SurfaceStatus;
  presentation: {
    label: string;
    accentTokenRef?: string;
    immersiveAllowed: boolean;
    /** Optional in v1.1 descriptors for backwards compatibility; defaults to framed. */
    defaultMode?: SurfaceDisplayMode;
  };
  target?: {
    embedSrc: string;
    iframeTitle: string;
    sandboxTokens: SurfaceSandboxToken[];
    browserPermissions: SurfaceBrowserPermission[];
    bridgeProtocolRef?: string;
  };
};

export type SurfaceErrorCode =
  | 'KS_SURFACE_MODULE_UNKNOWN'
  | 'KS_SURFACE_ROUTE_UNKNOWN'
  | 'KS_SURFACE_CAPABILITY_DENIED'
  | 'KS_SURFACE_REGISTRATION_MISSING'
  | 'KS_SURFACE_TARGET_REJECTED'
  | 'KS_SURFACE_RUNTIME_UNAVAILABLE'
  | 'KS_SURFACE_HEALTH_NOT_READY'
  | 'KS_SURFACE_EMBED_BLOCKED'
  | 'KS_SURFACE_RUNTIME_ERROR';

export type SurfaceResolutionFailure = {
  ok: false;
  error: {
    code: SurfaceErrorCode;
    message: string;
    moduleId: string;
    requestedPath: string;
  };
};

export type SurfaceResolutionSuccess = {
  ok: true;
  internal: ResolvedSurfaceInternal;
  descriptor: SurfaceDescriptorPublic;
};

export type SurfaceResolutionResult =
  | SurfaceResolutionSuccess
  | SurfaceResolutionFailure;
