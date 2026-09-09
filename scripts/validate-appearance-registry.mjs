import fs from 'node:fs';
import { ACCENT_BY_ID, ACCENT_IDS, DEFAULT_ACCENT_ID, accentIdForColor } from '../server/appearance-registry.mjs';

for (const path of ['interface/themes/default.json', 'interface/themes/community.json', 'interface/themes/school.json']) {
  const theme = JSON.parse(fs.readFileSync(path, 'utf8'));
  const id = theme.tokens?.primary_accent_id ?? accentIdForColor(theme.tokens?.primary_accent);
  if (!id || !ACCENT_IDS.has(id)) throw new Error(`${path}: primary accent does not resolve to canonical accent palette`);
  if (ACCENT_BY_ID[id].color.toLowerCase() !== String(theme.tokens.primary_accent).toLowerCase()) {
    throw new Error(`${path}: primary_accent and primary_accent_id disagree`);
  }
}
if (!ACCENT_IDS.has(DEFAULT_ACCENT_ID)) throw new Error('canonical default accent is missing');
console.log(`PASS: canonical Koali accent palette (${ACCENT_IDS.size} accents) and interface themes are aligned`);
