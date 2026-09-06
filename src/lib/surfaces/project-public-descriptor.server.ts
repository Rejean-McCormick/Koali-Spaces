import type { ModuleManifest, SpaceDefinition } from '@/types/contracts';
import { joinEmbedTarget } from './url-policy';
import { presentationLabel } from './presentation-policy';
import type { ResolvedSurfaceInternal, SurfaceDescriptorPublic } from './types';

export function projectPublicDescriptor(
  internal: ResolvedSurfaceInternal,
  space: SpaceDefinition | null,
  manifest: ModuleManifest,
): SurfaceDescriptorPublic {
  const descriptor: SurfaceDescriptorPublic = {
    surfaceId: `${internal.spaceId}:${internal.moduleId}:${internal.routeId}`,
    moduleId: internal.moduleId,
    routeId: internal.routeId,
    kind: internal.kind,
    status: internal.status,
    presentation: {
      label: presentationLabel(space, manifest),
      accentTokenRef: space?.appearance.allow_module_accent === false ? undefined : internal.presentation.accentTokenRef,
      immersiveAllowed: internal.presentation.allowedModes.includes('immersive'),
      defaultMode: internal.presentation.defaultMode,
    },
  };

  if (
    internal.kind === 'local_module_surface' &&
    internal.target &&
    internal.status.access === 'allowed' &&
    (internal.status.runtime === 'ready' || internal.status.runtime === 'degraded')
  ) {
    descriptor.target = {
      embedSrc: joinEmbedTarget(internal.target.embedBase, internal.routePath),
      iframeTitle: internal.target.iframeTitle ?? `${descriptor.presentation.label} application`,
      sandboxTokens: [...internal.target.sandboxTokens],
      browserPermissions: [...internal.target.browserPermissions],
      bridgeProtocolRef: internal.target.bridgeProtocolRef,
    };
  }

  return descriptor;
}
