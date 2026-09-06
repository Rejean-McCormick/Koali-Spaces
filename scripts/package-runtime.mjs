import fs from 'node:fs';
import path from 'node:path';
const from = '.next/standalone'; const out = 'dist/runtime';
if (!fs.existsSync(from)) { console.error('missing .next/standalone; run next build first'); process.exit(2); }
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const copy = (src, dst) => { if (!fs.existsSync(src)) return; fs.cpSync(src, dst, { recursive: true }); };
copy(from, out);
copy('.next/static', path.join(out, '.next/static'));
copy('public', path.join(out, 'public'));
copy('server', path.join(out, 'server'));
copy('contracts', path.join(out, 'contracts'));
copy('interface', path.join(out, 'interface'));
copy('dist/interface-assets', path.join(out, 'interface-assets'));
const required = [path.join(out, '.next'), path.join(out, 'node_modules/next'), path.join(out, 'server.js'), path.join(out, 'server/main.mjs'), path.join(out, 'public/manifest.webmanifest'), path.join(out, 'interface-assets/koali-spaces-shell.interface-assets.json')];
const missing = required.filter((p) => !fs.existsSync(p)); if (missing.length) { console.error('runtime package incomplete:', missing); process.exit(2); }
console.log('packaged local production runtime at', out);
