import assert from 'node:assert/strict';
import test from 'node:test';
import { digest, receipt } from '../server/receipt.mjs';
test('canonical digest is stable across object key order', () => { assert.equal(digest({ b: { y: 2, x: 1 }, a: 0 }), digest({ a: 0, b: { x: 1, y: 2 } })); });
test('receipt binds theme, local assets, and Koali capability projection', () => {
  const space = { space_id: 'default_space', version: '1.0.0' }; const theme = { theme_id: 'koa_spaces.default' }; const shellAssets = { bundle_id: 'koa_spaces.shell' }; const capabilitySnapshot = { source: 'koa', capabilities: [], may_grant_capabilities: false };
  const value = receipt({ operation: 'activate', space, theme, shellAssets, capabilitySnapshot, manifests: [], moduleAssets: [], profileId: 'developer_windows_wsl', result: 'activated' });
  assert.equal(value.interface_theme_digest, digest(theme)); assert.equal(value.shell_asset_manifest_digest, digest(shellAssets)); assert.equal(value.capability_snapshot_digest, digest(capabilitySnapshot));
});
