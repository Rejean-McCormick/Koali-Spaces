const STATES = new Set(['available', 'cached_read_only', 'degraded', 'unavailable']);
const AVAILABILITY = new Set(['always', 'conditional', 'online_only', 'offline_only']);
const DENIED_BEHAVIORS = new Set(['hidden', 'disabled', 'access_denied']);
const SURFACE_KINDS = new Set(['local_shell_page', 'local_module_surface', 'registered_component_surface']);
const ORIGIN_POLICIES = new Set(['same_origin', 'registered_local_origin']);
const MODULE_ID = /^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$/;
const ROUTE_ID = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
const ROUTE_PATH = /^\/(?:[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~:@!$&()*+,;=-]+)*)?$/;

function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value;
}

function localPath(value, label) {
  if (typeof value !== 'string' || !value || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//') || value.startsWith('/') || value.split('/').includes('..')) {
    throw new Error(`${label} must be a local relative path`);
  }
  return value;
}

function logicalRef(value, label) {
  if (value == null) return value;
  if (typeof value !== 'string' || !value || /^https?:\/\//i.test(value) || value.startsWith('//') || value.includes('\\') || value.split('/').includes('..')) {
    throw new Error(`${label} must be a bounded local logical reference`);
  }
  return value;
}

function assertRoutePath(value, label) {
  if (typeof value !== 'string' || !ROUTE_PATH.test(value)) throw new Error(`${label} is invalid`);
  return value;
}

function routeNamespaceKey(manifest, route, pathValue) {
  // Only Koali-owned local shell pages occupy the global shell namespace.
  // Owner and registered-component routes are always outer-namespaced under /apps/<moduleId>.
  if (route.surface?.kind === 'local_shell_page') return `shell:${pathValue}`;
  return `module:${manifest.module_id}:${pathValue}`;
}

function assertRouteSurface(surface, moduleId) {
  if (surface == null) return;
  object(surface, 'route surface');
  if (!SURFACE_KINDS.has(surface.kind)) throw new Error('unsupported route surface kind');
  if (!ORIGIN_POLICIES.has(surface.origin_policy)) throw new Error('unsupported route surface origin policy');
  if (surface.kind === 'local_shell_page') {
    if (moduleId !== 'space_home') throw new Error('local_shell_page is reserved to the Koali space_home module');
    if (surface.origin_policy !== 'same_origin') throw new Error('local_shell_page must use same_origin');
  }
  if (surface.kind === 'registered_component_surface' && surface.origin_policy !== 'same_origin') {
    throw new Error('registered_component_surface must use same_origin');
  }
  logicalRef(surface.entrypoint, 'surface entrypoint');
  logicalRef(surface.offline_entrypoint, 'surface offline_entrypoint');
  logicalRef(surface.asset_bundle_ref, 'surface asset_bundle_ref');
}

function assertSidebar(manifest, routeIds) {
  const sidebar = object(manifest.sidebar, 'module sidebar');
  if (sidebar.module_id !== manifest.module_id) throw new Error('sidebar module identity mismatch');
  if (sidebar.visible_depth !== 2) throw new Error('sidebar visible_depth must be 2');
  if (!Array.isArray(sidebar.items)) throw new Error('sidebar items must be an array');
  const checkLeaf = (item) => {
    object(item, 'sidebar item');
    if (!item.route_id || !routeIds.has(item.route_id)) throw new Error(`sidebar route does not resolve: ${item.route_id ?? 'missing'}`);
    if (item.availability != null && !AVAILABILITY.has(item.availability)) throw new Error('sidebar availability is invalid');
  };
  for (const item of sidebar.items) {
    object(item, 'sidebar item');
    if (Array.isArray(item.children)) {
      if (item.children.length === 0) throw new Error('sidebar group must not be empty');
      for (const child of item.children) checkLeaf(child);
    } else {
      checkLeaf(item);
    }
  }
}

function assertModuleTopbar(manifest, routeIds) {
  if (!Array.isArray(manifest.topbar_widgets)) throw new Error('topbar_widgets must be an array');
  for (const widget of manifest.topbar_widgets) {
    object(widget, 'topbar widget');
    if (widget.scope === 'module' && widget.module_id !== manifest.module_id) throw new Error('module topbar widget identity mismatch');
    if (widget.activation?.kind === 'route' && (!widget.activation.route_id || !routeIds.has(widget.activation.route_id))) {
      throw new Error(`module topbar route does not resolve: ${widget.activation?.route_id ?? 'missing'}`);
    }
  }
}

