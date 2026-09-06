import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const LOCK_RE = /^`(LOCK-KS-SURF-\d{3})`\s+—\s+\*\*(.+?)\*\*(.*)$/u;
function fail(msg){ errors.push(msg); }
function walk(dir){
  const out=[];
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}
function rel(p){ return path.relative(root,p).split(path.sep).join('/'); }
function parseJson(relPath){
  try { return JSON.parse(fs.readFileSync(path.join(root,relPath),'utf8')); }
  catch(e){ fail(`${relPath}: invalid JSON: ${e.message}`); return null; }
}

const required = [
  'README.md','AI_READ_ORDER.md','DOC_INDEX.json',
  'locks/koali-surface-layer.lock.json','sources/SOURCES.lock.json',
  'schemas/surface-descriptor-public.schema.json',
  'schemas/runtime-registration.schema.json',
  'schemas/surface-presentation-policy.schema.json',
  'schemas/application-conformance-profile.schema.json'
];
for(const r of required) if(!fs.existsSync(path.join(root,r))) fail(`missing required file: ${r}`);

const allJson = walk(root).filter(p=>p.endsWith('.json'));
for(const p of allJson) parseJson(rel(p));

const markdown = walk(root).filter(p=>p.endsWith('.md') && !rel(p).startsWith('archive/'));
const declared=[];
for(const p of markdown){
  const lines=fs.readFileSync(p,'utf8').split(/\r?\n/);
  lines.forEach((line,i)=>{
    const m=line.match(LOCK_RE);
    if(m){
      const rule=`${m[2]}${m[3]}`.trim();
      declared.push({id:m[1],rule,source_document:rel(p),source_line:i+1});
    }
  });
}
declared.sort((a,b)=>a.id.localeCompare(b.id));
const dupIds = declared.filter((x,i,a)=>i && x.id===a[i-1].id).map(x=>x.id);
if(dupIds.length) fail(`duplicate lock declarations: ${[...new Set(dupIds)].join(', ')}`);

const nums=declared.map(x=>Number(x.id.slice(-3)));
for(let n=1;n<=Math.max(...nums,0);n++) if(!nums.includes(n)) fail(`missing lock id: LOCK-KS-SURF-${String(n).padStart(3,'0')}`);
if(declared.length!==154) fail(`expected 154 lock declarations, found ${declared.length}`);

const registry=parseJson('locks/koali-surface-layer.lock.json');
if(registry){
  if(registry.registry_role!=='generated_projection') fail('lock registry must declare generated_projection role');
  if(registry.canonical_lock_source!=='markdown_lock_declarations') fail('canonical_lock_source mismatch');
  if(registry.lock_count!==declared.length) fail(`lock_count mismatch: ${registry.lock_count} vs ${declared.length}`);
  const rlocks=registry.locks||[];
  if(rlocks.length!==declared.length) fail(`registry locks length mismatch: ${rlocks.length} vs ${declared.length}`);
  for(let i=0;i<Math.min(rlocks.length,declared.length);i++){
    for(const k of ['id','rule','source_document','source_line']){
      if(rlocks[i][k]!==declared[i][k]) fail(`lock projection mismatch ${declared[i].id} field ${k}`);
    }
  }
  const openInDocs=[...new Set(markdown.flatMap(p=>(fs.readFileSync(p,'utf8').match(/OPEN-KS-SURF-\d{3}/g)||[])))].sort();
  const openReg=[...(registry.open_decisions||[])].sort();
  if(JSON.stringify(openInDocs)!==JSON.stringify(openReg)) fail(`OPEN decision registry mismatch`);
  const expectedOpen=['OPEN-KS-SURF-001','OPEN-KS-SURF-002','OPEN-KS-SURF-003','OPEN-KS-SURF-004','OPEN-KS-SURF-005','OPEN-KS-SURF-006'];
  if(JSON.stringify(openReg)!==JSON.stringify(expectedOpen)) fail(`expected OPEN decision set 001..006`);
}

const sources=parseJson('sources/SOURCES.lock.json');
if(sources){
  const ids=(sources.sources||[]).map(x=>x.source_id);
  if(new Set(ids).size!==ids.length) fail('duplicate source_id in SOURCES.lock.json');
  for(const s of sources.sources||[]){
    if(!/^[0-9a-f]{40}$/.test(s.source_commit||'')) fail(`invalid source commit for ${s.source_id}`);
    if(!/^[0-9a-f]{64}$/.test(s.context_pack_sha256||'')) fail(`invalid context pack sha256 for ${s.source_id}`);
  }
  for(const excluded of ['ame-artificielle','votingmachine']){
    const s=(sources.sources||[]).find(x=>x.source_id===excluded);
    if(!s || s.scope!=='excluded') fail(`${excluded} must be pinned as excluded`);
  }
}

const docIndex=parseJson('DOC_INDEX.json');
if(docIndex){
  const indexed=new Set(Object.values(docIndex.directories||{}).flat());
  for(const p of markdown){
    const r=rel(p);
    if(!indexed.has(r)) fail(`markdown missing from DOC_INDEX: ${r}`);
  }
}

if(errors.length){
  console.error('FAIL: surface spec validation');
  for(const e of errors) console.error(` - ${e}`);
  process.exit(1);
}
console.log(`PASS: Surface Layer spec v1.1 is internally consistent (${declared.length} locks)`);
