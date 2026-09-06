'use client';

import type { SurfaceDescriptorPublic } from '@/lib/surfaces/types';
import ApplicationHost from './ApplicationHost';
import LocalShellPageSurface from './LocalShellPageSurface';
import RegisteredComponentSurface from './RegisteredComponentSurface';

export default function SurfaceRenderer({ descriptor }: { descriptor: SurfaceDescriptorPublic }) {
  switch (descriptor.kind) {
    case 'local_shell_page':
      return <LocalShellPageSurface descriptor={descriptor} />;
    case 'registered_component_surface':
      return <RegisteredComponentSurface descriptor={descriptor} />;
    case 'local_module_surface':
      return <ApplicationHost descriptor={descriptor} />;
  }
}
