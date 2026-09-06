import { permits } from '@/lib/capabilities';
import { routeByIdInState, routeHref } from '@/lib/registry';
import type { ShellState } from '@/types/contracts';
import { SEARCH_PROVIDERS, TASK_PROVIDERS } from './registry.server';
import type { ProviderDefinition, ProviderContext, SearchResultProjection, TaskProjection } from './types';

const MAX_SEARCH_RESULTS_PER_PROVIDER = 100;
const MAX_TASKS_PER_PROVIDER = 200;
const MAX_TEXT = 2_000;

function contextFor(state: ShellState): ProviderContext {
  return {
    capabilities: state.capabilities,
    networkState: state.network_state,
    activeSpaceId: state.active_space_id ?? state.active_space?.space_id ?? null,
  };
}

function providerAvailable(provider: ProviderDefinition, state: ShellState) {
  if (!permits(provider.requiredCapabilities, state.capabilities)) return false;
  if (state.network_state === 'offline' && provider.offlineBehavior === 'unavailable') return false;
  return true;
}

async function bounded<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error('provider timeout')), Math.max(100, Math.min(timeoutMs, 10_000)));
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function nonEmptyString(value: unknown, max = MAX_TEXT): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}

function optionalString(value: unknown, max = MAX_TEXT): value is string | undefined {
  return value === undefined || (typeof value === 'string' && value.length <= max);
}

function sanitizeSearchProjection(value: unknown, ownerModuleId: string): SearchResultProjection | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (
    !nonEmptyString(item.resultId, 256) ||
    !nonEmptyString(item.title, 500) ||
    !optionalString(item.summary) ||
    !nonEmptyString(item.kind, 128) ||
    item.ownerModuleId !== ownerModuleId ||
    !nonEmptyString(item.targetRouteId, 256)
  ) return null;
  if (item.score !== undefined && (typeof item.score !== 'number' || !Number.isFinite(item.score))) return null;
  return item as unknown as SearchResultProjection;
}

function sanitizeTaskProjection(value: unknown, ownerModuleId: string): TaskProjection | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (
    !nonEmptyString(item.taskId, 256) ||
    !nonEmptyString(item.title, 500) ||
    !optionalString(item.summary) ||
    item.ownerModuleId !== ownerModuleId ||
    !['pending', 'attention', 'done'].includes(String(item.status)) ||
    !['low', 'normal', 'high', 'urgent'].includes(String(item.priority)) ||
    !optionalString(item.dueAt, 128) ||
    !optionalString(item.badge, 128) ||
    !nonEmptyString(item.targetRouteId, 256)
  ) return null;
  return item as unknown as TaskProjection;
}

function projectTarget<T extends { ownerModuleId: string; targetRouteId: string }>(state: ShellState, item: T) {
  const target = routeByIdInState(state, item.targetRouteId);
  if (!target || target.manifest.module_id !== item.ownerModuleId) return null;
  return { ...item, targetHref: routeHref(target.manifest, target.route) };
}

export async function executeSearchProviders(state: ShellState, query: string) {
  const context = contextFor(state);
  const results = await Promise.allSettled(
    SEARCH_PROVIDERS.filter((provider) => providerAvailable(provider, state)).map(async (provider) => ({
      providerId: provider.providerId,
      ownerModuleId: provider.ownerModuleId,
      items: await bounded(provider.search(query, context), provider.timeoutMs),
    })),
  );
  return results.flatMap((result) => {
    if (result.status !== 'fulfilled' || !Array.isArray(result.value.items)) return [];
    return result.value.items
      .slice(0, MAX_SEARCH_RESULTS_PER_PROVIDER)
      .map((item) => sanitizeSearchProjection(item, result.value.ownerModuleId))
      .filter((item): item is SearchResultProjection => item !== null)
      .map((item) => projectTarget(state, item))
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .map((item) => ({ ...item, providerId: result.value.providerId }));
  });
}

export async function executeTaskProviders(state: ShellState) {
  const context = contextFor(state);
  const results = await Promise.allSettled(
    TASK_PROVIDERS.filter((provider) => providerAvailable(provider, state)).map(async (provider) => ({
      providerId: provider.providerId,
      ownerModuleId: provider.ownerModuleId,
      items: await bounded(provider.list(context), provider.timeoutMs),
    })),
  );
  return results.flatMap((result) => {
    if (result.status !== 'fulfilled' || !Array.isArray(result.value.items)) return [];
    return result.value.items
      .slice(0, MAX_TASKS_PER_PROVIDER)
      .map((item) => sanitizeTaskProjection(item, result.value.ownerModuleId))
      .filter((item): item is TaskProjection => item !== null)
      .map((item) => projectTarget(state, item))
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .map((item) => ({ ...item, providerId: result.value.providerId }));
  });
}
