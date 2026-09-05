'use client';

import { useState, type PropsWithChildren } from 'react';
import ActiveModuleSidebar from './ActiveModuleSidebar';
import MainPageSurface from './MainPageSurface';
import ModuleSelector from './ModuleSelector';
import SharedTopBar from './SharedTopBar';
import SkipLinks from './SkipLinks';

export default function GlobalShell({ children }: PropsWithChildren) {
  const [drawer, setDrawer] = useState(false);
  return (
    <div className="koa-frame">
      <SkipLinks />
      <div className="koa-module-selector"><ModuleSelector /></div>
      <div className="koa-topbar-region"><SharedTopBar onMenu={() => setDrawer(true)} /></div>
      <ActiveModuleSidebar mobileOpen={drawer} onMobileClose={() => setDrawer(false)} />
      <div className="koa-content"><MainPageSurface>{children}</MainPageSurface></div>
    </div>
  );
}
