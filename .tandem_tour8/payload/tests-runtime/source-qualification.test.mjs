import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { qualifySource } from '../server/ecosystem/source-qualification.mjs';

test('missing reference-only sources remain references and never block bootstrap qualification', async () => {
  const result = await qualifySource({
    id: 'kristal_framework',
    referenceOnly: true,
    found: false,
    path: null,
    reason: 'repository not found',
  });
  assert.equal(result.state, 'reference');
  assert.match(result.reason, /reference only/i);
  assert.equal(result.checks.length, 0);
});


test('source qualification prevents ../ files outside the owner repo', async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'koali-source-scope-'));
  try {
    const owner = path.join(base, 'owner');
    await fs.mkdir(owner);
    await fs.writeFile(path.join(base, 'sibling.txt'), 'not owner evidence');
    const result = await qualifySource({found: true, path: owner, qualification: {checks: [
      {id: 'escaped', kind: 'file', path: '../sibling.txt'},
    ]}});
    assert.equal(result.state, 'degraded');
    assert.equal(result.checks[0].state, 'failed');
  } finally { await fs.rm(base, {recursive: true, force: true}); }
});

test('source qualification rejects symlink escape and absolute files', async (t) => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'koali-source-link-'));
  try {
    const owner = path.join(base, 'owner');
    await fs.mkdir(owner);
    await fs.writeFile(path.join(base, 'sibling.txt'), 'not owner evidence');
    try { await fs.symlink(path.join(base, 'sibling.txt'), path.join(owner, 'linked.txt')); }
    catch (error) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) return t.skip('symlinks not available'); throw error; }
    const result = await qualifySource({found: true, path: owner, qualification: {checks: [
      {id: 'linked', kind: 'file', path: 'linked.txt'},
      {id: 'absolute', kind: 'file', path: path.join(base, 'sibling.txt')},
    ]}});
    assert.equal(result.state, 'degraded');
    assert.deepEqual(result.checks.map(c => c.state), ['failed', 'failed']);
  } finally { await fs.rm(base, {recursive: true, force: true}); }
});

test('source qualification refuses command cwd outside owner before spawning', async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'koali-source-cwd-'));
  try {
    const owner = path.join(base, 'owner');
    await fs.mkdir(owner);
    const result = await qualifySource({found: true, path: owner, qualification: {checks: [
      {id: 'escaped-cwd', kind: 'command', cwd: '..', command: 'not-a-real-executable'},
    ]}});
    assert.equal(result.state, 'degraded');
    assert.match(result.checks[0].reason, /outside source repository/);
  } finally { await fs.rm(base, {recursive: true, force: true}); }
});

test('valid relative source checks still succeed', async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'koali-source-good-'));
  try {
    await fs.writeFile(path.join(base, 'manifest.json'), '{}');
    const result = await qualifySource({found: true, path: base, qualification: {checks: [
      {id: 'manifest', kind: 'file', path: 'manifest.json'},
    ]}});
    assert.equal(result.state, 'ready');
  } finally { await fs.rm(base, {recursive: true, force: true}); }
});
