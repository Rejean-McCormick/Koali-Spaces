import assert from 'node:assert/strict';
import test from 'node:test';
import { digest, receipt } from '../server/receipt.mjs';

test('device-local presentation preferences cannot affect Space activation receipt digests', () => {
  const space = {
    space_id: 'test_space',
    version: '1.0.0',
    appearance: { theme_ref: 'themes/default.json', density: 'comfortable' },
  };
  const base = {
    operation: 'activate',
    space,
    theme: { theme_id: 'koa_spaces.default' },
    shellAssets: { bundle_id: 'koa_spaces.shell' },
    capabilitySnapshot: { source: 'koa', capabilities: [], may_grant_capabilities: false },
    manifests: [],
    moduleAssets: [],
    profileId: 'developer_windows_wsl',
    result: 'activated',
  };
  const preferenceA = { mode: 'light', accent: 'forest', density: 'comfortable', surface_style: 'outlined' };
  const preferenceB = { mode: 'dark', accent: 'plum', density: 'compact', surface_style: 'elevated' };

  const receiptA = receipt({ ...base, presentationPreferences: preferenceA });
  const receiptB = receipt({ ...base, presentationPreferences: preferenceB });

  assert.notDeepEqual(preferenceA, preferenceB);
  assert.equal(receiptA.space_definition_digest, digest(space));
  assert.equal(receiptB.space_definition_digest, digest(space));
  assert.equal(receiptA.space_definition_digest, receiptB.space_definition_digest);
  assert.equal('presentation_preferences' in receiptA, false);
  assert.equal('presentation_preferences' in receiptB, false);
});
