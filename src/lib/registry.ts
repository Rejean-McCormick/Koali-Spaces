import type {
  ModuleManifest,
  RouteContribution,
  ShellState,
  SidebarGroup,
  SidebarLeaf,
  SpaceDefinition,
  TopbarWidget,
} from '@/types/contracts';
import { permits } from './capabilities';
import { normalizeLocalHref } from './url-policy';

const RESERVED_SHELL_PATHS = new Set(['/', '/search', '/tasks', '/offline', '/health', '/settings']);

export function admittedModules(state: ShellState) {
  const enabled = new Map(
    (state.active_space?.module_instances ?? [])
      .filter((instance) => instance.enabled)
      .map((instance) => [instance.module_id, instance]),
  );
  return state.modules
    .filter(
      (manifest) =>
        enabled.has(manifest.module_id) &&
        permits(manifest.required_capabilities, state.capabilities),
    )
    .sort(
      (left, right) =>
        (enabled.get(left.module_id)?.order ?? 0) -
        (enabled.get(right.module_id)?.order ?? 0),
    );
}

export function moduleIdFromKoaliPath(pathname: string) {
  const match = pathname.match(/^\/apps\/([a-z][a-z0-9]*(?:[_-][a-z0-9]+)*)(?:\/|$)/);
  return match?.[1] ?? null;
}

export function ownerPathFromKoaliPath(pathname: string, moduleId: string) {
  const prefix = `/apps/${moduleId}`;
  if (pathname === prefix || pathname === `${prefix}/`) return '/';
  if (!pathname.startsWith(`${prefix}/`)) return pathname;
  return normalizeLocalHref(pathname.slice(prefix.length));
}

export function routeMatchesPath(route: RouteContribution, pathname: string) {
  const candidates = [route.path, ...(route.aliases ?? [])];
  return candidates.some((candidate) => {
    if (candidate === pathname) return true;
    if (route.deep_link_allowed === false || candidate === '/') return false;
    return pathname.startsWith(`${candidate}/`);
  });
}

export function manifestForPath(state: ShellState, pathname: string) {
  const outerModuleId = moduleIdFromKoaliPath(pathname);
  if (outerModuleId) {
    return admittedModules(state).find((manifest) => manifest.module_id === outerModuleId) ?? null;
  }

  const matches = admittedModules(state)
    .map((manifest) => ({
      manifest,
      best: manifest.routes
        .filter((route) => route.surface?.kind !== 'local_module_surface')
        .filter((route) => routeMatchesPath(route, pathname))
        .sort((a, b) => b.path.length - a.path.length)[0],
    }))
    .filter((item) => item.best)
    .sort((a, b) => (b.best?.path.length ?? 0) - (a.best?.path.length ?? 0));
  return matches[0]?.manifest ?? null;
}

export function activeManifest(state: ShellState, pathname?: string) {
  if (pathname) {
    const pathOwner = manifestForPath(state, pathname);
    if (pathOwner) return pathOwner;
  }
  const modules = admittedModules(state);
  return modules.find((manifest) => manifest.module_id === state.active_module_id) ?? modules[0] ?? null;
}

export function routeById(manifest: ModuleManifest | null, id: string | null) {
  return manifest?.routes.find((route) => route.route_id === id) ?? null;
}

export function routeByIdInState(state: ShellState, id: string | null) {
  if (!id) return null;
  for (const manifest of admittedModules(state)) {
    const route = routeById(manifest, id);
    if (route) return { manifest, route };
  }
  return null;
}


function declaredAvailabilityAllows(
  availability: RouteContribution['availability'] | undefined,
  online: boolean,
) {
  if (availability === 'online_only') return online;
  if (availability === 'offline_only') return !online;
  // `conditional` has no standalone condition expression in the current kOA
  // artifact contract; capability requirements remain evaluated separately.
  return true;
}

export function routeAvailabilityAllows(route: RouteContribution, online: boolean) {
  if (!declaredAvailabilityAllows(route.availability, online)) return false;
  return online || route.offline_behavior !== 'unavailable';
}


export function routeCapabilityAllowed(route: RouteContribution, available: Iterable<string>) {
  return permits(route.capability_policy?.required_capabilities, available);
}

export function routeIsAvailable(
  route: RouteContribution,
  available: Iterable<string>,
  online: boolean,
) {
  return routeAvailabilityAllows(route, online) && routeCapabilityAllowed(route, available);
}

