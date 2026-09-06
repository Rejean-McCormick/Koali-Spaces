import { describe, expect, it } from 'vitest';
import { safeRoute, visibleSidebarItems } from '../src/lib/registry';

const localHome: any = {
  home_route_id: 'm.home',
  routes: [
    {
      route_id: 'm.home',
      module_id: 'm',
      path: '/',
      page_ref: 'home',
      default_label: 'Home',
      availability: 'always',
      offline_behavior: 'available',
      capability_policy: { required_capabilities: [], denied_behavior: 'hidden' },
      safe_fallback_route_id: null,
    },
  ],
};

describe('safeRoute', () => {
  it('keeps local home offline', () => {
    expect(safeRoute(localHome, null, [], false).route_id).toBe('m.home');
  });
});

describe('visibleSidebarItems denied behavior', () => {
  const route = (id: string, denied: 'hidden' | 'disabled' | 'access_denied') => ({
    route_id: id,
    module_id: 'm',
    path: `/${id}`,
    page_ref: id,
    default_label: id,
    availability: 'always',
    offline_behavior: 'available',
    capability_policy: { required_capabilities: ['cap.required'], denied_behavior: denied },
    safe_fallback_route_id: null,
  });
  const manifest: any = {
    module_id: 'm',
    home_route_id: 'm.disabled',
    routes: [
      route('m.hidden', 'hidden'),
      route('m.disabled', 'disabled'),
      route('m.denied', 'access_denied'),
    ],
    sidebar: {
      items: [
        { item_id: 'hidden', label: 'Hidden', order: 1, route_id: 'm.hidden' },
        { item_id: 'disabled', label: 'Disabled', order: 2, route_id: 'm.disabled' },
        { item_id: 'denied', label: 'Denied', order: 3, route_id: 'm.denied' },
      ],
    },
  };
  const state: any = { network_state: 'online', capabilities: [] };

  it('hides hidden routes but preserves disabled/access_denied routes for presentation', () => {
    expect(visibleSidebarItems(manifest, state).map((item) => item.item_id)).toEqual([
      'disabled',
      'denied',
    ]);
  });
});

describe('visibleSidebarItems item availability', () => {
  const manifest: any = {
    module_id: 'm',
    home_route_id: 'm.home',
    routes: [
      { route_id: 'm.home', module_id: 'm', path: '/', page_ref: 'home', default_label: 'Home', availability: 'always', offline_behavior: 'available', capability_policy: { required_capabilities: [], denied_behavior: 'hidden' }, safe_fallback_route_id: null },
    ],
    sidebar: {
      items: [
        { item_id: 'online', label: 'Online', order: 1, route_id: 'm.home', availability: 'online_only' },
        { item_id: 'offline', label: 'Offline', order: 2, route_id: 'm.home', availability: 'offline_only' },
      ],
    },
  };

  it('honors sidebar-level online/offline declarations independently of route availability', () => {
    expect(visibleSidebarItems(manifest, { network_state: 'online', capabilities: [] } as any).map((item) => item.item_id)).toEqual(['online']);
    expect(visibleSidebarItems(manifest, { network_state: 'offline', capabilities: [] } as any).map((item) => item.item_id)).toEqual(['offline']);
  });
});
