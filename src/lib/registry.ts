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

function routeMatchesPath(route: RouteContribution, pathname: string) {
  if (route.path === '/') return pathname === '/';
  return pathname === route.path || pathname.startsWith(`${route.path}/`);
}

export function manifestForPath(state: ShellState, pathname: string) {
  const matches = admittedModules(state)
    .map((manifest) => ({
      manifest,
      best: manifest.routes
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

export function routeIsAvailable(
  route: RouteContribution,
  available: Iterable<string>,
  online: boolean,
) {
  const offlineOk = online || route.offline_behavior !== 'unavailable';
  return offlineOk && permits(route.capability_policy?.required_capabilities, available);
}

export function safeRoute(
  manifest: ModuleManifest,
  requested: string | null,
  available: Iterable<string>,
  online: boolean,
): RouteContribution {
  const start =
    manifest.routes.find((route) => route.route_id === requested) ??
    manifest.routes.find((route) => route.route_id === manifest.home_route_id);
  if (!start) throw new Error('module has no home route');
  let current = start;
  const seen = new Set<string>();
  while (true) {
    if (routeIsAvailable(current, available, online)) return current;
    if (!current.safe_fallback_route_id || seen.has(current.route_id)) {
      const home = manifest.routes.find((route) => route.route_id === manifest.home_route_id);
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

export function visibleSidebarItems(
  manifest: ModuleManifest,
  state: ShellState,
): (SidebarLeaf | SidebarGroup)[] {
  const online = state.network_state !== 'offline';
  const leafVisible = (item: SidebarLeaf) => {
    const route = routeById(manifest, item.route_id);
    return (
      permits(item.required_capabilities, state.capabilities) &&
      !!route &&
      routeIsAvailable(route, state.capabilities, online)
    );
  };
  const result: (SidebarLeaf | SidebarGroup)[] = [];
  for (const item of manifest.sidebar.items) {
    if ('children' in item) {
      if (!permits(item.required_capabilities, state.capabilities)) continue;
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