export function assertCapabilitySnapshot(value) {
  const snapshot = object(value, 'capability_snapshot');
  if (snapshot.source !== 'koa' || snapshot.may_grant_capabilities !== false) {
    throw new Error('capability snapshot must be a non-authoritative projection from Koali');
  }
  if (!Array.isArray(snapshot.capabilities) || snapshot.capabilities.some((item) => typeof item !== 'string' || !item)) {
    throw new Error('capability snapshot capabilities must be strings');
  }
  if (new Set(snapshot.capabilities).size !== snapshot.capabilities.length) throw new Error('capability snapshot contains duplicates');
  return snapshot;
}

export function assertTheme(theme) {
  object(theme, 'interface_theme');
  if (theme.design_system_id !== 'koali.ant5') throw new Error('unsupported design system');
  const boundary = object(theme.authority_boundary, 'theme authority_boundary');
  if (boundary.presentation_only !== true || boundary.changes_authorization !== false || boundary.changes_module_identity !== false) throw new Error('theme crosses presentation authority boundary');
  if (object(theme.motion_policy, 'theme motion_policy').reduced_motion_supported !== true) throw new Error('theme must support reduced motion');
}

export function assertAssetManifest(manifest, expectedOwnerKind, expectedOwnerId) {
  object(manifest, 'asset manifest');
  if (manifest.owner_kind !== expectedOwnerKind || manifest.owner_id !== expectedOwnerId) throw new Error('asset manifest identity mismatch');
  if (!Array.isArray(manifest.remote_runtime_dependencies) || manifest.remote_runtime_dependencies.length !== 0) throw new Error('remote runtime assets are prohibited');
  const offline = object(manifest.offline_policy, 'asset offline_policy');
  if (offline.local_assets_complete !== true || offline.public_cdn_required !== false || offline.remote_fonts_required !== false || offline.internet_required_for_shell !== false) throw new Error('asset manifest is not offline-closed');
  const boundary = object(manifest.authority_boundary, 'asset authority_boundary');
  if (boundary.presentation_assets_only !== true || boundary.contains_business_authority !== false || boundary.contains_credentials !== false) throw new Error('asset manifest crosses authority boundary');
  if (!Array.isArray(manifest.assets) || manifest.assets.length === 0) throw new Error('asset inventory is empty');
  const paths = new Set();
  for (const asset of manifest.assets) {
    const p = localPath(object(asset, 'asset').path, 'asset path');
    if (paths.has(p)) throw new Error('duplicate asset path');
    paths.add(p);
    if (!/^[0-9a-f]{64}$/.test(asset.sha256 ?? '')) throw new Error('invalid asset digest');
  }
  if (!Array.isArray(manifest.entrypoints) || manifest.entrypoints.length === 0 || manifest.entrypoints.some((p) => !paths.has(localPath(p, 'entrypoint')))) throw new Error('asset entrypoint is not in inventory');
}

