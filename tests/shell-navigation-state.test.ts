import { describe, expect, it } from 'vitest';
import {
  canonicalCurrentHref,
  hrefWithKoaliSurface,
  KOALI_SURFACE_QUERY_PARAM,
  requestedSurfaceId,
  resolvedSurfaceProfile,
  surfaceSelectionIsAddressable,
} from '@/lib/shell-navigation-state';

const manifest: any = {
  module_id: 'orgo',
  public_name: 'Orgo',
  home_route_id: 'orgo.control',
  default_surface_id: 'control',
  surface_profiles: [
    { surface_id: 'control', label: 'Control', home_route_id: 'orgo.control' },
    { surface_id: 'my_work', label: 'My Work', home_route_id: 'orgo.work', required_capabilities: ['orgo.work'] },
  ],
};

describe('Koali-owned surface navigation state', () => {
  it('reads only bounded reserved surface identifiers', () => {
    expect(requestedSurfaceId(new URLSearchParams(`${KOALI_SURFACE_QUERY_PARAM}=my_work`))).toBe('my_work');
    expect(requestedSurfaceId(new URLSearchParams(`${KOALI_SURFACE_QUERY_PARAM}=../../root`))).toBeNull();
  });

  it('restores an admitted requested surface and deterministically falls back otherwise', () => {
    const state: any = { capabilities: ['orgo.work'] };
    expect(resolvedSurfaceProfile(manifest, state, 'my_work')?.surface_id).toBe('my_work');
    expect(resolvedSurfaceProfile(manifest, state, 'missing')?.surface_id).toBe('control');
  });

  it('never lets URL presentation state bypass capability filtering', () => {
    const state: any = { capabilities: [] };
    expect(resolvedSurfaceProfile(manifest, state, 'my_work')?.surface_id).toBe('control');
    expect(surfaceSelectionIsAddressable(manifest, state)).toBe(false);
  });

  it('encodes the reserved surface state without inventing owner route state', () => {
    expect(hrefWithKoaliSurface('/apps/orgo/work', 'my_work')).toBe('/apps/orgo/work?ks_surface=my_work');
    expect(hrefWithKoaliSurface('/apps/orgo/work?tab=open', 'my_work')).toBe('/apps/orgo/work?tab=open&ks_surface=my_work');
    expect(hrefWithKoaliSurface('/apps/orgo/work?ks_surface=control', null)).toBe('/apps/orgo/work');
  });

  it('canonicalizes the current URL while preserving non-Koali query data', () => {
    expect(canonicalCurrentHref('/apps/orgo/cases/123', 'filter=open&ks_surface=missing', 'my_work'))
      .toBe('/apps/orgo/cases/123?filter=open&ks_surface=my_work');
  });
});