export function effectiveHomeRouteId(
  space: SpaceDefinition | null,
  manifest: ModuleManifest,
) {
  return (
    space?.module_instances.find((instance) => instance.module_id === manifest.module_id)
      ?.home_route_override ?? manifest.home_route_id
  );
}

export function safeRoute(
  manifest: ModuleManifest,
  requested: string | null,
  available: Iterable<string>,
  online: boolean,
  space: SpaceDefinition | null = null,
): RouteContribution {
  const homeRouteId = effectiveHomeRouteId(space, manifest);
  const start =
    manifest.routes.find((route) => route.route_id === requested) ??
    manifest.routes.find((route) => route.route_id === homeRouteId);
  if (!start) throw new Error('module has no home route');
  let current = start;
  const seen = new Set<string>();
  while (true) {
    if (routeIsAvailable(current, available, online)) return current;
    if (!current.safe_fallback_route_id || seen.has(current.route_id)) {
      const home = manifest.routes.find((route) => route.route_id === homeRouteId);
      if (home && routeIsAvailable(home, available, online)) return home;
      return current;
    }
    seen.add(current.route_id);
    current =
      manifest.routes.find(
        (route) => route.route_id === current.safe_fallback_route_id,
      ) ?? current;
  }
}

export function routeHref(manifest: ModuleManifest, route: RouteContribution) {
  if (route.surface?.kind === 'local_module_surface' || route.surface?.kind === 'registered_component_surface') {
    const suffix = route.path === '/' ? '' : route.path;
    return normalizeLocalHref(`/apps/${manifest.module_id}${suffix}`);
  }
  if (!route.surface && manifest.module_id !== 'space_home' && !RESERVED_SHELL_PATHS.has(route.path)) {
    const suffix = route.path === '/' ? '' : route.path;
    return normalizeLocalHref(`/apps/${manifest.module_id}${suffix}`);
  }
  return normalizeLocalHref(route.path);
}

export function routeSelectedForPath(
  manifest: ModuleManifest,
  route: RouteContribution,
  pathname: string,
) {
  const ownerPath = moduleIdFromKoaliPath(pathname) === manifest.module_id
    ? ownerPathFromKoaliPath(pathname, manifest.module_id)
    : pathname;
  return routeMatchesPath(route, ownerPath);
}

export function visibleSidebarItems(
  manifest: ModuleManifest,
  state: ShellState,
): (SidebarLeaf | SidebarGroup)[] {
  const online = state.network_state !== 'offline';
  const leafVisible = (item: SidebarLeaf) => {
    const route = routeById(manifest, item.route_id);
    if (!permits(item.required_capabilities, state.capabilities) || !route) return false;
    if (!declaredAvailabilityAllows(item.availability, online)) return false;
    if (!routeAvailabilityAllows(route, online)) return false;
    const routeAllowed = routeCapabilityAllowed(route, state.capabilities);
    return routeAllowed || route.capability_policy.denied_behavior !== 'hidden';
  };
  const result: (SidebarLeaf | SidebarGroup)[] = [];
  for (const item of manifest.sidebar.items) {
    if ('children' in item) {
      if (!permits(item.required_capabilities, state.capabilities)) continue;
      if (!declaredAvailabilityAllows(item.availability, online)) continue;
      const children = item.children.filter(leafVisible);
      if (children.length) result.push({ ...item, children });
      continue;
    }
    if (leafVisible(item)) result.push(item);
  }
  return result;
}

export function visibleTopbarWidgets(
  space: SpaceDefinition | null,
  manifest: ModuleManifest | null,
  state: ShellState,
): TopbarWidget[] {
  const online = state.network_state !== 'offline';
  const widgets = [...(space?.global_topbar ?? []), ...(manifest?.topbar_widgets ?? [])];
  const seen = new Set<string>();
  return widgets
    .filter((widget) => {
      if (seen.has(widget.widget_id)) return false;
      seen.add(widget.widget_id);
      return (
        permits(widget.required_capabilities, state.capabilities) &&
        (online || widget.offline_behavior !== 'unavailable')
      );
    })
    .sort((left, right) => left.priority - right.priority);
}

export function publicLabel(space: SpaceDefinition | null, module: ModuleManifest) {
  return (
    space?.module_instances.find((instance) => instance.module_id === module.module_id)
      ?.public_label ?? module.public_name
  );
}
