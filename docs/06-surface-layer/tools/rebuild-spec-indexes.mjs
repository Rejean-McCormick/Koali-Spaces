import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCK_RE = /^`(LOCK-KS-SURF-\d{3})`\s+—\s+\*\*(.+?)\*\*(.*)$/u;

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}
function rel(p) { return path.relative(root, p).split(path.sep).join('/'); }
function lockClass(source) {
  if (source.startsWith('00-governance/')) return ['governance','foundational'];
  if (source.startsWith('01-core-architecture/')) return ['architecture','foundational'];
  if (source.startsWith('02-host-experience/')) return ['experience','experience'];
  if (source.startsWith('03-routing-and-registry/')) return ['routing_registry','foundational'];
  if (source.startsWith('04-runtime-and-security/')) return ['runtime_security','foundational'];
  if (source.startsWith('05-integrations/')) return ['integration','integration'];
  if (source.startsWith('06-implementation/')) return ['implementation','implementation'];
  if (source.startsWith('07-verification/')) return ['verification','verification'];
  return ['reference','reference'];
}

const markdown = walk(root).filter(p => p.endsWith('.md') && !rel(p).startsWith('archive/')).sort();
const locks = [];
for (const p of markdown) {
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(LOCK_RE);
    if (!m) continue;
    const statement = `${m[2]}${m[3]}`.trim();
    const [lock_class, tier] = lockClass(rel(p));
    locks.push({
      id: m[1],
      rule: statement,
      lock_class,
      tier,
      source_document: rel(p),
      source_line: i + 1,
      change_requires_adr: true
    });
  }
}
locks.sort((a,b) => a.id.localeCompare(b.id));

const openIds = [...new Set(markdown.flatMap(p => {
  const text = fs.readFileSync(p,'utf8');
  return text.match(/OPEN-KS-SURF-\d{3}/g) || [];
}))].sort();

const registry = {
  schema_version: 2,
  lock_set_id: 'KOALI-SURFACE-LAYER-LOCK-001',
  version: '1.1.0',
  status: 'canonical-development-lock',
  owner: 'Koali Spaces',
  scope: 'koali_spaces_surface_layer',
  canonical_lock_source: 'markdown_lock_declarations',
  registry_role: 'generated_projection',
  lock_count: locks.length,
  lock_id_min: locks.at(0)?.id ?? null,
  lock_id_max: locks.at(-1)?.id ?? null,
  open_decisions: openIds,
  excluded_projects: ['ame-artificielle','votingmachine'],
  surface_kinds: ['local_shell_page','registered_component_surface','local_module_surface'],
  display_modes: ['framed','immersive'],
  locks
};
fs.mkdirSync(path.join(root,'locks'), {recursive:true});
fs.writeFileSync(path.join(root,'locks/koali-surface-layer.lock.json'), JSON.stringify(registry,null,2)+'\n');

const dirs = {};
for (const p of markdown) {
  const r = rel(p);
  const top = r.includes('/') ? r.split('/')[0] : '_root';
  if (top === 'archive') continue;
  (dirs[top] ||= []).push(r);
}
for (const k of Object.keys(dirs)) dirs[k].sort();

const docIndex = {
  spec_id:'KOALI-SURFACE-LAYER-LOCK-001',
  version:'1.1.0',
  canonical_entrypoint:'README.md',
  ai_entrypoint:'AI_READ_ORDER.md',
  canonical_lock_source:'markdown_lock_declarations',
  lock_registry:'locks/koali-surface-layer.lock.json',
  source_registry:'sources/SOURCES.lock.json',
  schemas_dir:'schemas',
  directories:dirs
};
fs.writeFileSync(path.join(root,'DOC_INDEX.json'), JSON.stringify(docIndex,null,2)+'\n');

console.log(`rebuilt: ${locks.length} locks, ${markdown.length} markdown docs`);
