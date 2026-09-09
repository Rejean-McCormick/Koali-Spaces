'use client';

import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { activeManifest, moduleIdFromKoaliPath, visibleSidebarItems } from '@/lib/registry';
import {
  canonicalCurrentHref,
  KOALI_SURFACE_QUERY_PARAM,
  requestedSurfaceId,
  resolvedSurfaceProfile,
  surfaceSelectionIsAddressable,
} from '@/lib/shell-navigation-state';
import { useShell } from '@/providers/ShellProvider';
import { useSurfaceMode } from '@/providers/SurfaceModeProvider';
import ActiveModuleSidebar from './ActiveModuleSidebar';
import MainPageSurface from './MainPageSurface';
import ModuleSelector from './ModuleSelector';
import SharedTopBar from './SharedTopBar';
import SkipLinks from './SkipLinks';

export default function GlobalShell({ children }: PropsWithChildren) {
  const [drawer, setDrawer] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const outerModuleId = moduleIdFromKoaliPath(pathname);
  const { state } = useShell();
  const { moduleId, mode, setSurface } = useSurfaceMode();
  const manifest = activeManifest(state, pathname);
  const requestedSurface = requestedSurfaceId(searchParams);
  const activeSurface = manifest
    ? resolvedSurfaceProfile(manifest, state, requestedSurface)
    : null;
  const activeSurfaceId = activeSurface?.surface_id ?? null;
  const addressableSurface = manifest
    ? surfaceSelectionIsAddressable(manifest, state)
    : false;
  const sidebarItems = useMemo(
    () => manifest ? visibleSidebarItems(manifest, state, activeSurfaceId) : [],
    [manifest, state, activeSurfaceId],
  );
  const hasSidebar = sidebarItems.length > 0;

  useEffect(() => {
    if (!outerModuleId) setSurface('__koali_shell__', 'framed');
  }, [outerModuleId, setSurface]);

  const immersive = Boolean(outerModuleId && moduleId === outerModuleId && mode === 'immersive');

  useEffect(() => {
    if (immersive || !hasSidebar) setDrawer(false);
  }, [immersive, hasSidebar]);

  useEffect(() => {
    if (!manifest) return;
    const currentRaw = searchParams.get(KOALI_SURFACE_QUERY_PARAM);
    const desired = addressableSurface ? activeSurfaceId : null;
    if (currentRaw === desired) return;
    router.replace(
      canonicalCurrentHref(pathname, searchParams.toString(), desired),
      { scroll: false },
    );
  }, [
    activeSurfaceId,
    addressableSurface,
    manifest,
    pathname,
    router,
    searchParams,
  ]);

  const closeDrawer = () => {
    const restoreFocus = drawer;
    setDrawer(false);
    if (restoreFocus) window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  };

  return (
    <div
      className={`koa-frame ${immersive ? 'koa-frame-immersive' : ''} ${hasSidebar ? 'koa-frame-with-sidebar' : 'koa-frame-no-sidebar'}`}
      data-sidebar={hasSidebar ? 'visible' : 'omitted'}
    >
      {!immersive ? <SkipLinks /> : null}
      <div className="koa-module-selector"><ModuleSelector /></div>
      <div className="koa-topbar-region">
        <SharedTopBar
          onMenu={() => setDrawer(true)}
          activeSurfaceId={activeSurfaceId}
          hasSidebar={hasSidebar}
          menuButtonRef={menuButtonRef}
        />
      </div>
      <ActiveModuleSidebar
        mobileOpen={drawer}
        onMobileClose={closeDrawer}
        activeSurfaceId={activeSurfaceId}
      />
      <div className="koa-content"><MainPageSurface>{children}</MainPageSurface></div>
    </div>
  );
}
