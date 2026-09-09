import { describe, expect, it } from 'vitest';
import { admittedModules, admittedSurfaceProfiles, defaultSurfaceProfile, effectiveHomeRouteId, safeRoute, visibleSidebarItems, visibleTopbarWidgets } from '../src/lib/registry';

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


describe('product surface profiles', () => {
  const manifest: any = {
    module_id: 'orgo',
    public_name: 'Orgo',
    home_route_id: 'orgo.control',
    default_surface_id: 'control',
    required_capabilities: [],
    routes: [
      { route_id: 'orgo.control', module_id: 'orgo', path: '/', page_ref: 'control', default_label: 'Control', availability: 'always', offline_behavior: 'available', capability_policy: { required_capabilities: [], denied_behavior: 'hidden' }, safe_fallback_route_id: null },
      { route_id: 'orgo.work', module_id: 'orgo', path: '/work', page_ref: 'work', default_label: 'My Work', availability: 'always', offline_behavior: 'available', capability_policy: { required_capabilities: [], denied_behavior: 'hidden' }, safe_fallback_route_id: 'orgo.control' },
    ],
    sidebar: {
      module_id: 'orgo', visible_depth: 2, items: [
        { item_id: 'control', label: 'Control', order: 0, route_id: 'orgo.control' },
        { item_id: 'work', label: 'My Work', order: 1, route_id: 'orgo.work' },
      ],
    },
    topbar_widgets: [
      { widget_id: 'orgo.control', module_id: 'orgo', scope: 'module', slot: 'secondary', kind: 'action', label: 'Control', priority: 1, offline_behavior: 'available', activation: { kind: 'route', route_id: 'orgo.control' } },
      { widget_id: 'orgo.work', module_id: 'orgo', scope: 'module', slot: 'secondary', kind: 'action', label: 'Work', priority: 2, offline_behavior: 'available', activation: { kind: 'route', route_id: 'orgo.work' } },
    ],
    surface_profiles: [
      { surface_id: 'control', label: 'Control', home_route_id: 'orgo.control', navigation_item_ids: ['control'], topbar_widget_ids: ['orgo.control'] },
      { surface_id: 'my_work', label: 'My Work', home_route_id: 'orgo.work', navigation_item_ids: ['work'], topbar_widget_ids: ['orgo.work'], required_capabilities: ['orgo.work'] },
    ],
  };
  const state: any = { network_state: 'online', capabilities: ['orgo.work'] };

  it('keeps surface selection declarative and capability-filtered', () => {
    expect(admittedSurfaceProfiles(manifest, state).map((surface) => surface.surface_id)).toEqual(['control', 'my_work']);
    expect(defaultSurfaceProfile(manifest, state)?.surface_id).toBe('control');
    expect(effectiveHomeRouteId(null, manifest, 'my_work')).toBe('orgo.work');
  });

  it('projects navigation and module widgets without duplicating routes', () => {
    expect(visibleSidebarItems(manifest, state, 'my_work').map((item) => item.item_id)).toEqual(['work']);
    expect(visibleTopbarWidgets(null, manifest, state, 'my_work').map((widget) => widget.widget_id)).toEqual(['orgo.work']);
  });

  it('falls back to one synthetic control surface for legacy manifests', () => {
    const legacy = { ...manifest, surface_profiles: undefined, default_surface_id: undefined };
    expect(admittedSurfaceProfiles(legacy, state)).toEqual([{ surface_id: 'control', label: 'Orgo', home_route_id: 'orgo.control' }]);
  });
});


describe('surface capability fail-closed behavior', () => {
  it('does not admit a product when every declared surface is unavailable', () => {
    const manifest: any = {
      module_id: 'orgo', public_name: 'Orgo', home_route_id: 'orgo.home', required_capabilities: [],
      routes: [], sidebar: { module_id: 'orgo', visible_depth: 2, items: [] }, topbar_widgets: [],
      surface_profiles: [{ surface_id: 'admin', label: 'Admin', home_route_id: 'orgo.home', required_capabilities: ['orgo.admin'] }],
    };
    const state: any = {
      active_space: { module_instances: [{ module_id: 'orgo', enabled: true, order: 0 }] },
      modules: [manifest], capabilities: [], network_state: 'online', active_module_id: 'orgo',
    };
    expect(admittedModules(state)).toEqual([]);
  });
});
