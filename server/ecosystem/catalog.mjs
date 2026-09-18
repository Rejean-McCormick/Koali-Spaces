import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const defaultCatalogPath = path.resolve(here, '../../config/ecosystem.catalog.json');

export async function readEcosystemCatalog(filePath = process.env.KOALI_ECOSYSTEM_CATALOG || defaultCatalogPath) {
  const parsed = JSON.parse(await fs.readFile(path.resolve(filePath), 'utf8'));
  if (![1, 2].includes(parsed?.schemaVersion) || !Array.isArray(parsed.products) || !Array.isArray(parsed.sources)) {
    throw new Error('Koali ecosystem catalog is invalid');
  }
  return parsed;
}
