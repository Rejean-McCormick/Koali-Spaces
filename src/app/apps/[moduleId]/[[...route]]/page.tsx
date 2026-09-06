import SurfaceRenderer from '@/components/surfaces/SurfaceRenderer';
import { SurfaceResolutionErrorView } from '@/components/surfaces/SurfaceStatusView';
import { readServerShellState } from '@/lib/shell-state.server';
import { resolveSurfaceFromState } from '@/lib/surfaces/resolve-surface.server';
import { readSurfaceRuntimeRegistry } from '@/lib/surfaces/runtime-registry.server';

type ModuleSurfaceProps = {
  params: Promise<{
    moduleId: string;
    route?: string[];
  }>;
};

export const dynamic = 'force-dynamic';

export default async function ModuleSurface({ params }: ModuleSurfaceProps) {
  const { moduleId, route } = await params;
  const [state, registry] = await Promise.all([
    readServerShellState(),
    readSurfaceRuntimeRegistry(),
  ]);
  const result = resolveSurfaceFromState({ state, registry, moduleId, routeSegments: route });

  if (!result.ok) {
    return <SurfaceResolutionErrorView code={result.error.code} message={result.error.message} />;
  }
  return <SurfaceRenderer descriptor={result.descriptor} />;
}
