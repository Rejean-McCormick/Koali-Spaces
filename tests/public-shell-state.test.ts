import { describe, expect, it } from 'vitest';
import { publicShellState } from '@/lib/shell-state.server';

describe('public shell state minimization', () => {
  it('removes every private top-level control projection', () => {
    const result = publicShellState({
      state: 'ready',
      capabilities: ['read'],
      _capability_snapshot: { secret: 'internal' },
      _surface_runtime: { runtimeRef: 'internal' },
      _previous_state: { state: 'degraded' },
    });
    expect(result).toEqual({ state: 'ready', capabilities: ['read'] });
    expect(JSON.stringify(result)).not.toContain('runtimeRef');
    expect(JSON.stringify(result)).not.toContain('secret');
  });
});
