import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { discoverEcosystem, writeWorkspaceHints } from '../server/ecosystem/discovery.mjs';
import { readIntegrationContract } from '../server/ecosystem/integration-contract.mjs';
import { buildSurfaceRuntimeRegistry } from '../server/ecosystem/runtime-state.mjs';
import { probeProduct, startProductProcesses } from '../tools/workspace-launcher/manifest-runner.mjs';

async function touch(file) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, 'x');
}

async function writeContract(root, productId, webPort = 4301, apiPort = 8301) {
  await fs.writeFile(path.join(root, 'koali.integration.json'), JSON.stringify({
    schemaVersion: 1,
    productId,
    owner: `${productId}-owner`,
    variables: {
      webPort: { type: 'port', default: webPort },
      apiPort: { type: 'port', default: apiPort },
    },
    surface: { embedBase: 'http://127.0.0.1:${webPort}' },
    processes: [],
    probes: [
      { id: 'api', url: 'http://127.0.0.1:${apiPort}/health/ready', required: true, statuses: [200] },
      { id: 'web', url: 'http://127.0.0.1:${webPort}/', required: true, statuses: [200] },
    ],
  }, null, 2));
}

function catalog() {
  return {
    schemaVersion: 2,
    scan: { maxDepth: 4, ignoredDirectories: ['node_modules', '.git'] },
    products: [{
      id: 'konnaxion', moduleId: 'konnaxion', publicName: 'Konnaxion', description: '', order: 10,
      variantEnv: 'KOALI_KONNAXION_VARIANT', urlEnv: 'KOALI_KONNAXION_URL', integrationFile: 'koali.integration.json', accentTokenRef: 'module.konnaxion',
      variants: [
        { id: 'base', preferred: true, repoEnv: 'KOALI_REPO_KONNAXION', directoryNames: ['Konnaxion'], markers: ['frontend/package.json', 'backend/manage.py'] },
        { id: 'worlds', preferred: false, repoEnv: 'KOALI_REPO_KONNAXION_WORLDS', directoryNames: ['Konnaxion_Worlds'], markers: ['Konnaxion_World_Manager.pyw', 'frontend/package.json', 'backend/manage.py'] },
      ],
    }],
    sources: [{ id: 'kristal_framework', publicName: 'Kristal Framework', directoryNames: ['kristal-framework'], markers: ['contract-set.manifest.json'] }],
  };
}

test('discovers linked repos, reads owner contracts, and keeps Worlds as a selectable source variant', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'koali-ecosystem-'));
  const appRoot = path.join(temp, 'mycode', 'kOA-Linux', 'koali-spaces');
  const base = path.join(temp, 'mycode', 'Konnaxion', 'Konnaxion');
  const worlds = path.join(temp, 'mycode', 'Konnaxion', 'Konnaxion_Worlds');
  const kristal = path.join(temp, 'mycode', 'Kristal', 'kristal-framework');
  await fs.mkdir(appRoot, { recursive: true });
  await touch(path.join(base, 'frontend/package.json'));
  await touch(path.join(base, 'backend/manage.py'));
  await touch(path.join(worlds, 'Konnaxion_World_Manager.pyw'));
  await touch(path.join(worlds, 'frontend/package.json'));
  await touch(path.join(worlds, 'backend/manage.py'));
  await writeContract(base, 'konnaxion');
  await writeContract(worlds, 'konnaxion');
  await touch(path.join(kristal, 'contract-set.manifest.json'));

  const previous = process.env.KOALI_KONNAXION_VARIANT;
  delete process.env.KOALI_KONNAXION_VARIANT;
  try {
    const first = await discoverEcosystem({ appRoot, catalog: catalog() });
    assert.equal(first.products[0].selectedVariant, 'base');
    assert.equal(first.products[0].integrationReady, true);
    assert.equal(first.products[0].integration.owner, 'konnaxion-owner');
    assert.deepEqual(first.products[0].variants.filter((v) => v.found).map((v) => v.id).sort(), ['base', 'worlds']);
    assert.equal(first.sources[0].found, true);

    process.env.KOALI_KONNAXION_VARIANT = 'worlds';
    const second = await discoverEcosystem({ appRoot, catalog: catalog() });
    assert.equal(second.products[0].selectedVariant, 'worlds');
    assert.equal(path.basename(second.products[0].repoPath), 'Konnaxion_Worlds');
  } finally {
    if (previous == null) delete process.env.KOALI_KONNAXION_VARIANT;
    else process.env.KOALI_KONNAXION_VARIANT = previous;
    await fs.rm(temp, { recursive: true, force: true });
  }
});

test('workspace hints become the preferred repository lookup after initial discovery', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'koali-workspace-'));
  const appRoot = path.join(temp, 'workspace', 'koali-spaces');
  const repo = path.join(temp, 'owners', 'Konnaxion');
  const workspacePath = path.join(temp, 'workspace.json');
  await fs.mkdir(appRoot, { recursive: true });
  await touch(path.join(repo, 'frontend/package.json'));
  await touch(path.join(repo, 'backend/manage.py'));
  await writeContract(repo, 'konnaxion');
  process.env.KOALI_REPO_KONNAXION = repo;
  try {
    const first = await discoverEcosystem({ appRoot, catalog: catalog(), workspacePath });
    await writeWorkspaceHints(workspacePath, first);
    delete process.env.KOALI_REPO_KONNAXION;
    const second = await discoverEcosystem({ appRoot, catalog: catalog(), workspacePath });
    assert.equal(second.products[0].discoverySource, 'workspace');
    assert.equal(second.products[0].repoPath, path.resolve(repo));
  } finally {
    delete process.env.KOALI_REPO_KONNAXION;
    await fs.rm(temp, { recursive: true, force: true });
  }
});

