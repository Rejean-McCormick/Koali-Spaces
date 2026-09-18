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

function affectsShellState(product) {
  return product.affectsShellState !== false;
}

function buildOwnerManifest(product) {
  const moduleId = product.moduleId;
  const homeRouteId = `${moduleId}.home`;

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
    // Hosted applications own their internal navigation. Koali intentionally
    // does not duplicate a one-item sidebar around an embedded product.
    sidebar: {
      module_id: moduleId,
      visible_depth: 2,
      items: [],
    },
    default_surface_id: 'control',
    surface_profiles: [{
      surface_id: 'control',
      label: product.publicName,
      home_route_id: homeRouteId,
      navigation_item_ids: [],
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

function buildModuleHealth(admittedProducts, runtimeStates) {
  return admittedProducts.map((product) => {
    const runtime = runtimeStateFor(product, runtimeStates);
    return {
      module_id: product.moduleId,
      product_id: product.id,
      state: runtime.state,
      reason: runtime.reason ?? null,
      affects_shell_state: affectsShellState(product),
    };
  });
}

function blockingProjectionReason(moduleHealth, productsByModule) {
  const issues = moduleHealth.filter((item) => item.affects_shell_state && item.state !== 'ready');
  if (!issues.length) return null;
  const details = issues.map((item) => {
    const product = productsByModule.get(item.module_id);
    const label = product?.publicName ?? item.module_id;
    const detail = item.reason ? ` (${item.reason})` : '';
    return `${label}: ${item.state}${detail}`;
  });
  return `Development ecosystem degraded — ${details.join('; ')}`;
}

export async function readDevelopmentShellBase(appRoot) {
  const filePath = path.join(appRoot, BASE_STATE_FILE);
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

/**
 * Compile the developer orchestration view into the canonical presentation
 * contract consumed by /api/shell-state. Repository paths, process commands,
 * credentials and other orchestration details are deliberately excluded.
 *
 * KS4.4 distinguishes shell-critical products from optional products. An
 * optional owner runtime can be degraded without putting the whole Koali shell
 * into degraded state; its module remains visible with its own health status.
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

  const moduleHealth = buildModuleHealth(discovery.products, runtimeStates);
  const productsByModule = new Map(discovery.products.map((product) => [product.moduleId, product]));
  const reason = blockingProjectionReason(moduleHealth, productsByModule);
  state.state = reason ? 'degraded' : 'ready';
  state.reason = reason;
  state.module_health = moduleHealth;

  // Internal evidence is intentionally removed from the public API by
  // shell-state.server.ts. It makes the on-disk development projection easy
  // to diagnose without leaking repository paths or process commands.
  state._development_projection = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    source: 'koali-linked-repo-ecosystem',
    modules: admittedProducts.map((product) => ({
      productId: product.id,
      moduleId: product.moduleId,
      runtimeState: runtimeStateFor(product, runtimeStates).state,
      affectsShellState: affectsShellState(product),
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
