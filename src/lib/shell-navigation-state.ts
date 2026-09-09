import type { ModuleManifest, ProductSurfaceProfile, ShellState } from '@/types/contracts';
import { admittedSurfaceProfiles, defaultSurfaceProfile } from './registry';

export const KOALI_SURFACE_QUERY_PARAM = 'ks_surface';

const SURFACE_ID = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

type SearchParamsReader = Pick<URLSearchParams, 'get'>;

export function requestedSurfaceId(searchParams: SearchParamsReader): string | null {
  const value = searchParams.get(KOALI_SURFACE_QUERY_PARAM);
  return value && SURFACE_ID.test(value) ? value : null;
}

export function resolvedSurfaceProfile(
  manifest: ModuleManifest,
  state: Pick<ShellState, 'capabilities'>,
  requestedId: string | null,
): ProductSurfaceProfile | null {
  const admitted = admittedSurfaceProfiles(manifest, state);
  return admitted.find((surface) => surface.surface_id === requestedId) ?? defaultSurfaceProfile(manifest, state);
}

export function surfaceSelectionIsAddressable(
  manifest: ModuleManifest,
  state: Pick<ShellState, 'capabilities'>,
): boolean {
  return admittedSurfaceProfiles(manifest, state).length > 1;
}

export function hrefWithKoaliSurface(path: string, surfaceId: string | null): string {
  const [pathname, existingQuery = ''] = path.split('?', 2);
  const params = new URLSearchParams(existingQuery);
  if (surfaceId) params.set(KOALI_SURFACE_QUERY_PARAM, surfaceId);
  else params.delete(KOALI_SURFACE_QUERY_PARAM);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function canonicalCurrentHref(
  pathname: string,
  currentSearch: string,
  surfaceId: string | null,
): string {
  const params = new URLSearchParams(currentSearch);
  if (surfaceId) params.set(KOALI_SURFACE_QUERY_PARAM, surfaceId);
  else params.delete(KOALI_SURFACE_QUERY_PARAM);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
