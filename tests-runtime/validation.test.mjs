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
    tokens: { primary_accent: '#1e6864', density: 'comfortable', radius_scale: 'v1', spacing_scale: 'v1', typography_scale: 'v1', focus_style: 'visible' },
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
test('activation rejects a manifest for a disabled module', () => { const value = activationPayload(); const extra = structuredClone(homeManifest()); extra.manifest_id = 'disabled.interface'; extra.module_id = 'disabled'; extra.home_route_id = 'disabled.home'; extra.routes[0] = { ...extra.routes[0], route_id: 'disabled.home', module_id: 'disabled', path: '/disabled' }; extra.sidebar = { module_id: 'disabled', visible_depth: 2, items: [{ item_id: 'disabled', label: 'Disabled', order: 0, route_id: 'disabled.home' }] }; value.space_definition.module_instances.push({ module_id: 'disabled', manifest_ref: 'disabled.json', enabled: false, required: false, order: 10 }); value.module_manifests.push(extra); assert.throws(() => assertActivationPayload(value), /not enabled by the active Space/); });
test('baseline activation payload is accepted', () => assert.doesNotThrow(() => assertActivationPayload(activationPayload())));
