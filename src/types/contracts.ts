import type { SurfaceKind } from '@/lib/surfaces/types';

export type InterfaceState =
  | 'loading'
  | 'ready'
  | 'offline'
  | 'degraded'
  | 'unavailable'
  | 'access_denied'
  | 'error'
  | 'empty';

export type OfflineBehavior = 'available' | 'cached_read_only' | 'degraded' | 'unavailable';
export type RouteAvailability = 'always' | 'conditional' | 'online_only' | 'offline_only';
export type DeniedBehavior = 'hidden' | 'disabled' | 'access_denied';
export type CapabilityPolicy = { required_capabilities: string[]; denied_behavior: DeniedBehavior };
export type RouteSurface = {
  kind: SurfaceKind;
  asset_bundle_ref?: string | null;
  entrypoint?: string | null;
  origin_policy: 'same_origin' | 'registered_local_origin';
  offline_entrypoint?: string | null;
};
export type RouteContribution = {
  route_id: string;
  module_id: string;
  path: string;
  page_ref: string;
  default_label: string;
  label_key?: string;
  availability: RouteAvailability;
  offline_behavior: OfflineBehavior;
  deep_link_allowed?: boolean;
  safe_fallback_route_id: string | null;
  aliases?: string[];
  capability_policy: CapabilityPolicy;
  surface?: RouteSurface | null;
};
export type SidebarLeaf = {
  item_id: string;
  label: string;
  label_key?: string;
  icon_ref?: string | null;
  order: number;
  required_capabilities?: string[];
  availability?: RouteAvailability;
  badge_provider_ref?: string | null;
  route_id: string;
};
export type SidebarGroup = Omit<SidebarLeaf, 'route_id'> & { children: SidebarLeaf[] };
export type ProductSurfaceProfile = {
  surface_id: string;
  label: string;
  label_key?: string;
  home_route_id: string;
  required_capabilities?: string[];
  navigation_item_ids?: string[];
  topbar_widget_ids?: string[];
  command_refs?: string[];
  inspector_ref?: string | null;
  density?: 'comfortable' | 'compact' | 'touch';
};
export type ProductUiPortability = {
  integrated_supported: true;
  standalone_supported: boolean;
  standalone_entrypoint_ref?: string | null;
};
export type TopbarWidget = {
  widget_id: string;
  module_id: string | null;
  scope: 'global' | 'module';
  slot: 'primary' | 'secondary' | 'status' | 'overflow';
  kind: 'action' | 'status' | 'counter' | 'search' | 'menu' | 'resume';
  label: string;
  label_key?: string;
  icon_ref?: string | null;
  priority: number;
  required_capabilities?: string[];
  offline_behavior: OfflineBehavior;
  compact_only?: boolean;
  projection_ref?: string | null;
  activation: {
    kind: 'route' | 'command' | 'none';
    route_id?: string | null;
    command_ref?: string | null;
  };
};
export type ModuleManifest = {
  manifest_id: string;
  manifest_version: string;
  module_id: string;
  public_name: string;
  description?: string;
  icon_ref?: string | null;
  home_route_id: string;
  required_capabilities?: string[];
  routes: RouteContribution[];
  sidebar: { module_id: string; visible_depth: 2; items: (SidebarLeaf | SidebarGroup)[] };
  topbar_widgets: TopbarWidget[];
  default_surface_id?: string | null;
  surface_profiles?: ProductSurfaceProfile[];
  ui_portability?: ProductUiPortability;
  localization_refs?: string[];
  accessibility?: Record<string, unknown>;
  offline_behavior: { module_state: OfflineBehavior; fallback_route_id: string | null };
  authority_boundary: Record<string, unknown>;
  asset_bundle_ref?: string | null;
  surface_contract_version?: string | null;
  design_system_compatibility?: { design_system_id: string; min_version: string };
};
export type ModuleInstance = {
  module_id: string;
  manifest_ref: string;
  enabled: boolean;
  required: boolean;
  order: number;
  public_label?: string | null;
  public_icon_ref?: string | null;
  home_route_override?: string | null;
};
export type SpaceAppearancePolicy = {
  default_mode?: 'system' | 'light' | 'dark';
  default_accent?: string;
  default_density?: 'comfortable' | 'compact' | 'touch';
  default_surface_style?: 'minimal' | 'outlined' | 'elevated';
  allowed_modes?: ('system' | 'light' | 'dark')[];
  allowed_accents?: string[];
  allowed_densities?: ('comfortable' | 'compact' | 'touch')[];
  allowed_surface_styles?: ('minimal' | 'outlined' | 'elevated')[];
  allow_module_accent?: boolean;
};

export type SpaceDefinition = {
  space_id: string;
  title: string;
  version: string;
  default_module_id: string;
  module_instances: ModuleInstance[];
  global_topbar: TopbarWidget[];
  appearance: {
    theme_ref: string;
    density?: 'comfortable' | 'compact' | 'touch';
    logo_ref?: string | null;
    accent_token?: string | null;
    allow_module_accent?: boolean;
    design_system_id?: string | null;
    theme_version?: string | null;
  };
  appearance_policy?: SpaceAppearancePolicy;
  offline_policy: {
    shell_available: true;
    retain_last_validated_definition: true;
    unavailable_module_behavior: string;
    network_state_indicator: true;
    public_cdn_required?: false;
    remote_runtime_assets_required?: false;
  };
  authority_boundary: Record<string, unknown>;
};
export type InterfaceTheme = {
  theme_id: string;
  version: string;
  design_system_id: string;
  tokens: {
    primary_accent: string;
    primary_accent_id?: string;
    density: string;
    radius_scale: string;
    spacing_scale: string;
    typography_scale: string;
    focus_style: string;
    surface_family?: string;
    semantic_color_policy?: string;
  };
  framework_mapping?: Record<string, string> | null;
};
export type ShellState = {
  state: InterfaceState;
  network_state: 'online' | 'offline' | 'unknown';
  active_space_id?: string | null;
  active_space: SpaceDefinition | null;
  active_theme: InterfaceTheme | null;
  modules: ModuleManifest[];
  active_module_id: string | null;
  active_route_id: string | null;
  capabilities: string[];
  reason: string | null;
};
