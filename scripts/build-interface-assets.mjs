import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const roots = ['.next/static', 'public'];
const assets = [];
const mediaType = (p) => p.endsWith('.css') ? 'text/css' : p.endsWith('.js') ? 'text/javascript' : p.endsWith('.json') || p.endsWith('.webmanifest') ? 'application/json' : p.endsWith('.svg') ? 'image/svg+xml' : p.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream';
for (const root of roots) {
  if (!fs.existsSync(root)) { console.error(`missing required browser asset root: ${root}`); process.exit(2); }
  const walk = (dir) => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory()) walk(full); else { const rel = full.replace(/\\/g, '/'); assets.push({ path: rel, media_type: mediaType(rel), sha256: crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex'), offline_required: true, cache_policy: rel.startsWith('.next/static/') ? 'immutable' : 'versioned' }); } } };
  walk(root);
}
assets.sort((a, b) => a.path.localeCompare(b.path));
const entrypoints = assets.filter((asset) => asset.path.endsWith('.js')).map((asset) => asset.path);
if (!entrypoints.length) { console.error('no local JavaScript entrypoint found'); process.exit(2); }
const doc = { $schema: '../../contracts/koa/interface-asset-manifest.schema.json', bundle_id: 'koa_spaces.shell', version: '1.0.0', owner_kind: 'koa_spaces_shell', owner_id: 'koa_spaces', entrypoints, assets, remote_runtime_dependencies: [], offline_policy: { local_assets_complete: true, public_cdn_required: false, remote_fonts_required: false, internet_required_for_shell: false }, compatibility: { shell_min_version: '1.0.0', design_system_id: 'koali.ant5', module_manifest_version: '1.0.0' }, authority_boundary: { presentation_assets_only: true, contains_business_authority: false, contains_credentials: false } };
fs.mkdirSync('dist/interface-assets', { recursive: true });
fs.writeFileSync('dist/interface-assets/koali-spaces-shell.interface-assets.json', JSON.stringify(doc, null, 2) + '\n');
console.log('wrote shell asset manifest', assets.length, 'assets from', roots.join(', '));
