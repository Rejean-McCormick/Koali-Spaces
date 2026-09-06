import { permits } from '@/lib/capabilities';
import { admittedModules, effectiveHomeRouteId } from '@/lib/registry';
import type { ModuleManifest, RouteContribution, ShellState } from '@/types/contracts';
import { hasRegisteredComponent } from './registered-component-ids';
import { defaultPresentationPolicy } from './presentation-policy';
import { projectPublicDescriptor } from './project-public-descriptor.server';
import {
  healthObservationFor,
  presentationPolicyFor,
  runtimeObservationFor,
  runtimeRegistrationFor,
  targetFor,
} from './runtime-registry.server';
import { hasShellPage } from './shell-page-registry';
import {
  isSafeRelativeEmbedBase,
  ownerPathFromSegments,
  validateRegisteredEmbedBase,
} from './url-policy';
import type {
  ResolvedSurfaceInternal,
  SurfaceKind,
  SurfaceResolutionFailure,
  SurfaceResolutionResult,
  SurfaceRuntimeRegistry,
  SurfaceStatus,
} from './types';

function failure(
  code: SurfaceResolutionFailure['error']['code'],
  moduleId: string,
  requestedPath: string,
  message: string,
): SurfaceResolutionFailure {
  return { ok: false, error: { code, moduleId, requestedPath, message } };
}

function matchRoutePath(route: RouteContribution, requestedPath: string) {
  const candidates = [route.path, ...(route.aliases ?? [])];
  for (const candidate of candidates) {
    if (candidate === requestedPath) {
      return { matchedBase: candidate, canonicalPath: route.path };
    }
    if (route.deep_link_allowed === false || candidate === '/') continue;
    if (requestedPath.startsWith(`${candidate}/`)) {
      const suffix = requestedPath.slice(candidate.length);
      return { matchedBase: candidate, canonicalPath: `${route.path === '/' ? '' : route.path}${suffix}` || '/' };
    }
  }
  return null;
}

function findRoute(manifest: ModuleManifest, requestedPath: string) {
  return manifest.routes
    .map((route) => ({ route, match: matchRoutePath(route, requestedPath) }))
    .filter((item): item is { route: RouteContribution; match: NonNullable<ReturnType<typeof matchRoutePath>> } => item.match !== null)
    .sort((left, right) => right.match.matchedBase.length - left.match.matchedBase.length)[0] ?? null;
}

function routeAvailabilityAllows(route: RouteContribution, online: boolean) {
  if (route.availability === 'online_only' && !online) return false;
  if (route.availability === 'offline_only' && online) return false;
  if (!online && route.offline_behavior === 'unavailable') return false;
  return true;
}

/**
 * Availability fallback is separate from authorization. A denied route never
 * silently turns into another authorized route; direct navigation remains blocked.
 */
function resolveAvailabilityFallback(
  manifest: ModuleManifest,
  route: RouteContribution,
  online: boolean,
) {
  let current = route;
  const seen = new Set<string>();
  while (!routeAvailabilityAllows(current, online)) {
    if (!current.safe_fallback_route_id || seen.has(current.route_id)) return current;
    seen.add(current.route_id);
    const next = manifest.routes.find((candidate) => candidate.route_id === current.safe_fallback_route_id);
    if (!next) return current;
    current = next;
  }
  return current;
}

function surfaceKind(route: RouteContribution): SurfaceKind | null {
  if (route.surface?.kind) return route.surface.kind;
  if (route.page_ref.startsWith('koa-spaces://page/')) return 'local_shell_page';
  return null;
}

function baseStatus(state: ShellState): SurfaceStatus {
  return {
    access: 'allowed',
    runtime: 'missing',
    connectivity: state.network_state,
    render: 'idle',
  };
}

function statusForRuntime(
  state: ShellState,
  registry: SurfaceRuntimeRegistry,
  runtimeRef: string,
  healthRef: string | undefined,
): SurfaceStatus {
  const status = baseStatus(state);
  const runtime = runtimeObservationFor(registry, runtimeRef);
  status.runtime = runtime?.state ?? 'inactive';
  const health = healthObservationFor(registry, healthRef);
  if (health?.state === 'degraded' && status.runtime === 'ready') status.runtime = 'degraded';
  if (health?.state === 'failed') status.runtime = 'failed';
  return status;
}

