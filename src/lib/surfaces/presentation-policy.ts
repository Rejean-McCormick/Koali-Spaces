import type { ModuleManifest, SpaceDefinition } from '@/types/contracts';
import type { SurfacePresentationPolicy } from './types';

export function defaultPresentationPolicy(
  moduleId: string,
  manifest: ModuleManifest,
): SurfacePresentationPolicy {
  return {
    moduleId,
    labelKey: undefined,
    accentTokenRef: undefined,
    allowedModes: ['framed'],
    defaultMode: 'framed',
    chromeProfile: 'minimal',
  };
}

export function presentationLabel(
  space: SpaceDefinition | null,
  manifest: ModuleManifest,
) {
  return (
    space?.module_instances.find((instance) => instance.module_id === manifest.module_id)
      ?.public_label ?? manifest.public_name
  );
}
