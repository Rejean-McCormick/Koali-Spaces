'use client';

import type { SurfaceDescriptorPublic } from '@/lib/surfaces/types';
import { REGISTERED_SURFACE_COMPONENTS } from './component-registry';
import SurfaceStatusView from './SurfaceStatusView';

export default function RegisteredComponentSurface({ descriptor }: { descriptor: SurfaceDescriptorPublic }) {
  const Component = REGISTERED_SURFACE_COMPONENTS[descriptor.routeId];
  if (!Component || descriptor.status.access === 'blocked') {
    return (
      <SurfaceStatusView
        descriptor={{
          ...descriptor,
          status: { ...descriptor.status, runtime: Component ? descriptor.status.runtime : 'missing' },
        }}
      />
    );
  }
  return <Component moduleId={descriptor.moduleId} routeId={descriptor.routeId} />;
}
