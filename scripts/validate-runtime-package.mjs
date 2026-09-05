import fs from 'node:fs';
const required = ['dist/runtime/.next','dist/runtime/node_modules/next','dist/runtime/server/main.mjs','dist/runtime/public/manifest.webmanifest','dist/runtime/interface-assets/koali-spaces-shell.interface-assets.json'];
const missing = required.filter((p) => !fs.existsSync(p)); if (missing.length) { console.error('missing runtime package entries:', missing); process.exit(1); }
const manifest = JSON.parse(fs.readFileSync('dist/runtime/interface-assets/koali-spaces-shell.interface-assets.json','utf8'));
for (const asset of manifest.assets) { if (!fs.existsSync(`dist/runtime/${asset.path}`)) { console.error('manifested runtime asset missing:', asset.path); process.exit(1); } }
console.log('PASS: runtime package and interface asset manifest are closed');
