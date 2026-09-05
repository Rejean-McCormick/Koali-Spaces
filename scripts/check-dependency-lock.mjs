import fs from 'node:fs';
if (!fs.existsSync('pnpm-lock.yaml')) {
  console.error('BLOCKED: pnpm-lock.yaml is not present. Generate it from the reviewed package.json with pnpm 10.20.0 before release/build freezing; do not fabricate it.');
  process.exit(2);
}
console.log('PASS: pnpm-lock.yaml present');
