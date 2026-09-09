import fs from 'node:fs';

const registryUrl = new URL('../interface/appearance/accent-palette.json', import.meta.url);
const document = JSON.parse(fs.readFileSync(registryUrl, 'utf8'));

if (document?.schema_version !== 1 || !Array.isArray(document.accents) || document.accents.length === 0) {
  throw new Error('Koali accent palette is missing or invalid');
}

const ids = new Set();
const colors = new Set();
for (const accent of document.accents) {
  if (!accent || typeof accent !== 'object' || Array.isArray(accent)) throw new Error('Koali accent palette entry must be an object');
  if (typeof accent.id !== 'string' || !/^[a-z][a-z0-9_-]*$/.test(accent.id)) throw new Error('Koali accent palette id is invalid');
  if (typeof accent.label !== 'string' || accent.label.length === 0) throw new Error(`Koali accent ${accent.id} label is invalid`);
  if (typeof accent.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(accent.color)) throw new Error(`Koali accent ${accent.id} color is invalid`);
  const normalizedColor = accent.color.toLowerCase();
  if (ids.has(accent.id)) throw new Error(`duplicate Koali accent id ${accent.id}`);
  if (colors.has(normalizedColor)) throw new Error(`duplicate Koali accent color ${accent.color}`);
  ids.add(accent.id);
  colors.add(normalizedColor);
}
if (!ids.has(document.default_accent)) throw new Error('Koali accent palette default_accent does not resolve');

export const ACCENT_PALETTE_DOCUMENT = Object.freeze(document);
export const ACCENT_IDS = ids;
export const DEFAULT_ACCENT_ID = document.default_accent;
export const ACCENT_BY_ID = Object.freeze(Object.fromEntries(document.accents.map((accent) => [accent.id, Object.freeze({ ...accent })])));

export function accentIdForColor(color) {
  if (typeof color !== 'string') return null;
  const normalized = color.toLowerCase();
  return document.accents.find((accent) => accent.color.toLowerCase() === normalized)?.id ?? null;
}
