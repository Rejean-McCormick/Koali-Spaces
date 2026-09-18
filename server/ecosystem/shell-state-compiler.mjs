import fs from 'node:fs/promises';
import path from 'node:path';

import { atomicWriteJson } from './runtime-state.mjs';

const BASE_STATE_FILE = path.join('config', 'development-shell-state.base.json');
const VALID_NETWORK_STATES = new Set(['online', 'offline', 'unknown']);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizedNetworkState() {
  const configured = String(process.env.KOALI_ECOSYSTEM_NETWORK_STATE ?? 'online').toLowerCase();
  return VALID_NETWORK_STATES.has(configured) ? configured : 'online';
}

function runtimeStateFor(product, runtimeStates) {
  if (!product.repoFound && !product.externallyManaged) {
    return { state: 'missing', reason: product.discoveryReason ?? 'repository not found' };
  }
  if (!product.integrationReady) {
    return { state: 'missing', reason: product.discoveryReason ?? 'owner integration contract unavailable' };
  }
  return runtimeStates.get(product.id) ?? { state: 'starting', reason: 'runtime has not been observed yet' };
}

function buildOwnerManifest(product) {
  const moduleId = product.moduleId;
  const homeRouteId = `${moduleId}.home`;
  const homeItemId = `${moduleId}.home`;

  return {
    manifest_id: `koali.dev.${moduleId}`,
    manifest_version: '1.0.0',
    module_id: moduleId,
    public_name: product.publicName,
    ...(product.description ? { description: product.description } : {}),
    home_route_id: homeRouteId,
    required_capabilities: [],
    routes: [{
      route_id: homeRouteId,
      module_id: moduleId,
      path: '/',
      page_ref: `koali-owner://${product.id}/`,
      default_label: product.publicName,
      availability: 'always',
      offline_behavior: 'available',
      deep_link_allowed: true,
      safe_fallback_route_id: null,
      aliases: [],
      capability_policy: { required_capabilities: [], denied_behavior: 'access_denied' },
      surface: {
        kind: 'local_module_surface',
        origin_policy: 'registered_local_origin',
        entrypoint: '/',
      },
    }],
    sidebar: {
      module_id: moduleId,
      visible_depth: 2,
      items: [{
        item_id: homeItemId,
        label: product.publicName,
        order: 0,
        route_id: homeRouteId,
      }],
    },
    default_surface_id: 'control',
    surface_profiles: [{
      surface_id: 'control',
      label: product.publicName,
      home_route_id: homeRouteId,
      navigation_item_ids: [homeItemId],
      topbar_widget_ids: [],
      command_refs: [],
      inspector_ref: null,
    }],
    ui_portability: {
      integrated_supported: true,
      standalone_supported: true,
    },
    topbar_widgets: [],
    offline_behavior: {
      module_state: 'available',
      fallback_route_id: null,
    },
    authority_boundary: {
      presentation_only: true,
      may_grant_capabilities: false,
      direct_domain_writes: false,
      menu_visibility_is_authorization: false,
    },
  };
}

function projectionReason(discovery, runtimeStates) {
  const issues = [];
  for (const product of discovery.products) {
    const runtime = runtimeStateFor(product, runtimeStates);
    if (runtime.state === 'ready') continue;
    const detail = runtime.reason ? ` (${runtime.reason})` : '';
    issues.push(`${product.publicName}: ${runtime.state}${detail}`);
  }
  return issues.length ? `Development ecosystem degraded — ${issues.join('; ')}` : null;
}

export async function readDevelopmentShellBase(appRoot) {
  const filePath = path.join(appRoot, BASE_STATE_FILE);
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

/**
 * Compile the developer orchestration view into the canonical presentation
 * contract consumed by /api/shell-state.  Repository paths, process commands,
 * credentials and other orchestration details are deliberately excluded.
 */
export async function buildDevelopmentShellState({ appRoot, discovery, runtimeStates = new Map() }) {
  const state = clone(await readDevelopmentShellBase(appRoot));
  const admittedProducts = discovery.products
    .filter((product) => product.integrationReady && (product.repoFound || product.externallyManaged))
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

  const baseInstances = state.active_space?.module_instances ?? [];
  const baseModules = state.modules ?? [];

  const ownerInstances = admittedProducts.map((product) => ({
    module_id: product.moduleId,
    manifest_ref: `development-owner:${product.id}`,
    enabled: true,
    required: false,
    order: product.order ?? 100,
    public_label: product.publicName,
  }));
  const ownerModules = admittedProducts.map(buildOwnerManifest);

  state.active_space = {
    ...state.active_space,
    module_instances: [...baseInstances, ...ownerInstances],
  };
  state.modules = [...baseModules, ...ownerModules];
  state.network_state = normalizedNetworkState();

  const reason = projectionReason(discovery, runtimeStates);
  state.state = reason ? 'degraded' : 'ready';
  state.reason = reason;

  // Internal evidence is intentionally removed from the public API by
  // shell-state.server.ts. It makes the on-disk development projection easy
  // to diagnose without leaking repository paths or process commands.
  state._development_projection = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: 'koali-linked-repo-ecosystem',
    modules: admittedProducts.map((product) => ({
      productId: product.id,
      moduleId: product.moduleId,
      runtimeState: runtimeStateFor(product, runtimeStates).state,
    })),
  };

  return state;
}

export async function writeDevelopmentShellState(stateRoot, appRoot, discovery, runtimeStates = new Map()) {
  const state = await buildDevelopmentShellState({ appRoot, discovery, runtimeStates });
  const filePath = path.join(stateRoot, 'active-state.json');
  await atomicWriteJson(filePath, state);
  return filePath;
}