export function assertModuleManifest(manifest, routeNamespaces = new Set()) {
  object(manifest, 'module manifest');
  if (!MODULE_ID.test(manifest.module_id ?? '') || !ROUTE_ID.test(manifest.home_route_id ?? '')) throw new Error('module manifest identity is incomplete or invalid');
  const boundary = object(manifest.authority_boundary, 'module authority_boundary');
  if (boundary.presentation_only !== true || boundary.may_grant_capabilities !== false || boundary.direct_domain_writes !== false || boundary.menu_visibility_is_authorization !== false) throw new Error('module manifest crosses authority boundary');
  if (manifest.design_system_compatibility?.design_system_id && manifest.design_system_compatibility.design_system_id !== 'koali.ant5') throw new Error('module design system mismatch');
  if (!Array.isArray(manifest.routes) || manifest.routes.length === 0) throw new Error('module has no routes');

  const routeIds = new Set();
  for (const route of manifest.routes) {
    object(route, 'route');
    if (route.module_id !== manifest.module_id || !ROUTE_ID.test(route.route_id ?? '')) throw new Error('invalid module route identity');
    if (!route.route_id.startsWith(`${manifest.module_id}.`)) throw new Error(`route_id is not namespaced by module_id: ${route.route_id}`);
    assertRoutePath(route.path, 'module route path');
    if (!STATES.has(route.offline_behavior)) throw new Error('route offline behavior missing');
    if (!AVAILABILITY.has(route.availability)) throw new Error('route availability missing or invalid');
    if (route.deep_link_allowed != null && typeof route.deep_link_allowed !== 'boolean') throw new Error('route deep_link_allowed must be boolean when present');
    const capabilityPolicy = object(route.capability_policy, 'route capability_policy');
    if (!Array.isArray(capabilityPolicy.required_capabilities) || capabilityPolicy.required_capabilities.some((item) => typeof item !== 'string' || !item)) throw new Error('route required capabilities are invalid');
    if (!DENIED_BEHAVIORS.has(capabilityPolicy.denied_behavior)) throw new Error('route denied_behavior is invalid');
    assertRouteSurface(route.surface, manifest.module_id);

    if (routeIds.has(route.route_id)) throw new Error(`duplicate route_id: ${route.route_id}`);
    routeIds.add(route.route_id);

    const routeKey = routeNamespaceKey(manifest, route, route.path);
    if (routeNamespaces.has(routeKey)) throw new Error(`route collision: ${route.path}`);
    routeNamespaces.add(routeKey);

    if (route.aliases != null && !Array.isArray(route.aliases)) throw new Error('route aliases must be an array when present');
    for (const alias of route.aliases ?? []) {
      assertRoutePath(alias, 'route alias');
      const aliasKey = routeNamespaceKey(manifest, route, alias);
      if (routeNamespaces.has(aliasKey)) throw new Error(`route collision: ${alias}`);
      routeNamespaces.add(aliasKey);
    }
  }

  if (!routeIds.has(manifest.home_route_id)) throw new Error('home route does not resolve');
  for (const route of manifest.routes) {
    if (route.safe_fallback_route_id && !routeIds.has(route.safe_fallback_route_id)) {
      throw new Error(`safe fallback route does not resolve: ${route.safe_fallback_route_id}`);
    }
  }
  if (manifest.offline_behavior?.fallback_route_id && !routeIds.has(manifest.offline_behavior.fallback_route_id)) {
    throw new Error(`module offline fallback route does not resolve: ${manifest.offline_behavior.fallback_route_id}`);
  }
  assertSidebar(manifest, routeIds);
  assertModuleTopbar(manifest, routeIds);
  return routeIds;
}

