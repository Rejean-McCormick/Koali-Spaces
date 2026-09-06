import type { OfflineBehavior } from '@/types/contracts';

export type ProviderContext = {
  capabilities: string[];
  networkState: 'online' | 'offline' | 'unknown';
  activeSpaceId: string | null;
};

export type ProviderDefinition = {
  providerId: string;
  ownerModuleId: string;
  requiredCapabilities: string[];
  offlineBehavior: OfflineBehavior;
  timeoutMs: number;
  stalenessMs?: number;
};

export type SearchResultProjection = {
  resultId: string;
  title: string;
  summary?: string;
  kind: string;
  ownerModuleId: string;
  targetRouteId: string;
  score?: number;
};

export type TaskProjection = {
  taskId: string;
  title: string;
  summary?: string;
  ownerModuleId: string;
  status: 'pending' | 'attention' | 'done';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  dueAt?: string;
  targetRouteId: string;
  badge?: string;
};

export type SearchProvider = ProviderDefinition & {
  kind: 'search';
  search: (query: string, context: ProviderContext) => Promise<SearchResultProjection[]>;
};

export type TaskProvider = ProviderDefinition & {
  kind: 'tasks';
  list: (context: ProviderContext) => Promise<TaskProjection[]>;
};