test('builds a runtime registry without copying repository paths into browser targets', () => {
  const discovery = { products: [{
    id: 'orgo', moduleId: 'orgo', publicName: 'Orgo', repoFound: true, integrationReady: true, externallyManaged: false,
    embedBase: 'http://127.0.0.1:4302', accentTokenRef: 'module.orgo', discoveryReason: null,
  }] };
  const registry = buildSurfaceRuntimeRegistry(discovery, new Map([['orgo', { state: 'ready', reason: '2 required probe(s) ready' }]]));
  assert.equal(registry.runtimeRegistrations[0].moduleId, 'orgo');
  assert.equal(registry.resolvedTargets[0].embedBase, 'http://127.0.0.1:4302');
  assert.equal(registry.runtimeObservations[0].state, 'ready');
  assert.equal(JSON.stringify(registry).includes('repoPath'), false);
});

test('runtime registry keeps Médiathèque as an independent sibling module', () => {
  const discovery = { products: [
    { id: 'koa_mediatheque', moduleId: 'koa_mediatheque', publicName: 'Médiathèque kOA', repoFound: true, integrationReady: true, externallyManaged: false, embedBase: 'http://127.0.0.1:8501', accentTokenRef: 'module.koa_mediatheque', discoveryReason: null },
    { id: 'kristal_runtime', moduleId: 'kristal_runtime', publicName: 'Kristal Runtime', repoFound: false, integrationReady: false, externallyManaged: false, embedBase: '', accentTokenRef: 'module.kristal_runtime', discoveryReason: 'not an app surface' },
  ] };
  const registry = buildSurfaceRuntimeRegistry(discovery);
  const media = registry.runtimeRegistrations.find((item) => item.moduleId === 'koa_mediatheque');
  assert.equal(media?.runtimeRef, 'runtime.koa_mediatheque.web');
  assert.equal(media?.runtimeRef.includes('kristal'), false);
});

test('owner contract product id mismatch fails closed', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'koali-contract-'));
  await writeContract(temp, 'wrong-owner');
  await assert.rejects(
    () => readIntegrationContract(temp, { id: 'orgo', moduleId: 'orgo', publicName: 'Orgo' }),
    /productId must be orgo/,
  );
  await fs.rm(temp, { recursive: true, force: true });
});

test('required backend failure degrades a product even when its frontend is alive', async () => {
  const web = http.createServer((_req, res) => { res.statusCode = 200; res.end('ok'); });
  const api = http.createServer((_req, res) => { res.statusCode = 503; res.end('down'); });
  await new Promise((resolve) => web.listen(0, '127.0.0.1', resolve));
  await new Promise((resolve) => api.listen(0, '127.0.0.1', resolve));
  const webPort = web.address().port;
  const apiPort = api.address().port;
  try {
    const product = {
      integration: {
        probes: [
          { id: 'web', url: `http://127.0.0.1:${webPort}`, required: true, timeoutMs: 500, statuses: [200] },
          { id: 'api', url: `http://127.0.0.1:${apiPort}`, required: true, timeoutMs: 500, statuses: [200] },
        ],
      },
    };
    const status = await probeProduct(product);
    assert.equal(status.state, 'degraded');
    assert.equal(status.probes.find((probe) => probe.id === 'web').state, 'ready');
    assert.equal(status.probes.find((probe) => probe.id === 'api').state, 'degraded');
  } finally {
    await new Promise((resolve) => web.close(resolve));
    await new Promise((resolve) => api.close(resolve));
  }
});

test('explicit runtime URL remains restricted to admitted local Koali origins', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'koali-origin-'));
  const appRoot = path.join(temp, 'workspace', 'kOA-Linux', 'koali-spaces');
  await fs.mkdir(appRoot, { recursive: true });
  const previous = process.env.KOALI_KONNAXION_URL;
  process.env.KOALI_KONNAXION_URL = 'https://example.com';
  try {
    await assert.rejects(() => discoverEcosystem({ appRoot, catalog: catalog() }), /allowed local Koali origin/);
  } finally {
    if (previous == null) delete process.env.KOALI_KONNAXION_URL;
    else process.env.KOALI_KONNAXION_URL = previous;
    await fs.rm(temp, { recursive: true, force: true });
  }
});


test('generic launcher does not duplicate a process whose mapped readiness probe is already healthy', async () => {
  const web = http.createServer((_req, res) => { res.statusCode = 200; res.end('ok'); });
  await new Promise((resolve) => web.listen(0, '127.0.0.1', resolve));
  const webPort = web.address().port;
  const processStates = new Map();
  try {
    const product = {
      id: 'demo',
      repoFound: true,
      externallyManaged: false,
      integration: {
        probes: [{ id: 'web', url: `http://127.0.0.1:${webPort}/`, required: true, timeoutMs: 500, statuses: [200] }],
        processes: [{
          id: 'web',
          probeId: 'web',
          cwd: os.tmpdir(),
          command: 'this-command-must-never-be-spawned',
          args: [],
          env: process.env,
          shell: false,
        }],
      },
    };
    const children = await startProductProcesses({ products: [product] }, processStates);
    assert.equal(children.length, 0);
    assert.equal(processStates.get('demo')?.state, 'external-or-already-running');
  } finally {
    await new Promise((resolve) => web.close(resolve));
  }
});
