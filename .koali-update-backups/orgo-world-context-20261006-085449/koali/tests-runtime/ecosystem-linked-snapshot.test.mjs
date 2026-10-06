import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function catalog() {
  return JSON.parse(await fs.readFile(path.join(root, 'config', 'ecosystem.catalog.json'), 'utf8'));
}

test('integrated snapshot catalog covers supplied non-diagnostic components', async () => {
  const value = await catalog();
  const productIds = new Set(value.products.map((item) => item.id));
  const sourceIds = new Set(value.sources.map((item) => item.id));

  for (const expected of ['konnaxion', 'orgo', 'orgo_worlds', 'semantik_architect', 'koa_mediatheque', 'konfid', 'kor']) {
    assert.equal(productIds.has(expected), true, `missing supervised product ${expected}`);
  }
  for (const expected of ['konnaxion_worlds', 'koa_mediatheque_blank_instance', 'interaction_kernel', 'semantik_runtime_orchestrator', 'koa_linux', 'koa_digital_ecosystem', 'koali_control_panel']) {
    assert.equal(sourceIds.has(expected), true, `missing qualified source ${expected}`);
  }

  const allIds = [...productIds, ...sourceIds];
  assert.equal(allIds.some((id) => /diag/i.test(id)), false);
  assert.equal(productIds.has('konnaxion'), true);
  assert.equal(productIds.has('koa_mediatheque'), true);
});

test('Kristal Framework is reference-only and never a Koali owner product', async () => {
  const value = await catalog();
  const kristal = value.sources.find((item) => item.id === 'kristal_framework');
  assert.ok(kristal);
  assert.equal(kristal.referenceOnly, true);
  assert.equal(kristal.integrationMode, 'reference_only');
  assert.notEqual(kristal.requiredForBootstrap, true);
  assert.equal(value.products.some((item) => item.id === 'kristal_framework'), false);
});

test('every supplied operational component participates in full bootstrap qualification', async () => {
  const value = await catalog();
  for (const product of value.products) {
    assert.equal(product.requiredForBootstrap, true, `${product.id} must qualify for a complete Koali bootstrap`);
  }
  for (const source of value.sources.filter((item) => !item.referenceOnly)) {
    assert.equal(source.requiredForBootstrap, true, `${source.id} must qualify for a complete Koali bootstrap`);
  }
});

test('headless services are explicit and do not pretend to provide browser surfaces', async () => {
  const value = await catalog();
  for (const id of ['semantik_architect', 'konfid', 'kor']) {
    const product = value.products.find((item) => item.id === id);
    assert.ok(product, `missing ${id}`);
    assert.equal(product.affectsShellState, false);
  }
});


test('Orgo and Orgo Worlds are parallel owner applications, not mutually exclusive variants', async () => {
  const value = await catalog();
  const orgo = value.products.find((item) => item.id === 'orgo');
  const worlds = value.products.find((item) => item.id === 'orgo_worlds');
  assert.ok(orgo);
  assert.ok(worlds);
  assert.equal(orgo.variantEnv, undefined);
  assert.deepEqual(orgo.variants.map((item) => item.id), ['base']);
  assert.equal(worlds.moduleId, 'orgo_worlds');
  assert.equal(worlds.requiredForBootstrap, true);
});

test('Interaction Kernel qualification covers Python runtime and the typed Orgo adapter', async () => {
  const value = await catalog();
  const ik = value.sources.find((item) => item.id === 'interaction_kernel');
  const ids = new Set(ik?.qualification?.checks?.map((item) => item.id));
  assert.equal(ids.has('python-runtime'), true);
  assert.equal(ids.has('typescript-orgo-adapter'), true);
});


test('Médiathèque keeps engine and local content instance as separate authorities', async () => {
  const value = await catalog();
  const product = value.products.find((item) => item.id === 'koa_mediatheque');
  const instance = value.sources.find((item) => item.id === 'koa_mediatheque_blank_instance');
  assert.ok(product);
  assert.ok(instance);
  assert.equal(product.affectsShellState, true);
  assert.equal(product.requiredForBootstrap, true);
  assert.equal(instance.integrationMode, 'qualified_sibling_instance');
  assert.equal(instance.requiredForBootstrap, true);
  assert.equal(instance.referenceOnly, false);
});


test('launcher reserves the Médiathèque port and recognizes its process tree as Koali-owned', async () => {
  const launcher = JSON.parse(await fs.readFile(path.join(root, 'launcher', 'launcher-config.json'), 'utf8'));
  assert.equal(launcher.reservedPorts.includes(8501), true);
  assert.equal(launcher.safeProcessMarkers.some((item) => item.toLowerCase().includes('koa_mediatheque')), true);
});


test('Konnaxion is a required owner surface and Konnaxion_Worlds remains a separately qualified engine', async () => {
  const value = await catalog();
  const product = value.products.find((item) => item.id === 'konnaxion');
  const engine = value.sources.find((item) => item.id === 'konnaxion_worlds');
  assert.ok(product);
  assert.ok(engine);
  assert.equal(product.moduleId, 'konnaxion');
  assert.equal(product.affectsShellState, true);
  assert.equal(product.requiredForBootstrap, true);
  assert.deepEqual(product.variants.map((item) => item.id), ['base']);
  assert.equal(engine.integrationMode, 'qualified_sibling_engine');
  assert.equal(engine.requiredForBootstrap, true);
  assert.equal(engine.referenceOnly, false);
  assert.equal(engine.qualification.checks.some((item) => item.id === 'pinned-identity'), true);
});

test('launcher reserves non-conflicting Konnaxion ports and recognizes its process tree', async () => {
  const launcher = JSON.parse(await fs.readFile(path.join(root, 'launcher', 'launcher-config.json'), 'utf8'));
  assert.equal(launcher.reservedPorts.includes(4301), true);
  assert.equal(launcher.reservedPorts.includes(8302), true);
  assert.equal(launcher.safeProcessMarkers.some((item) => item.toLowerCase().includes('konnaxion')), true);
});
