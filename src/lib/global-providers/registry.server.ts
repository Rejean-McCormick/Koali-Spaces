import type { SearchProvider, TaskProvider } from './types';

/**
 * Closed server-side provider registry. Owner integrations add explicit imports here.
 * No provider URL or executable module name is loaded from a Space definition.
 */
export const SEARCH_PROVIDERS: readonly SearchProvider[] = Object.freeze([]);
export const TASK_PROVIDERS: readonly TaskProvider[] = Object.freeze([]);
