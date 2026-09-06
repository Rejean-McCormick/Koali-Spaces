import { describe, expect, it } from 'vitest';
import { resolveSurfaceFromState } from '@/lib/surfaces/resolve-surface.server';
import type { SurfaceRuntimeRegistry } from '@/lib/surfaces/types';
import type { ShellState } from '@/types/contracts';

function state(): ShellState {
  return {
    state: 'ready',
    network_state: 'online',
    active_space_id: 'work',
    active_space: {
      space_id: 'work',
      title: 'Work',
      version: '1.0.0',
      default_module_id: 'konnaxion',
      module_instances: [{ module_id: 'konnaxion', manifest_ref: 'konnaxion.json', enabled: true, required: true, order: 0 }],
      global_topbar: [],
      appearance: { theme_ref: 'themes/default.json', density: 'comfortable' },
      offline_policy: { shell_available: true, retain_last_validated_definition: true, unavailable_module_behavior: 'show_declared_fallback', network_state_indicator: true },
      authority_boundary: {},
    },
    active_theme: null,
    active_module_id: 'konnaxion',
    active_route_id: 'konnaxion.ethikos',
    capabilities: ['ethikos.read'],
    reason: null,
    modules: [{
      manifest_id: 'konnaxion.interface',
      manifest_version: '1.0.0',
      module_id: 'konnaxion',
      public_name: 'Konnaxion',
      home_route_id: 'konnaxion.home',
      required_capabilities: [],
      routes: [
        {
          route_id: 'konnaxion.home', module_id: 'konnaxion', path: '/', page_ref: 'konnaxion://home', default_label: 'Konnaxion', availability: 'always', offline_behavior: 'degraded', deep_link_allowed: true, safe_fallback_route_id: null, aliases: [], capability_policy: { required_capabilities: [], denied_behavior: 'access_denied' }, surface: { kind: 'local_module_surface', origin_policy: 'registered_local_origin' },
        },
        {
          route_id: 'konnaxion.ethikos', module_id: 'konnaxion', path: '/ethikos', page_ref: 'konnaxion://ethikos', default_label: 'Ethikos', availability: 'always', offline_behavior: 'degraded', deep_link_allowed: true, safe_fallback_route_id: 'konnaxion.home', aliases: [], capability_policy: { required_capabilities: ['ethikos.read'], denied_behavior: 'access_denied' }, surface: { kind: 'local_module_surface', origin_policy: 'registered_local_origin' },
        },
      ],
      sidebar: { module_id: 'konnaxion', visible_depth: 2, items: [] },
      topbar_widgets: [],
      offline_behavior: { module_state: 'degraded', fallback_route_id: 'konnaxion.home' },
      authority_boundary: {},
    }],
  };
}

function registry(): SurfaceRuntimeRegistry {
  return {
    schemaVersion: 1,
    runtimeRegistrations: [{
      registrationId: 'konnaxion.web', moduleId: 'konnaxion', adapter: 'web_app', runtimeRef: 'service:konnaxion-web', healthRef: 'health:konnaxion-web', transportProfileRef: 'transport:konnaxion', offlineClass: 'local_optional', embedPolicy: 'supported',
    }],
    presentationPolicies: [{ moduleId: 'konnaxion', allowedModes: ['framed', 'immersive'], defaultMode: 'framed', chromeProfile: 'minimal', accentTokenRef: 'module.konnaxion' }],
    resolvedTargets: [{ transportProfileRef: 'transport:konnaxion', moduleId: 'konnaxion', embedBase: 'http://127.0.0.1:4300', iframeTitle: 'Konnaxion', sandboxTokens: ['allow-scripts', 'allow-forms'], browserPermissions: [] }],
    runtimeObservations: [{ runtimeRef: 'service:konnaxion-web', state: 'ready' }],
    healthObservations: [{ healthRef: 'health:konnaxion-web', state: 'ready' }],
  };
}

