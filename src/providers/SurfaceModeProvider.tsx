'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import type { SurfaceDisplayMode } from '@/lib/surfaces/types';

type SurfaceModeContextValue = {
  moduleId: string | null;
  mode: SurfaceDisplayMode;
  setSurface: (moduleId: string, defaultMode?: SurfaceDisplayMode) => void;
  enterImmersive: (moduleId: string, returnFocus?: HTMLElement | null) => void;
  exitImmersive: () => void;
};

const SurfaceModeContext = createContext<SurfaceModeContextValue | null>(null);

export function SurfaceModeProvider({ children }: PropsWithChildren) {
  const [view, setView] = useState<{ moduleId: string | null; mode: SurfaceDisplayMode }>({
    moduleId: null,
    mode: 'framed',
  });
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const setSurface = useCallback((moduleId: string, defaultMode: SurfaceDisplayMode = 'framed') => {
    setView((current) => current.moduleId === moduleId ? current : { moduleId, mode: defaultMode });
  }, []);

  const enterImmersive = useCallback((moduleId: string, returnFocus?: HTMLElement | null) => {
    returnFocusRef.current = returnFocus ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setView({ moduleId, mode: 'immersive' });
  }, []);

  const exitImmersive = useCallback(() => {
    setView((current) => ({ ...current, mode: 'framed' }));
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
  }, []);

  const value = useMemo(
    () => ({ moduleId: view.moduleId, mode: view.mode, setSurface, enterImmersive, exitImmersive }),
    [view, setSurface, enterImmersive, exitImmersive],
  );

  return <SurfaceModeContext.Provider value={value}>{children}</SurfaceModeContext.Provider>;
}

export function useSurfaceMode() {
  const value = useContext(SurfaceModeContext);
  if (!value) throw new Error('useSurfaceMode must be used inside SurfaceModeProvider');
  return value;
}
