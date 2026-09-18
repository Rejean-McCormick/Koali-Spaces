import fs from 'node:fs/promises';
import path from 'node:path';

export type PublicEcosystemStatus = {
  state: 'available' | 'unavailable';
  updatedAt: string | null;
  products: Array<{
    id: string;
    moduleId: string;
    publicName: string;
    repoFound: boolean;
    integrationReady: boolean;
    integrationOwner: string | null;
    selectedVariant: string | null;
    availableVariants: string[];
    externallyManaged: boolean;
    embedBase: string;
    runtime: {
      state: string;
      reason?: string;
      probes: Array<{ id: string; state: string; required: boolean; reason?: string }>;
    } | null;
    process: { state: string; reason?: string; processCount: number } | null;
  }>;
  sources: Array<{ id: string; publicName: string; found: boolean }>;
  reason?: string;
};

function statusPath() {
  const root = process.env.KOALI_SPACES_STATE_ROOT;
  return root ? path.join(root, 'ecosystem-status.json') : null;
}

export async function readPublicEcosystemStatus(): Promise<PublicEcosystemStatus> {
  const file = statusPath();
  if (!file) return { state: 'unavailable', updatedAt: null, products: [], sources: [], reason: 'ecosystem bootstrap is not active' };
  try {
    const raw = JSON.parse(await fs.readFile(file, 'utf8')) as any;
    return {
      state: 'available',
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
      products: (raw.discovery?.products ?? []).map((product: any) => {
        const runtime = raw.runtimes?.[product.id] ?? null;
        const processState = raw.processes?.[product.id] ?? null;
        return {
          id: String(product.id),
          moduleId: String(product.moduleId),
          publicName: String(product.publicName),
          repoFound: Boolean(product.repoFound),
          integrationReady: Boolean(product.integrationReady),
          integrationOwner: product.integrationOwner == null ? null : String(product.integrationOwner),
          selectedVariant: product.selectedVariant == null ? null : String(product.selectedVariant),
          availableVariants: Array.isArray(product.availableVariants) ? product.availableVariants.map((variant: any) => String(variant.id)) : [],
          externallyManaged: Boolean(product.externallyManaged),
          embedBase: String(product.embedBase ?? ''),
          runtime: runtime ? {
            state: String(runtime.state),
            ...(runtime.reason ? { reason: String(runtime.reason) } : {}),
            probes: Array.isArray(runtime.probes) ? runtime.probes.map((probe: any) => ({
              id: String(probe.id),
              state: String(probe.state),
              required: Boolean(probe.required),
              ...(probe.reason ? { reason: String(probe.reason) } : {}),
            })) : [],
          } : null,
          process: processState ? {
            state: String(processState.state),
            ...(processState.reason ? { reason: String(processState.reason) } : {}),
            processCount: Array.isArray(processState.pids) ? processState.pids.length : 0,
          } : null,
        };
      }),
      sources: (raw.discovery?.sources ?? []).map((source: any) => ({ id: String(source.id), publicName: String(source.publicName), found: Boolean(source.found) })),
    };
  } catch (error) {
    return { state: 'unavailable', updatedAt: null, products: [], sources: [], reason: error instanceof Error ? error.message : 'ecosystem status unavailable' };
  }
}
