import type { ModuleHealth, ShellState } from '@/types/contracts';

export function moduleHealthFor(state: ShellState, moduleId: string): ModuleHealth {
  const observed = state.module_health?.find((item) => item.module_id === moduleId);
  if (observed) return observed;
  if (moduleId === 'space_home') {
    return {
      module_id: moduleId,
      product_id: null,
      state: state.state === 'unavailable' || state.state === 'error' ? 'degraded' : 'ready',
      reason: null,
      affects_shell_state: true,
    };
  }
  return {
    module_id: moduleId,
    product_id: null,
    state: 'unknown',
    reason: 'runtime health has not been projected',
    affects_shell_state: false,
  };
}

export function moduleIsReady(health: ModuleHealth) {
  return health.state === 'ready';
}

export function shellAffectingIssues(state: ShellState) {
  return (state.module_health ?? []).filter((item) => item.affects_shell_state && !moduleIsReady(item));
}

export function optionalModuleIssues(state: ShellState) {
  return (state.module_health ?? []).filter((item) => !item.affects_shell_state && !moduleIsReady(item));
}