export function resolveSurfaceFromState(args: {
  state: ShellState;
  registry: SurfaceRuntimeRegistry;
  moduleId: string;
  routeSegments?: string[];
}): SurfaceResolutionResult {
  let requestedPath: string;
  try {
    requestedPath = ownerPathFromSegments(args.routeSegments);
  } catch (error) {
    return failure(
      'KS_SURFACE_ROUTE_UNKNOWN',
      args.moduleId,
      '/',
      error instanceof Error ? error.message : 'invalid route',
    );
  }

  const moduleId = args.moduleId.trim();
  if (!/^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$/.test(moduleId)) {
    return failure('KS_SURFACE_MODULE_UNKNOWN', moduleId, requestedPath, 'invalid module identity');
  }

  const manifest = admittedModules(args.state).find((candidate) => candidate.module_id === moduleId);
  if (!manifest) {
    return failure('KS_SURFACE_MODULE_UNKNOWN', moduleId, requestedPath, 'module is not admitted by the active Space');
  }

  const requestedHomeRoute = requestedPath === '/'
    ? manifest.routes.find((route) => route.route_id === effectiveHomeRouteId(args.state.active_space, manifest)) ?? null
    : null;
  const routeMatch = requestedHomeRoute ? null : findRoute(manifest, requestedPath);
  const matched = requestedHomeRoute ?? routeMatch?.route ?? null;
  if (!matched) {
    return failure('KS_SURFACE_ROUTE_UNKNOWN', moduleId, requestedPath, 'route is not declared by the active module manifest');
  }

  const canonicalMatchedPath = requestedHomeRoute ? matched.path : routeMatch?.match.canonicalPath ?? matched.path;
  const matchedCapabilities = permits(matched.capability_policy.required_capabilities, args.state.capabilities);
  const online = args.state.network_state !== 'offline';
  const route = matchedCapabilities ? resolveAvailabilityFallback(manifest, matched, online) : matched;
  const resolvedRoutePath = route.route_id === matched.route_id ? canonicalMatchedPath : route.path;
  const kind = surfaceKind(route);
  if (!kind) {
    return failure('KS_SURFACE_TARGET_REJECTED', moduleId, requestedPath, 'route has no admitted surface kind');
  }

  const status = baseStatus(args.state);
  if (!permits(route.capability_policy.required_capabilities, args.state.capabilities)) {
    status.access = 'blocked';
  }
  if (!routeAvailabilityAllows(route, online)) {
    status.runtime = 'missing';
  }

  const policy = presentationPolicyFor(args.registry, moduleId) ?? defaultPresentationPolicy(moduleId, manifest);

  const internal: ResolvedSurfaceInternal = {
    kind,
    spaceId: args.state.active_space?.space_id ?? args.state.active_space_id ?? 'unknown_space',
    moduleId,
    routeId: route.route_id,
    routePath: resolvedRoutePath,
    pageRef: route.page_ref,
    entrypoint: route.surface?.entrypoint,
    status,
    presentation: policy,
  };

  // A blocked surface is fully resolved for presentation purposes but never receives
  // a target. This ensures a ready runtime cannot bypass access=blocked.
  if (internal.status.access === 'blocked') {
    internal.status.runtime = 'inactive';
    const descriptor = projectPublicDescriptor(internal, args.state.active_space, manifest);
    return { ok: true, internal, descriptor };
  }

  if (!routeAvailabilityAllows(route, online)) {
    const descriptor = projectPublicDescriptor(internal, args.state.active_space, manifest);
    return { ok: true, internal, descriptor };
  }

  if (kind === 'local_shell_page') {
    internal.status.runtime = hasShellPage(route.route_id) ? 'ready' : 'missing';
    internal.status.render = internal.status.runtime === 'ready' ? 'ready' : 'idle';
  } else if (kind === 'registered_component_surface') {
    internal.status.runtime = hasRegisteredComponent(route.route_id) ? 'ready' : 'missing';
    internal.status.render = internal.status.runtime === 'ready' ? 'ready' : 'idle';
  } else {
    const registration = runtimeRegistrationFor(args.registry, moduleId);
    if (!registration || registration.adapter !== 'web_app') {
      internal.status.runtime = 'missing';
      const descriptor = projectPublicDescriptor(internal, args.state.active_space, manifest);
      return { ok: true, internal, descriptor };
    }
    if (registration.embedPolicy === 'not_supported') {
      return failure('KS_SURFACE_EMBED_BLOCKED', moduleId, requestedPath, 'runtime registration does not permit embedding');
    }
    internal.runtime = {
      registrationId: registration.registrationId,
      runtimeRef: registration.runtimeRef,
      healthRef: registration.healthRef,
      lifecycleProfileRef: registration.lifecycleProfileRef,
      transportProfileRef: registration.transportProfileRef,
    };
    internal.status = {
      ...statusForRuntime(args.state, args.registry, registration.runtimeRef, registration.healthRef),
      access: internal.status.access,
    };

    const target = targetFor(args.registry, moduleId, registration.transportProfileRef);
    if (target) {
      try {
        validateRegisteredEmbedBase(target.embedBase);
      } catch (error) {
        return failure(
          'KS_SURFACE_TARGET_REJECTED',
          moduleId,
          requestedPath,
          error instanceof Error ? error.message : 'registered target rejected',
        );
      }
      if (route.surface?.origin_policy === 'same_origin' && !isSafeRelativeEmbedBase(target.embedBase)) {
        return failure('KS_SURFACE_TARGET_REJECTED', moduleId, requestedPath, 'same_origin surface resolved to a non-relative target');
      }
      internal.target = target;
    }
    if (!target && internal.status.runtime === 'ready') internal.status.runtime = 'degraded';
  }

  const descriptor = projectPublicDescriptor(internal, args.state.active_space, manifest);
  return { ok: true, internal, descriptor };
}
