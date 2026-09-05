const STATES = new Set(['available', 'cached_read_only', 'degraded', 'unavailable']);

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

export function assertModuleManifest(manifest, routePaths) {
  object(manifest, 'module manifest');
  if (!manifest.module_id || !manifest.home_route_id) throw new Error('module manifest identity is incomplete');
  const boundary = object(manifest.authority_boundary, 'module authority_boundary');
  if (boundary.presentation_only !== true || boundary.may_grant_capabilities !== false || boundary.direct_domain_writes !== false || boundary.menu_visibility_is_authorization !== false) throw new Error('module manifest crosses authority boundary');
  if (manifest.design_system_compatibility?.design_system_id && manifest.design_system_compatibility.design_system_id !== 'koali.ant5') throw new Error('module design system mismatch');
  if (!Array.isArray(manifest.routes) || manifest.routes.length === 0) throw new Error('module has no routes');
  let hasHome = false;
  for (const route of manifest.routes) {
    object(route, 'route');
    if (route.module_id !== manifest.module_id || typeof route.path !== 'string' || !route.path.startsWith('/')) throw new Error('invalid module route');
    if (!STATES.has(route.offline_behavior)) throw new Error('route offline behavior missing');
    if (routePaths.has(route.path)) throw new Error(`route collision: ${route.path}`);
    routePaths.add(route.path);
    for (const alias of route.aliases ?? []) {
      if (routePaths.has(alias)) throw new Error(`route collision: ${alias}`);
      routePaths.add(alias);
    }
    if (route.route_id === manifest.home_route_id) hasHome = true;
  }
  if (!hasHome) throw new Error('home route does not resolve');
  if (manifest.sidebar?.visible_depth !== 2) throw new Error('sidebar visible_depth must be 2');
}

export function assertActivationPayload(payload) {
  object(payload, 'activation payload');
  for (const key of ['space_definition', 'interface_theme', 'shell_asset_manifest', 'module_manifests', 'module_asset_manifests', 'capability_snapshot', 'profile_id']) {
    if (!(key in payload)) throw new Error(`missing ${key}`);
  }
  const space = object(payload.space_definition, 'space_definition');
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
    if (typeof instance.module_id !== 'string' || !instance.module_id) throw new Error('module instance identity is invalid');
    if (typeof instance.enabled !== 'boolean' || typeof instance.required !== 'boolean') throw new Error('module instance enabled/required flags are invalid');
    if (instances.has(instance.module_id)) throw new Error(`duplicate module instance ${instance.module_id}`);
    instances.set(instance.module_id, instance);
  }
  const defaultInstance = instances.get(space.default_module_id);
  if (!defaultInstance || defaultInstance.enabled !== true) throw new Error('default module instance is missing or disabled');

  if (!Array.isArray(payload.module_manifests) || payload.module_manifests.length === 0) throw new Error('module_manifests must be a non-empty array');
  if (!Array.isArray(payload.module_asset_manifests)) throw new Error('module_asset_manifests must be an array');
  const routePaths = new Set();
  const moduleIds = new Set();
  const expectedAssetBundles = new Map();
  for (const manifest of payload.module_manifests) {
    assertModuleManifest(manifest, routePaths);
    if (moduleIds.has(manifest.module_id)) throw new Error('duplicate module');
    const instance = instances.get(manifest.module_id);
    if (!instance || instance.enabled !== true) throw new Error(`module ${manifest.module_id} is not enabled by the active Space`);
    moduleIds.add(manifest.module_id);
    if ((manifest.required_capabilities ?? []).some((required) => !capabilities.has(required))) throw new Error(`module ${manifest.module_id} requires unavailable capability`);
    if (manifest.asset_bundle_ref) expectedAssetBundles.set(manifest.asset_bundle_ref, manifest.module_id);
  }
  for (const instance of instances.values()) {
    if (instance.enabled === true && instance.required === true && !moduleIds.has(instance.module_id)) throw new Error(`required module ${instance.module_id} is missing`);
  }
  if (!moduleIds.has(space.default_module_id)) throw new Error('default module missing');

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
