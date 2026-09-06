/**
 * Closed compile-time registry keys. Production integrations add explicit keys here
 * together with an explicit component import in component-registry.tsx.
 */
export const REGISTERED_COMPONENT_ROUTE_IDS = [] as const;

export function hasRegisteredComponent(routeId: string) {
  return (REGISTERED_COMPONENT_ROUTE_IDS as readonly string[]).includes(routeId);
}
