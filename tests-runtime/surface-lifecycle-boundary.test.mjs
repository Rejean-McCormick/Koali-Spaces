import assert from 'node:assert/strict';
import test from 'node:test';
import { directProcessControl, lifecycleRequest } from '../server/surface-runtime/lifecycle-adapter.mjs';

test('lifecycle adapter creates a non-executing broker request', () => {
  const value = lifecycleRequest({ moduleId: 'demo', runtimeRef: 'service:demo', operation: 'start', lifecycleProfileRef: 'koa:node-agent' });
  assert.equal(value.direct_process_control, false);
  assert.equal(value.operation, 'start');
});
test('direct process control is prohibited', () => assert.throws(() => directProcessControl(), /prohibited/));
