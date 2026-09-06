import { describe, expect, it } from 'vitest';
import { moduleIdFromKoaliPath, ownerPathFromKoaliPath, routeHref } from '@/lib/registry';
import type { ModuleManifest, RouteContribution } from '@/types/contracts';

const route: RouteContribution = {
  route_id: 'demo.home', module_id: 'demo', path: '/inside', page_ref: 'demo://inside', default_label: 'Inside', availability: 'always', offline_behavior: 'available', deep_link_allowed: true, safe_fallback_route_id: null, aliases: [], capability_policy: { required_capabilities: [], denied_behavior: 'access_denied' }, surface: { kind: 'local_module_surface', origin_policy: 'registered_local_origin' },
};
const manifest = { module_id: 'demo' } as ModuleManifest;

describe('outer/inner routing', () => {
  it('namespaces owner routes under /apps/<moduleId>', () => {
    expect(routeHref(manifest, route)).toBe('/apps/demo/inside');
  });
  it('extracts stable module identity and owner path', () => {
    expect(moduleIdFromKoaliPath('/apps/demo/inside/a')).toBe('demo');
    expect(ownerPathFromKoaliPath('/apps/demo/inside/a', 'demo')).toBe('/inside/a');
  });
});