export function assertActivationPayload(payload) {
  object(payload, 'activation payload');
  for (const key of ['space_definition', 'interface_theme', 'shell_asset_manifest', 'module_manifests', 'module_asset_manifests', 'capability_snapshot', 'profile_id']) {
    if (!(key in payload)) throw new Error(`missing ${key}`);
  }
  const space = object(payload.space_definition, 'space_definition');
  if (!MODULE_ID.test(space.space_id ?? '') || !MODULE_ID.test(space.default_module_id ?? '')) throw new Error('Space identity is invalid');
  const boundary = object(space.authority_boundary, 'Space authority_boundary');
  if (boundary.presentation_only !== true || boundary.may_grant_capabilities !== false || boundary.contains_business_state !== false || boundary.contains_executable_extension !== false) throw new Error('Space crosses authority boundary');
  const offline = object(space.offline_policy, 'Space offline_policy');
  if (offline.shell_available !== true || offline.retain_last_validated_definition !== true || offline.network_state_indicator !== true || offline.public_cdn_required !== false || offline.remote_runtime_assets_required !== false) throw new Error('Space is not offline-closed');
  assertTheme(payload.interface_theme);
  if (space.appearance?.design_system_id && space.appearance.design_system_id !== payload.interface_theme.design_system_id) throw new Error('Space/theme design system mismatch');
  assertAssetManifest(payload.shell_asset_manifest, 'koa_spaces_shell', 'koa_spaces');
  const capabilitySnapshot = assertCapabilitySnapshot(payload.capability_snapshot);
  const capabilities = new Set(capabilitySnapshot.capabilities);
  if (!Array.isArray(space.module_instances) || space.module_instances.length === 0) throw new Error('Space requires module instances');
  const instances = new Map();
  for (const instance of space.module_instances) {
    object(instance, 'module instance');
    if (!MODULE_ID.test(instance.module_id ?? '')) throw new Error('module instance identity is invalid');
    if (typeof instance.enabled !== 'boolean' || typeof instance.required !== 'boolean') throw new Error('module instance enabled/required flags are invalid');
    if (instance.home_route_override != null && !ROUTE_ID.test(instance.home_route_override)) throw new Error('module home_route_override is invalid');
    if (instances.has(instance.module_id)) throw new Error(`duplicate module instance ${instance.module_id}`);
    instances.set(instance.module_id, instance);
  }
  const defaultInstance = instances.get(space.default_module_id);
  if (!defaultInstance || defaultInstance.enabled !== true) throw new Error('default module instance is missing or disabled');

  if (!Array.isArray(payload.module_manifests) || payload.module_manifests.length === 0) throw new Error('module_manifests must be a non-empty array');
  if (!Array.isArray(payload.module_asset_manifests)) throw new Error('module_asset_manifests must be an array');
  const routeNamespaces = new Set();
  const moduleIds = new Set();
  const manifestsById = new Map();
  const routeIdsGlobal = new Set();
  const expectedAssetBundles = new Map();
  for (const manifest of payload.module_manifests) {
    const routeIds = assertModuleManifest(manifest, routeNamespaces);
    if (moduleIds.has(manifest.module_id)) throw new Error('duplicate module');
    const instance = instances.get(manifest.module_id);
    if (!instance || instance.enabled !== true) throw new Error(`module ${manifest.module_id} is not enabled by the active Space`);
    if (instance.home_route_override && !routeIds.has(instance.home_route_override)) throw new Error(`home_route_override does not resolve for ${manifest.module_id}`);
    moduleIds.add(manifest.module_id);
    manifestsById.set(manifest.module_id, manifest);
    for (const routeId of routeIds) {
      if (routeIdsGlobal.has(routeId)) throw new Error(`duplicate route_id across manifests: ${routeId}`);
      routeIdsGlobal.add(routeId);
    }
    if ((manifest.required_capabilities ?? []).some((required) => !capabilities.has(required))) throw new Error(`module ${manifest.module_id} requires unavailable capability`);
    if (manifest.asset_bundle_ref) {
      if (expectedAssetBundles.has(manifest.asset_bundle_ref)) throw new Error(`module asset bundle ref reused: ${manifest.asset_bundle_ref}`);
      expectedAssetBundles.set(manifest.asset_bundle_ref, manifest.module_id);
    }
  }
  for (const instance of instances.values()) {
    if (instance.enabled === true && instance.required === true && !moduleIds.has(instance.module_id)) throw new Error(`required module ${instance.module_id} is missing`);
  }
  if (!moduleIds.has(space.default_module_id)) throw new Error('default module missing');

  if (!Array.isArray(space.global_topbar)) throw new Error('global_topbar must be an array');
  for (const widget of space.global_topbar) {
    object(widget, 'global topbar widget');
    if (widget.scope !== 'global' || widget.module_id != null) throw new Error('global topbar widget scope is invalid');
    if (widget.activation?.kind === 'route' && (!widget.activation.route_id || !routeIdsGlobal.has(widget.activation.route_id))) {
      throw new Error(`global topbar route does not resolve: ${widget.activation?.route_id ?? 'missing'}`);
    }
  }

  const suppliedAssetBundles = new Set();
  for (const assets of payload.module_asset_manifests) {
    object(assets, 'module asset manifest');
    if (typeof assets.bundle_id !== 'string' || suppliedAssetBundles.has(assets.bundle_id)) throw new Error('duplicate or invalid module asset bundle');
    const ownerId = expectedAssetBundles.get(assets.bundle_id);
    if (!ownerId) throw new Error(`unreferenced module asset bundle ${assets.bundle_id}`);
    assertAssetManifest(assets, 'module', ownerId);
    suppliedAssetBundles.add(assets.bundle_id);
  }
  for (const bundleId of expectedAssetBundles.keys()) {
    if (!suppliedAssetBundles.has(bundleId)) throw new Error(`module asset manifest missing for ${expectedAssetBundles.get(bundleId)}`);
  }
  if (typeof payload.profile_id !== 'string' || !payload.profile_id) throw new Error('profile_id is required');
  return payload;
}
