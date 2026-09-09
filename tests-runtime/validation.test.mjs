import assert from 'node:assert/strict';
import test from 'node:test';
import { assertActivationPayload, assertAssetManifest, assertCapabilitySnapshot } from '../server/validation.mjs';

function assets() {
  return {
    bundle_id: 'koa_spaces.shell', version: '1.0.0', owner_kind: 'koa_spaces_shell', owner_id: 'koa_spaces',
    entrypoints: ['static/shell.js'],
    assets: [{ path: 'static/shell.js', media_type: 'text/javascript', sha256: '0'.repeat(64), offline_required: true }],
    remote_runtime_dependencies: [],
    offline_policy: { local_assets_complete: true, public_cdn_required: false, remote_fonts_required: false, internet_required_for_shell: false },
    authority_boundary: { presentation_assets_only: true, contains_business_authority: false, contains_credentials: false },
  };
}

function homeManifest() {
  return {
    manifest_id: 'koa-spaces.global-widgets', manifest_version: '1.0.0', module_id: 'space_home', public_name: 'Home',
    home_route_id: 'space_home.home', required_capabilities: [],
    routes: [{ route_id: 'space_home.home', module_id: 'space_home', path: '/', page_ref: 'koa-spaces://page/home', default_label: 'Home', availability: 'always', offline_behavior: 'available', deep_link_allowed: true, safe_fallback_route_id: null, aliases: [], capability_policy: { required_capabilities: [], denied_behavior: 'access_denied' } }],
    sidebar: { module_id: 'space_home', visible_depth: 2, items: [{ item_id: 'home', label: 'Home', order: 0, route_id: 'space_home.home' }] },
    topbar_widgets: [], offline_behavior: { module_state: 'available', fallback_route_id: 'space_home.home' },
    authority_boundary: { presentation_only: true, may_grant_capabilities: false, direct_domain_writes: false, menu_visibility_is_authorization: false },
    design_system_compatibility: { design_system_id: 'koali.ant5', min_version: '1.0.0' }, asset_bundle_ref: null,
  };
}

function theme() {
  return {
    theme_id: 'koa_spaces.default', version: '1.0.0', design_system_id: 'koali.ant5',
    tokens: { primary_accent: '#1e6864', primary_accent_id: 'forest', density: 'comfortable', radius_scale: 'v1', spacing_scale: 'v1', typography_scale: 'v1', focus_style: 'visible' },
    icon_policy: { style: 'outline', local_assets_required: true }, motion_policy: { reduced_motion_supported: true, default_motion: 'minimal' },
    authority_boundary: { presentation_only: true, changes_authorization: false, changes_module_identity: false },
  };
}

function activationPayload() {
  return {
    space_definition: {
      space_id: 'default_space', title: 'Default Space', version: '1.0.0', default_module_id: 'space_home',
      module_instances: [{ module_id: 'space_home', manifest_ref: 'global-widgets.json', enabled: true, required: true, order: 0 }],
      global_topbar: [], appearance: { theme_ref: 'themes/default.json', density: 'comfortable', design_system_id: 'koali.ant5' },
      offline_policy: { shell_available: true, retain_last_validated_definition: true, unavailable_module_behavior: 'show_declared_fallback', network_state_indicator: true, public_cdn_required: false, remote_runtime_assets_required: false },
      authority_boundary: { presentation_only: true, may_grant_capabilities: false, contains_business_state: false, contains_executable_extension: false },
    },
    interface_theme: theme(), shell_asset_manifest: assets(), module_manifests: [homeManifest()], module_asset_manifests: [],
    capability_snapshot: { source: 'koa', capabilities: [], may_grant_capabilities: false }, profile_id: 'developer_windows_wsl',
  };
}

test('local shell asset inventory is accepted', () => assert.doesNotThrow(() => assertAssetManifest(assets(), 'koa_spaces_shell', 'koa_spaces')));
test('remote runtime dependency is rejected', () => { const value = assets(); value.remote_runtime_dependencies = ['https://cdn.example.invalid/x.js']; assert.throws(() => assertAssetManifest(value, 'koa_spaces_shell', 'koa_spaces')); });
test('Koali capability projection is accepted without granting authority', () => assert.doesNotThrow(() => assertCapabilitySnapshot({ source: 'koa', capabilities: ['media.read'], may_grant_capabilities: false })));
test('self-granting capability snapshot is rejected', () => assert.throws(() => assertCapabilitySnapshot({ source: 'koa_spaces', capabilities: ['root'], may_grant_capabilities: true })));
test('activation requires every enabled required module', () => { const value = activationPayload(); value.space_definition.module_instances.push({ module_id: 'required_extra', manifest_ref: 'required.json', enabled: true, required: true, order: 10 }); assert.throws(() => assertActivationPayload(value), /required module required_extra is missing/); });
test('activation rejects a manifest for a disabled module', () => { const value = activationPayload(); const extra = structuredClone(homeManifest()); extra.manifest_id = 'disabled.interface'; extra.module_id = 'disabled'; extra.home_route_id = 'disabled.home'; extra.routes[0] = { ...extra.routes[0], route_id: 'disabled.home', module_id: 'disabled', path: '/disabled' }; extra.offline_behavior = { module_state: 'available', fallback_route_id: 'disabled.home' }; extra.sidebar = { module_id: 'disabled', visible_depth: 2, items: [{ item_id: 'disabled', label: 'Disabled', order: 0, route_id: 'disabled.home' }] }; value.space_definition.module_instances.push({ module_id: 'disabled', manifest_ref: 'disabled.json', enabled: false, required: false, order: 10 }); value.module_manifests.push(extra); assert.throws(() => assertActivationPayload(value), /not enabled by the active Space/); });
test('baseline activation payload is accepted', () => assert.doesNotThrow(() => assertActivationPayload(activationPayload())));

