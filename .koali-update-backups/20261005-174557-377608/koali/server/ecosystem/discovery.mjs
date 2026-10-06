import fs from 'node:fs/promises';
import path from 'node:path';
import { assertResolvedEmbedBase } from '../surface-runtime/transport-registry.mjs';
import { readIntegrationContract } from './integration-contract.mjs';

async function exists(candidate) {
  try { await fs.access(candidate); return true; } catch { return false; }
}

async function isDirectory(candidate) {
  try { return (await fs.stat(candidate)).isDirectory(); } catch { return false; }
}

function uniquePaths(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (!item) continue;
    const resolved = path.resolve(item);
    const key = process.platform === 'win32' ? resolved.toLowerCase() : resolved;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(resolved);
  }
  return result;
}

export function splitSearchRoots(value) {
  if (!value) return [];
  const separator = process.platform === 'win32' ? ';' : path.delimiter;
  return value.split(/[\n\r]+/).flatMap((item) => item.split(separator)).map((item) => item.trim()).filter(Boolean);
}

export function defaultSearchRoots(appRoot) {
  const roots = [];
  let current = path.resolve(appRoot);
  for (let depth = 0; depth < 4; depth += 1) {
    const parent = path.dirname(current);
    if (parent === current || parent === path.parse(parent).root) break;
    roots.push(parent);
    current = parent;
  }
  return uniquePaths(roots);
}

async function markersMatch(repoPath, markers) {
  if (!repoPath || !await isDirectory(repoPath)) return false;
  for (const marker of markers ?? []) if (!await exists(path.join(repoPath, marker))) return false;
  return true;
}

async function scanDirectories(root, { maxDepth, ignoredDirectories }) {
  const ignored = new Set(ignoredDirectories ?? []);
  const result = [];
  const queue = [{ dir: root, depth: 0 }];
  const seen = new Set();
  while (queue.length) {
    const { dir, depth } = queue.shift();
    const key = process.platform === 'win32' ? dir.toLowerCase() : dir;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!await isDirectory(dir)) continue;
    result.push(dir);
    if (depth >= maxDepth) continue;
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { continue; }
    for (const entry of entries) {
      if (!entry.isDirectory() || ignored.has(entry.name)) continue;
      queue.push({ dir: path.join(dir, entry.name), depth: depth + 1 });
    }
  }
  return result;
}

function exactCandidates(definition, searchRoots) {
  const candidates = [];
  for (const root of searchRoots) {
    candidates.push(root);
    for (const name of definition.directoryNames ?? []) candidates.push(path.join(root, name));
  }
  return uniquePaths(candidates);
}

async function readWorkspaceHints(filePath) {
  if (!filePath) return { products: {}, sources: {} };
  try {
    const parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));
    if (parsed?.schemaVersion !== 1) return { products: {}, sources: {} };
    return {
      products: parsed.products && typeof parsed.products === 'object' ? parsed.products : {},
      sources: parsed.sources && typeof parsed.sources === 'object' ? parsed.sources : {},
    };
  } catch {
    return { products: {}, sources: {} };
  }
}

async function discoverDefinition(definition, searchRoots, getScan, workspacePath) {
  const explicit = definition.repoEnv ? process.env[definition.repoEnv] : null;
  if (explicit) {
    const resolved = path.resolve(explicit);
    const found = await markersMatch(resolved, definition.markers);
    return { path: resolved, found, source: 'environment', reason: found ? null : 'explicit repository path does not match required markers' };
  }

  if (workspacePath) {
    const resolved = path.resolve(workspacePath);
    if (await markersMatch(resolved, definition.markers)) {
      return { path: resolved, found: true, source: 'workspace', reason: null };
    }
  }

  for (const candidate of exactCandidates(definition, searchRoots)) {
    if (await markersMatch(candidate, definition.markers)) return { path: candidate, found: true, source: 'named-candidate', reason: null };
  }

  for (const root of searchRoots) {
    const candidates = await getScan(root);
    for (const candidate of candidates) {
      if (await markersMatch(candidate, definition.markers)) return { path: candidate, found: true, source: 'marker-scan', reason: null };
    }
  }
  return { path: null, found: false, source: 'not-found', reason: 'repository not found' };
}

function selectVariant(product, variants) {
  const requested = product.variantEnv ? process.env[product.variantEnv] : null;
  if (requested) {
    const selected = variants.find((variant) => variant.id === requested);
    if (selected?.found) return selected;
    return { id: requested, found: false, path: null, source: 'variant-selection', reason: `requested variant ${requested} is unavailable` };
  }
  return variants.find((variant) => variant.preferred && variant.found) ?? variants.find((variant) => variant.found) ?? null;
}

