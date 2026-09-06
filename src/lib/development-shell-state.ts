import type { ModuleManifest, OfflineBehavior, RouteContribution, ShellState } from '@/types/contracts';

const route = (
  routeId: string,
  path: string,
  label: string,
  offlineBehavior: Extract<OfflineBehavior, 'available' | 'cached_read_only'>,
): RouteContribution => ({
  route_id: routeId,
  module_id: 'space_home',
  path,
  page_ref: `koa-spaces://page/${routeId.split('.').at(-1)}`,
  default_label: label,
  label_key: routeId,
  availability: 'always',
  offline_behavior: offlineBehavior,
  deep_link_allowed: true,
  safe_fallback_route_id: routeId === 'space_home.home' ? null : 'space_home.home',
  aliases: [],
  capability_policy: { required_capabilities: [], denied_behavior: 'access_denied' },
  surface: {
    kind: 'local_shell_page',
    origin_policy: 'same_origin',
    entrypoint: routeId.split('.').at(-1) ?? 'home',
  },
});

const developmentManifest: ModuleManifest = {
  manifest_id: 'koa-spaces.global-widgets',
  manifest_version: '1.0.0',
  module_id: 'space_home',
  public_name: 'Home',
  home_route_id: 'space_home.home',
  required_capabilities: [],
  routes: [
    route('space_home.home', '/', 'Home', 'available'),
    route('space_home.search', '/search', 'Search', 'cached_read_only'),
    route('space_home.tasks', '/tasks', 'Tasks', 'cached_read_only'),
    route('space_home.offline', '/offline', 'Offline', 'available'),
    route('space_home.health', '/health', 'Interface health', 'available'),
    route('space_home.settings', '/settings', 'Settings', 'available'),
  ],
  sidebar: {
    module_id: 'space_home',
    visible_depth: 2 as const,
    items: [
      { item_id: 'space_home.home', label: 'Home', label_key: 'space_home.home', order: 0, route_id: 'space_home.home' },
      { item_id: 'space_home.search', label: 'Search', label_key: 'space_home.search', order: 10, route_id: 'space_home.search' },
      { item_id: 'space_home.tasks', label: 'Tasks', label_key: 'space_home.tasks', order: 20, route_id: 'space_home.tasks' },
      {
        item_id: 'space_home.system', label: 'System', label_key: 'space_home.system', order: 30,
        children: [
          { item_id: 'space_home.offline', label: 'Offline', label_key: 'space_home.offline', order: 0, route_id: 'space_home.offline' },
          { item_id: 'space_home.health', label: 'Interface health', label_key: 'space_home.health', order: 10, route_id: 'space_home.health' },
          { item_id: 'space_home.settings', label: 'Settings', label_key: 'space_home.settings', order: 20, route_id: 'space_home.settings' },
        ],
      },
    ],
  },
  topbar_widgets: [
    {
      widget_id: 'global.search', module_id: null, scope: 'global' as const, slot: 'primary' as const, kind: 'search' as const, label: 'Search', label_key: 'global.search', priority: 10,
      required_capabilities: [], offline_behavior: 'cached_read_only' as const, activation: { kind: 'route' as const, route_id: 'space_home.search' },
    },
    {
      widget_id: 'global.tasks', module_id: null, scope: 'global' as const, slot: 'secondary' as const, kind: 'action' as const, label: 'Tasks', label_key: 'global.tasks', priority: 15,
      required_capabilities: [], offline_behavior: 'cached_read_only' as const, activation: { kind: 'route' as const, route_id: 'space_home.tasks' },
    },
  ],
  localization_refs: ['/localization/koali-spaces.fr-CA.json', '/localization/koali-spaces.en.json'],
  offline_behavior: { module_state: 'available' as const, fallback_route_id: 'space_home.home' },
  authority_boundary: {
    presentation_only: true,
    may_grant_capabilities: false,
    direct_domain_writes: false,
    menu_visibility_is_authorization: false,
  },
};

export const developmentShellState: ShellState = {
  state: 'degraded',
  network_state: 'unknown',
  active_space_id: 'default_space',
  active_space: {
    space_id: 'default_space',
    title: 'Default Space',
    version: '1.0.0',
    default_module_id: 'space_home',
    module_instances: [
      { module_id: 'space_home', manifest_ref: 'global-widgets.json', enabled: true, required: true, order: 0, public_label: 'Home' },
    ],
    global_topbar: [],
    appearance: { theme_ref: 'themes/default.json', density: 'comfortable', design_system_id: 'koali.ant5', theme_version: '1.0.0' },
    offline_policy: { shell_available: true, retain_last_validated_definition: true, unavailable_module_behavior: 'show_declared_fallback', network_state_indicator: true, public_cdn_required: false, remote_runtime_assets_required: false },
    authority_boundary: { presentation_only: true, may_grant_capabilities: false, contains_business_state: false, contains_executable_extension: false },
  },
  active_theme: {
    theme_id: 'koa_spaces.default',
    version: '1.0.0',
    design_system_id: 'koali.ant5',
    tokens: { primary_accent: '#1e6864', density: 'comfortable', radius_scale: 'v1', spacing_scale: 'v1', typography_scale: 'v1', focus_style: 'visible', surface_family: 'neutral' },
  },
  modules: [developmentManifest],
  active_module_id: 'space_home',
  active_route_id: 'space_home.home',
  capabilities: [],
  reason: 'development fallback; no authoritative runtime state',
};