test('hosted application may own / because its route is namespaced under /apps/<moduleId>', () => {
  const value = activationPayload();
  const owner = structuredClone(homeManifest());
  owner.manifest_id = 'demo.interface';
  owner.module_id = 'demo';
  owner.public_name = 'Demo';
  owner.home_route_id = 'demo.home';
  owner.routes = [{
    route_id: 'demo.home', module_id: 'demo', path: '/', page_ref: 'demo://home', default_label: 'Demo',
    availability: 'always', offline_behavior: 'degraded', deep_link_allowed: true, safe_fallback_route_id: null, aliases: [],
    capability_policy: { required_capabilities: [], denied_behavior: 'access_denied' },
    surface: { kind: 'local_module_surface', origin_policy: 'registered_local_origin' },
  }];
  owner.sidebar = { module_id: 'demo', visible_depth: 2, items: [{ item_id: 'demo.home', label: 'Demo', order: 0, route_id: 'demo.home' }] };
  owner.offline_behavior = { module_state: 'degraded', fallback_route_id: 'demo.home' };
  value.space_definition.module_instances.push({ module_id: 'demo', manifest_ref: 'demo.json', enabled: true, required: true, order: 10 });
  value.module_manifests.push(owner);
  assert.doesNotThrow(() => assertActivationPayload(value));
});

test('two hosted applications may both own the same internal path', () => {
  const value = activationPayload();
  for (const moduleId of ['demo', 'orgo']) {
    const owner = structuredClone(homeManifest());
    owner.manifest_id = `${moduleId}.interface`;
    owner.module_id = moduleId;
    owner.public_name = moduleId;
    owner.home_route_id = `${moduleId}.home`;
    owner.routes = [{
      route_id: `${moduleId}.home`, module_id: moduleId, path: '/', page_ref: `${moduleId}://home`, default_label: moduleId,
      availability: 'always', offline_behavior: 'degraded', deep_link_allowed: true, safe_fallback_route_id: null, aliases: [],
      capability_policy: { required_capabilities: [], denied_behavior: 'access_denied' },
      surface: { kind: 'local_module_surface', origin_policy: 'registered_local_origin' },
    }];
    owner.sidebar = { module_id: moduleId, visible_depth: 2, items: [{ item_id: `${moduleId}.home`, label: moduleId, order: 0, route_id: `${moduleId}.home` }] };
    owner.offline_behavior = { module_state: 'degraded', fallback_route_id: `${moduleId}.home` };
    value.space_definition.module_instances.push({ module_id: moduleId, manifest_ref: `${moduleId}.json`, enabled: true, required: true, order: value.space_definition.module_instances.length * 10 });
    value.module_manifests.push(owner);
  }
  assert.doesNotThrow(() => assertActivationPayload(value));
});

test('activation rejects encoded or schema-invalid route paths before they reach browser URL resolution', () => {
  const value = activationPayload();
  value.module_manifests[0].routes[0].path = '/%2e%2e/secret';
  assert.throws(() => assertActivationPayload(value), /route path is invalid/);
});

test('activation rejects route ids that are not namespaced by their stable module id', () => {
  const value = activationPayload();
  value.module_manifests[0].routes[0].route_id = 'foreign.home';
  value.module_manifests[0].home_route_id = 'foreign.home';
  value.module_manifests[0].sidebar.items[0].route_id = 'foreign.home';
  assert.throws(() => assertActivationPayload(value), /not namespaced/);
});

test('activation validates home_route_override instead of silently ignoring a bad reference', () => {
  const value = activationPayload();
  value.space_definition.module_instances[0].home_route_override = 'space_home.missing';
  assert.throws(() => assertActivationPayload(value), /home_route_override does not resolve/);
});

test('local_shell_page cannot be claimed by an owner module', () => {
  const value = activationPayload();
  const owner = structuredClone(homeManifest());
  owner.manifest_id = 'demo.interface'; owner.module_id = 'demo'; owner.home_route_id = 'demo.home';
  owner.routes[0] = { ...owner.routes[0], route_id: 'demo.home', module_id: 'demo', surface: { kind: 'local_shell_page', origin_policy: 'same_origin' } };
  owner.sidebar = { module_id: 'demo', visible_depth: 2, items: [{ item_id: 'demo.home', label: 'Demo', order: 0, route_id: 'demo.home' }] };
  owner.offline_behavior = { module_state: 'available', fallback_route_id: 'demo.home' };
  value.space_definition.module_instances.push({ module_id: 'demo', manifest_ref: 'demo.json', enabled: true, required: true, order: 10 });
  value.module_manifests.push(owner);
  assert.throws(() => assertActivationPayload(value), /local_shell_page is reserved/);
});


