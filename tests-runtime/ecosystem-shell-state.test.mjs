import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  buildDevelopmentShellState,
  writeDevelopmentShellState,
} from '../server/ecosystem/shell-state-compiler.mjs';
import { assertModuleManifest } from '../server/validation.mjs';

function discovery() {
  return {
    products: [
      {
        id: 'konnaxion', moduleId: 'konnaxion', publicName: 'Konnaxion', description: 'Community', order: 10,
        repoFound: true, externallyManaged: false, integrationReady: true, discoveryReason: null,
      },
      {
        id: 'orgo', moduleId: 'orgo', publicName: 'Orgo', description: 'Work', order: 20,
        repoFound: true, externallyManaged: false, integrationReady: true, discoveryReason: null,
      },
      {
        id: 'semantik_architect', moduleId: 'semantik_architect', publicName: 'SemantiK Architect', description: 'Create', order: 30,
        repoFound: true, externallyManaged: false, integrationReady: true, discoveryReason: null,
      },
      {
        id: 'koa_mediatheque', moduleId: 'koa_mediatheque', publicName: 'Médiathèque kOA', description: 'Library', order: 40,
        repoFound: true, externallyManaged: false, integrationReady: true, discoveryReason: null,
      },
    ],
    sources: [
      { id: 'kristal_framework', publicName: 'Kristal Framework', found: true, repoPath: 'C:/private/Kristal' },
    ],
  };
}

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('development shell compiler projects linked owner applications as sibling modules', async () => {
  const runtimes = new Map([
    ['konnaxion', { state: 'ready', reason: 'ready' }],
    ['orgo', { state: 'ready', reason: 'ready' }],
    ['semantik_architect', { state: 'degraded', reason: 'api unavailable' }],
    ['koa_mediatheque', { state: 'ready', reason: 'ready' }],
  ]);
  const state = await buildDevelopmentShellState({ appRoot, discovery: discovery(), runtimeStates: runtimes });
  assert.equal(state.state, 'degraded');
  assert.equal(state.network_state, 'online');
  assert.deepEqual(
    state.active_space.module_instances.map((item) => item.module_id),
    ['space_home', 'konnaxion', 'orgo', 'semantik_architect', 'koa_mediatheque'],
  );
  assert.deepEqual(
    state.modules.map((item) => item.module_id),
    ['space_home', 'konnaxion', 'orgo', 'semantik_architect', 'koa_mediatheque'],
  );
  assert.match(state.reason, /SemantiK Architect: degraded/);
  const orgo = state.modules.find((item) => item.module_id === 'orgo');
  assert.equal(orgo.routes[0].surface.kind, 'local_module_surface');
  assert.doesNotThrow(() => assertModuleManifest(orgo, new Set()));
  assert.equal(state.modules.find((item) => item.module_id === 'orgo').routes[0].deep_link_allowed, true);
  assert.equal(JSON.stringify(state).includes('repoPath'), false);
  assert.equal(JSON.stringify(state).includes('C:/private/Kristal'), false);
});

test('development shell compiler becomes ready when every admitted owner runtime is ready', async () => {
  const runtimes = new Map(discovery().products.map((product) => [product.id, { state: 'ready', reason: 'ready' }]));
  const state = await buildDevelopmentShellState({ appRoot, discovery: discovery(), runtimeStates: runtimes });
  assert.equal(state.state, 'ready');
  assert.equal(state.reason, null);
});

test('development shell writer materializes canonical active-state.json atomically', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'koali-shell-state-'));
  const runtimes = new Map(discovery().products.map((product) => [product.id, { state: 'ready', reason: 'ready' }]));
  try {
    const file = await writeDevelopmentShellState(temp, appRoot, discovery(), runtimes);
    assert.equal(file, path.join(temp, 'active-state.json'));
    const written = JSON.parse(await fs.readFile(file, 'utf8'));
    assert.equal(written.state, 'ready');
    assert.equal(written.modules.length, 5);
    assert.equal(written._development_projection.source, 'koali-linked-repo-ecosystem');
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
});
