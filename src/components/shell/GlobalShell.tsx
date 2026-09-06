'use client';

import { useEffect, useState, type PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import { moduleIdFromKoaliPath } from '@/lib/registry';
import { useSurfaceMode } from '@/providers/SurfaceModeProvider';
import ActiveModuleSidebar from './ActiveModuleSidebar';
import MainPageSurface from './MainPageSurface';
import ModuleSelector from './ModuleSelector';
import SharedTopBar from './SharedTopBar';
import SkipLinks from './SkipLinks';

export default function GlobalShell({ children }: PropsWithChildren) {
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();
  const outerModuleId = moduleIdFromKoaliPath(pathname);
  const { moduleId, mode, setSurface } = useSurfaceMode();

  useEffect(() => {
    if (!outerModuleId) setSurface('__koali_shell__', 'framed');
  }, [outerModuleId, setSurface]);

  const immersive = Boolean(outerModuleId && moduleId === outerModuleId && mode === 'immersive');

  useEffect(() => {
    if (immersive) setDrawer(false);
  }, [immersive]);
  return (
    <div className={`koa-frame ${immersive ? 'koa-frame-immersive' : ''}`}>
      {!immersive ? <SkipLinks /> : null}
      <div className="koa-module-selector"><ModuleSelector /></div>
      <div className="koa-topbar-region"><SharedTopBar onMenu={() => setDrawer(true)} /></div>
      <ActiveModuleSidebar mobileOpen={drawer} onMobileClose={() => setDrawer(false)} />
      <div className="koa-content"><MainPageSurface>{children}</MainPageSurface></div>
    </div>
  );
}