describe('SurfaceResolutionService', () => {
  it('resolves an admitted owner deep link into a minimized public descriptor', () => {
    const result = resolveSurfaceFromState({ state: state(), registry: registry(), moduleId: 'konnaxion', routeSegments: ['ethikos', 'deliberate', 'topic-1'] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.descriptor.kind).toBe('local_module_surface');
    expect(result.descriptor.target?.embedSrc).toBe('http://127.0.0.1:4300/ethikos/deliberate/topic-1');
    expect(result.descriptor.status).toMatchObject({ access: 'allowed', runtime: 'ready', connectivity: 'online', render: 'idle' });
    expect(JSON.stringify(result.descriptor)).not.toContain('service:konnaxion-web');
    expect(JSON.stringify(result.descriptor)).not.toContain('health:konnaxion-web');
  });

  it('honors the active Space home_route_override for /apps/<moduleId>', () => {
    const shell = state();
    shell.active_space!.module_instances[0].home_route_override = 'konnaxion.ethikos';
    const result = resolveSurfaceFromState({ state: shell, registry: registry(), moduleId: 'konnaxion', routeSegments: [] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.descriptor.routeId).toBe('konnaxion.ethikos');
    expect(result.descriptor.target?.embedSrc).toBe('http://127.0.0.1:4300/ethikos');
  });

  it('canonicalizes a public alias before forwarding the owner deep link', () => {
    const shell = state();
    shell.modules[0].routes[1].aliases = ['/ethics'];
    const result = resolveSurfaceFromState({ state: shell, registry: registry(), moduleId: 'konnaxion', routeSegments: ['ethics', 'topic-1'] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.descriptor.routeId).toBe('konnaxion.ethikos');
    expect(result.descriptor.target?.embedSrc).toBe('http://127.0.0.1:4300/ethikos/topic-1');
  });

  it('fails closed for an unknown module', () => {
    const result = resolveSurfaceFromState({ state: state(), registry: registry(), moduleId: 'unknown', routeSegments: [] });
    expect(result).toMatchObject({ ok: false, error: { code: 'KS_SURFACE_MODULE_UNKNOWN' } });
  });

  it('does not invent a target when runtime registration is missing', () => {
    const value = registry();
    value.runtimeRegistrations = [];
    const result = resolveSurfaceFromState({ state: state(), registry: value, moduleId: 'konnaxion', routeSegments: [] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.descriptor.status.runtime).toBe('missing');
    expect(result.descriptor.target).toBeUndefined();
  });

  it('blocks a route when required presentation capabilities are absent without mounting or falling back', () => {
    const value = state();
    value.capabilities = [];
    const result = resolveSurfaceFromState({ state: value, registry: registry(), moduleId: 'konnaxion', routeSegments: ['ethikos'] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.descriptor.routeId).toBe('konnaxion.ethikos');
    expect(result.descriptor.status.access).toBe('blocked');
    expect(result.descriptor.target).toBeUndefined();
  });

  it('fails closed when an otherwise registered target points to a non-local origin', () => {
    const value = registry();
    value.resolvedTargets[0] = { ...value.resolvedTargets[0], embedBase: 'https://example.com' };
    const result = resolveSurfaceFromState({ state: state(), registry: value, moduleId: 'konnaxion', routeSegments: [] });
    expect(result).toMatchObject({ ok: false, error: { code: 'KS_SURFACE_TARGET_REJECTED' } });
  });


  it('does not expose an embed target while the runtime is inactive', () => {
    const value = registry();
    value.runtimeObservations = [{ runtimeRef: 'service:konnaxion-web', state: 'inactive' }];
    const result = resolveSurfaceFromState({ state: state(), registry: value, moduleId: 'konnaxion', routeSegments: [] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.descriptor.status.runtime).toBe('inactive');
    expect(result.descriptor.target).toBeUndefined();
  });

  it('rejects encoded traversal in a deep link', () => {
    const result = resolveSurfaceFromState({ state: state(), registry: registry(), moduleId: 'konnaxion', routeSegments: ['%2e%2e', 'secret'] });
    expect(result).toMatchObject({ ok: false, error: { code: 'KS_SURFACE_ROUTE_UNKNOWN' } });
  });
});