function normalizeExplicitUrl(value) {
  if (!value) return null;
  if (value.startsWith('/')) throw new Error('ecosystem runtime URL override must be an absolute local http(s) origin');
  return assertResolvedEmbedBase(value);
}

function externalIntegration(product, embedBase) {
  return {
    schemaVersion: 1,
    filePath: null,
    productId: product.id,
    owner: 'externally-managed',
    embedBase,
    variables: {},
    processes: [],
    probes: [{ id: 'surface', url: embedBase, required: true, timeoutMs: 1500, statuses: null }],
  };
}

export async function discoverEcosystem({ appRoot, catalog, workspacePath = process.env.KOALI_ECOSYSTEM_WORKSPACE }) {
  const searchRoots = uniquePaths([...splitSearchRoots(process.env.KOALI_ECOSYSTEM_ROOTS), ...defaultSearchRoots(appRoot)]);
  const maxDepth = Number(catalog.scan?.maxDepth ?? 4);
  const scanCache = new Map();
  const getScan = async (root) => {
    if (!scanCache.has(root)) {
      scanCache.set(root, scanDirectories(root, { maxDepth, ignoredDirectories: catalog.scan?.ignoredDirectories ?? [] }));
    }
    return scanCache.get(root);
  };
  const workspace = await readWorkspaceHints(workspacePath);

  const products = [];
  for (const product of catalog.products) {
    const variants = [];
    for (const variant of product.variants ?? []) {
      const hinted = workspace.products?.[product.id]?.[variant.id] ?? null;
      const found = await discoverDefinition(variant, searchRoots, getScan, hinted);
      variants.push({ ...variant, ...found });
    }
    const selected = selectVariant(product, variants);
    const explicitUrl = normalizeExplicitUrl(product.urlEnv ? process.env[product.urlEnv] : null);
    let integration = null;
    let integrationError = null;
    if (explicitUrl) {
      integration = externalIntegration(product, explicitUrl);
    } else if (selected?.found) {
      try {
        integration = await readIntegrationContract(selected.path, product, product.integrationFile ?? 'koali.integration.json');
      } catch (error) {
        integrationError = error instanceof Error ? error.message : 'invalid integration contract';
      }
    }
    products.push({
      ...product,
      variants,
      selectedVariant: selected?.id ?? null,
      repoPath: selected?.path ?? null,
      repoFound: Boolean(selected?.found),
      discoverySource: selected?.source ?? 'not-found',
      discoveryReason: integrationError ?? selected?.reason ?? null,
      integration,
      integrationReady: Boolean(integration),
      embedBase: integration?.embedBase ?? explicitUrl ?? '',
      externallyManaged: Boolean(explicitUrl),
    });
  }

  const sources = [];
  for (const source of catalog.sources) {
    const hinted = workspace.sources?.[source.id] ?? null;
    sources.push({ ...source, ...await discoverDefinition(source, searchRoots, getScan, hinted) });
  }

  return { schemaVersion: 2, discoveredAt: new Date().toISOString(), searchRoots, workspacePath: workspacePath ?? null, products, sources };
}

export async function writeWorkspaceHints(filePath, discovery) {
  if (!filePath) return null;
  const products = {};
  for (const product of discovery.products) {
    products[product.id] = {};
    for (const variant of product.variants) if (variant.found && variant.path) products[product.id][variant.id] = variant.path;
  }
  const sources = {};
  for (const source of discovery.sources) if (source.found && source.path) sources[source.id] = source.path;
  const value = { schemaVersion: 1, updatedAt: new Date().toISOString(), products, sources };
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.tmp-${process.pid}`;
  await fs.writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await fs.rename(temp, filePath);
  return filePath;
}

export function publicDiscovery(discovery) {
  return {
    schemaVersion: discovery.schemaVersion,
    discoveredAt: discovery.discoveredAt,
    products: discovery.products.map((product) => ({
      id: product.id,
      moduleId: product.moduleId,
      publicName: product.publicName,
      repoFound: product.repoFound,
      integrationReady: product.integrationReady,
      selectedVariant: product.selectedVariant,
      availableVariants: product.variants.filter((variant) => variant.found).map((variant) => variant.id),
      externallyManaged: product.externallyManaged,
      embedBase: product.embedBase,
    })),
    sources: discovery.sources.map((source) => ({ id: source.id, publicName: source.publicName, found: source.found })),
  };
}