test('activation accepts standalone-compatible product surface profiles', () => {
  const value = activationPayload();
  const manifest = value.module_manifests[0];
  manifest.default_surface_id = 'control';
  manifest.ui_portability = { integrated_supported: true, standalone_supported: true, standalone_entrypoint_ref: 'space-home://standalone' };
  manifest.surface_profiles = [{
    surface_id: 'control', label: 'Control', home_route_id: 'space_home.home',
    navigation_item_ids: ['home'], topbar_widget_ids: [], command_refs: [], inspector_ref: null,
  }];
  assert.doesNotThrow(() => assertActivationPayload(value));
});

test('activation rejects surface profiles that reference foreign navigation or routes', () => {
  const value = activationPayload();
  const manifest = value.module_manifests[0];
  manifest.default_surface_id = 'control';
  manifest.surface_profiles = [{ surface_id: 'control', label: 'Control', home_route_id: 'space_home.missing', navigation_item_ids: ['foreign'] }];
  assert.throws(() => assertActivationPayload(value), /surface home route does not resolve|surface navigation item does not resolve/);
});

test('activation accepts a bounded Space appearance policy', () => {
  const value = activationPayload();
  value.space_definition.appearance_policy = {
    default_mode: 'system',
    default_accent: 'forest',
    default_density: 'comfortable',
    default_surface_style: 'outlined',
    allowed_modes: ['system', 'light', 'dark'],
    allowed_accents: ['forest', 'ocean', 'slate', 'earth', 'plum'],
    allowed_densities: ['compact', 'comfortable', 'touch'],
    allowed_surface_styles: ['minimal', 'outlined', 'elevated'],
    allow_module_accent: true,
  };
  assert.doesNotThrow(() => assertActivationPayload(value));
});

test('activation rejects an appearance default outside the Space allowed set', () => {
  const value = activationPayload();
  value.space_definition.appearance_policy = {
    default_mode: 'dark',
    allowed_modes: ['light'],
  };
  assert.throws(() => assertActivationPayload(value), /default_mode is not allowed/);
});


test('activation accepts theme-owned density when the deprecated Space density field is omitted', () => {
  const value = activationPayload();
  delete value.space_definition.appearance.density;
  value.interface_theme.tokens.density = 'touch';
  assert.doesNotThrow(() => assertActivationPayload(value));
});

test('activation rejects an appearance accent that is not in the canonical local palette', () => {
  const value = activationPayload();
  value.space_definition.appearance_policy = { default_accent: 'unknown-accent' };
  assert.throws(() => assertActivationPayload(value), /default_accent is invalid/);
});

test('activation rejects a theme accent identity that disagrees with its canonical color', () => {
  const value = activationPayload();
  value.interface_theme.tokens.primary_accent_id = 'ocean';
  assert.throws(() => assertActivationPayload(value), /does not match primary_accent color/);
});

test('activation rejects personal presentation preferences embedded in Space authority', () => {
  const value = activationPayload();
  value.space_definition.presentation_preferences = { mode: 'dark', accent: 'plum', density: 'compact', surface_style: 'elevated' };
  assert.throws(() => assertActivationPayload(value), /outside Space activation authority/);
});

test('topbar projection binding is independent from route activation', () => {
  const value = activationPayload();
  value.module_manifests[0].topbar_widgets = [{
    widget_id: 'space_home.attention', module_id: 'space_home', scope: 'module', slot: 'status', kind: 'counter',
    label: 'Attention', priority: 10, offline_behavior: 'cached_read_only', projection_ref: 'space_home.attention',
    activation: { kind: 'route', route_id: 'space_home.home' },
  }];
  assert.doesNotThrow(() => assertActivationPayload(value));
});

test('counter and resume widgets require an explicit projection_ref', () => {
  const value = activationPayload();
  value.module_manifests[0].topbar_widgets = [{
    widget_id: 'space_home.attention', module_id: 'space_home', scope: 'module', slot: 'status', kind: 'counter',
    label: 'Attention', priority: 10, offline_behavior: 'cached_read_only', activation: { kind: 'route', route_id: 'space_home.home' },
  }];
  assert.throws(() => assertActivationPayload(value), /requires projection_ref/);
});

test('legacy status_provider activation is rejected instead of being treated as click behavior', () => {
  const value = activationPayload();
  value.module_manifests[0].topbar_widgets = [{
    widget_id: 'space_home.status', module_id: 'space_home', scope: 'module', slot: 'status', kind: 'status',
    label: 'Status', priority: 10, offline_behavior: 'cached_read_only', projection_ref: 'space_home.status',
    activation: { kind: 'status_provider', status_provider_ref: 'space_home.status' },
  }];
  assert.throws(() => assertActivationPayload(value), /activation kind is invalid/);
});
