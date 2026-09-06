import assert from 'node:assert/strict';
import test from 'node:test';
import { assertSurfaceRuntimeRegistry } from '../server/surface-runtime/runtime-registry.mjs';

const registry = () => ({
  schemaVersion: 1,
  runtimeRegistrations: [{ registrationId: 'demo.web', moduleId: 'demo', adapter: 'web_app', runtimeRef: 'service:demo', offlineClass: 'local_optional', embedPolicy: 'supported', transportProfileRef: 'transport:demo' }],
  presentationPolicies: [{ moduleId: 'demo', allowedModes: ['framed', 'immersive'], defaultMode: 'framed', chromeProfile: 'minimal' }],
  resolvedTargets: [{ moduleId: 'demo', transportProfileRef: 'transport:demo', embedBase: '/__apps/demo', sandboxTokens: ['allow-scripts'], browserPermissions: [] }],
  runtimeObservations: [{ runtimeRef: 'service:demo', state: 'ready' }],
  healthObservations: [],
});

test('surface runtime registry accepts a bounded local projection', () => assert.doesNotThrow(() => assertSurfaceRuntimeRegistry(registry())));
test('surface runtime registry rejects duplicate module runtime registrations', () => {
  const value = registry(); value.runtimeRegistrations.push({ ...value.runtimeRegistrations[0], registrationId: 'demo.web.2' });
  assert.throws(() => assertSurfaceRuntimeRegistry(value), /duplicate/);
});

test('surface runtime registry rejects duplicate health observations', () => {
  const value = registry();
  value.healthObservations = [
    { healthRef: 'health:demo', state: 'ready' },
    { healthRef: 'health:demo', state: 'degraded' },
  ];
  assert.throws(() => assertSurfaceRuntimeRegistry(value), /duplicate/);
});

test('surface runtime registry rejects external embed origins', () => {
  const value = registry();
  value.resolvedTargets[0].embedBase = 'https://example.com';
  assert.throws(() => assertSurfaceRuntimeRegistry(value), /allowed local Koali origin/);
});

test('surface runtime registry rejects unsafe same-origin sandbox combination', () => {
  const value = registry();
  value.resolvedTargets[0].sandboxTokens = ['allow-scripts', 'allow-same-origin'];
  assert.throws(() => assertSurfaceRuntimeRegistry(value), /same-origin embed/);
});

test('surface runtime registry rejects unknown browser permission tokens', () => {
  const value = registry();
  value.resolvedTargets[0].browserPermissions = ['arbitrary-future-capability'];
  assert.throws(() => assertSurfaceRuntimeRegistry(value), /unsupported browser permission/);
});

test('surface runtime registry rejects unsafe accent token syntax', () => {
  const value = registry();
  value.presentationPolicies[0].accentTokenRef = 'red);background:url(https://example.invalid)';
  assert.throws(() => assertSurfaceRuntimeRegistry(value), /accent token/);
});
