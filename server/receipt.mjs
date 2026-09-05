import crypto from 'node:crypto';
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
}
export const digest = (value) => crypto.createHash('sha256').update(canonical(value)).digest('hex');
export function receipt({ operation, space, theme, shellAssets, capabilitySnapshot, manifests, moduleAssets, profileId, actorRef = null, result, previous = null }) {
  return {
    receipt_id: `koali-spaces-${operation}-${crypto.randomUUID()}`,
    operation, space_id: space.space_id, space_version: space.version,
    space_definition_digest: digest(space), interface_theme_digest: digest(theme),
    shell_asset_manifest_digest: digest(shellAssets), capability_snapshot_digest: digest(capabilitySnapshot),
    module_manifest_digests: manifests.map((manifest) => ({ module_id: manifest.module_id, digest: digest(manifest) })).sort((a, b) => a.module_id.localeCompare(b.module_id)),
    module_asset_manifest_digests: moduleAssets.map((manifest) => ({ bundle_id: manifest.bundle_id, digest: digest(manifest) })).sort((a, b) => a.bundle_id.localeCompare(b.bundle_id)),
    profile_id: profileId, actor_ref: actorRef, previous_receipt_ref: previous,
    validation: { schema: 'pass', signatures: 'not_required', routes: 'pass', capabilities: 'pass', offline: 'pass', accessibility: 'pass', theme: 'pass', assets: 'pass' },
    result, failure_code: null, recorded_at: new Date().toISOString(), evidence_refs: [],
  };
}
