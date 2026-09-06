import test from 'node:test';
import assert from 'node:assert/strict';
import { assertResolvedEmbedBase, resolveRegisteredTarget } from '../server/surface-runtime/transport-registry.mjs';

test('registered relative and local http(s) embed bases are accepted', () => {
  assert.equal(assertResolvedEmbedBase('/__apps/konnaxion'), '/__apps/konnaxion');
  assert.equal(assertResolvedEmbedBase('http://127.0.0.1:4300'), 'http://127.0.0.1:4300');
  assert.equal(assertResolvedEmbedBase('https://konnaxion.apps.koali.local'), 'https://konnaxion.apps.koali.local');
});

test('unsafe schemes, credentials, and non-local origins are rejected', () => {
  assert.throws(() => assertResolvedEmbedBase('javascript:alert(1)'));
  assert.throws(() => assertResolvedEmbedBase('http://u:p@127.0.0.1:4300'));
  assert.throws(() => assertResolvedEmbedBase('https://example.com'));
});

test('unknown transport profile has no implicit fallback', () => {
  const registry = { resolvedTargets: [{ moduleId: 'demo', transportProfileRef: 'local', embedBase: 'http://127.0.0.1:4300', sandboxTokens: [], browserPermissions: [] }] };
  assert.equal(resolveRegisteredTarget(registry, 'demo', 'unknown'), null);
});
