'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { loadShellState } from '@/lib/shell-api';
import type { ShellState } from '@/types/contracts';

const initial: ShellState = {
  state: 'loading',
  network_state: 'unknown',
  active_space_id: null,
  active_space: null,
  active_theme: null,
  modules: [],
  active_module_id: null,
  active_route_id: null,
  capabilities: [],
  reason: null,
};
const ShellContext = createContext<{ state: ShellState; refresh: () => Promise<void> }>({
  state: initial,
  refresh: async () => undefined,
});

export function ShellProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(initial);
  const refresh = useCallback(async () => setState(await loadShellState()), []);
  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(id);
  }, [refresh]);
  return <ShellContext.Provider value={{ state, refresh }}>{children}</ShellContext.Provider>;
}

export const useShell = () => useContext(ShellContext);
