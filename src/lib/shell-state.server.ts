import fs from 'node:fs/promises';
import path from 'node:path';
import { developmentShellState } from './development-shell-state';
import type { ShellState } from '@/types/contracts';

function unavailableState(reason: string): ShellState {
  return {
    state: 'unavailable',
    network_state: 'unknown',
    active_space_id: null,
    active_space: null,
    active_theme: null,
    modules: [],
    active_module_id: null,
    active_route_id: null,
    capabilities: [],
    reason,
  };
}

export function activeStatePath() {
  const stateRoot = process.env.KOALI_SPACES_STATE_ROOT;
  return stateRoot ? path.join(stateRoot, 'active-state.json') : null;
}

export function publicShellState(value: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !key.startsWith('_')));
}

export async function readServerShellState(): Promise<ShellState> {
  const file = activeStatePath();
  if (file) {
    try {
      const value = JSON.parse(await fs.readFile(file, 'utf8')) as Record<string, unknown>;
      return publicShellState(value) as unknown as ShellState;
    } catch {
      // Production fails closed below; explicit development mode may use the fallback.
    }
  }
  const developmentFallback = process.env.KOALI_SPACES_DEV_FALLBACK === '1' || process.env.NODE_ENV !== 'production';
  return developmentFallback ? developmentShellState : unavailableState('no validated runtime Space state available');
}
