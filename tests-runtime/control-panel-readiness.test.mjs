import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { buildDevelopmentShellState } from '../server/ecosystem/shell-state-compiler.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const discovery = { products: [{id: 'konnaxion', moduleId: 'konnaxion', publicName: 'Konnaxion',
    repoFound:true, integrationReady:true, affectsShellState:true, order:10 }], sources: [] };

async function projection(runtimeState) {
  const runtimeStates = new Map([['konnaxion', { state: runtimeState, reason: 'synthetic fixture' }]]);
  return buildDevelopmentShellState({appRoot: root, discovery, runtimeStates});
}

test('Koali publishes both shell and independently observable required-module readiness', async () => {
  const ready = await projection('ready');
  assert.equal(ready.state, 'ready');
  assert.deepEqual(ready.module_health.map(({module_id, state, affects_shell_state}) =>
    [module_id, state, affects_shell_state]), [['konnaxion', 'ready', true]]);
  const degraded = await projection('degraded');
  assert.equal(degraded.state, 'degraded');
  assert.equal(degraded.module_health[0].state, 'degraded');
  assert.equal(degraded.module_health[0].affects_shell_state, true);
});

test('Koali preserves optional-module degradation without a global false failure', async () => {
  const optional = {...discovery.products[0], affectsShellState:false};
  const state = await buildDevelopmentShellState({appRoot:root, discovery:{products:[optional],sources:[]},
    runtimeStates:new Map([['konnaxion',{state:'degraded',reason:'unavailable'}]])});
  assert.equal(state.state,'ready');
  assert.equal(state.module_health[0].state,'degraded');
  assert.equal(state.module_health[0].affects_shell_state,false);
});
