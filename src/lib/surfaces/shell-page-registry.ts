export const LOCAL_SHELL_PAGE_ROUTES = Object.freeze({
  'space_home.home': '/',
  'space_home.search': '/search',
  'space_home.tasks': '/tasks',
  'space_home.offline': '/offline',
  'space_home.health': '/health',
  'space_home.settings': '/settings',
} as const);

export type LocalShellRouteId = keyof typeof LOCAL_SHELL_PAGE_ROUTES;

export function shellPageHref(routeId: string) {
  return (LOCAL_SHELL_PAGE_ROUTES as Record<string, string>)[routeId] ?? null;
}

export function hasShellPage(routeId: string) {
  return shellPageHref(routeId) !== null;
}
