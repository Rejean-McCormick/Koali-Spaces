import assert from 'node:assert/strict';
import test from 'node:test';

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
