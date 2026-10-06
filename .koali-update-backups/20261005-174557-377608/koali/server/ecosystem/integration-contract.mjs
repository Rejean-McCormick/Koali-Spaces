import fs from 'node:fs/promises';
import path from 'node:path';
import { assertResolvedEmbedBase, isAllowedLocalHostname } from '../surface-runtime/transport-registry.mjs';

const TOKEN = /\$\{([A-Za-z0-9_.-]+)\}/g;

function assertLocalProbeUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported probe scheme');
  if (url.username || url.password) throw new Error('probe URL userinfo is prohibited');
  if (!isAllowedLocalHostname(url.hostname)) throw new Error('probe origin is not an allowed local Koali origin');
  if (url.hash) throw new Error('probe URL fragment is prohibited');
  return url.toString();
}

function platformValue(value, platform = process.platform) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return value;
  if (Object.hasOwn(value, platform)) return value[platform];
  if (Object.hasOwn(value, 'default')) return value.default;
  return undefined;
}

function envInteger(name, fallback) {
  const raw = name ? process.env[name] : undefined;
  const value = raw == null || raw === '' ? fallback : Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${name || 'port'} must resolve to a TCP port between 1 and 65535`);
  }
  return value;
}

function resolveVariables(raw, builtins = {}) {
  const result = { ...builtins };
  for (const [name, spec] of Object.entries(raw ?? {})) {
    if (spec == null || typeof spec !== 'object' || Array.isArray(spec)) {
      result[name] = String(spec ?? '');
      continue;
    }
    const selected = platformValue(spec);
    if (selected !== spec && (typeof selected !== 'object' || selected == null)) {
      result[name] = String(selected ?? '');
      continue;
    }
    if (spec.type === 'port') {
      result[name] = String(envInteger(spec.env, spec.default));
      continue;
    }
    const envValue = spec.env ? process.env[spec.env] : undefined;
    const fallback = platformValue(spec.default);
    result[name] = String(envValue ?? fallback ?? '');
  }
  return result;
}

function interpolate(value, variables) {
  if (typeof value !== 'string') return value;
  return value.replace(TOKEN, (_, name) => {
    if (!Object.hasOwn(variables, name)) throw new Error(`unknown integration variable: ${name}`);
    return String(variables[name]);
  });
}

function resolveMap(raw, variables) {
  return Object.fromEntries(Object.entries(raw ?? {}).map(([key, value]) => [key, interpolate(String(value), variables)]));
}

function activeOnPlatform(spec) {
  if (!Array.isArray(spec.platforms) || spec.platforms.length === 0) return true;
  return spec.platforms.includes(process.platform);
}

function resolveCommand(raw, variables) {
  if (typeof raw === 'string') return interpolate(raw, variables);
  if (!raw || typeof raw !== 'object') throw new Error('integration process command is required');
  if (raw.env && process.env[raw.env]) return String(process.env[raw.env]);
  const selected = platformValue(raw);
  if (typeof selected !== 'string' || !selected.trim()) throw new Error('integration process command does not support this platform');
  return interpolate(selected, variables);
}

function resolveBoolean(raw, fallback = false) {
  const selected = platformValue(raw);
  return selected == null ? fallback : Boolean(selected);
}

function normalizeStatuses(value) {
  if (Array.isArray(value) && value.length) {
    return value.map(Number).filter((item) => Number.isInteger(item) && item >= 100 && item <= 599);
  }
  return null;
}

function validateRaw(raw, expectedProductId, filePath) {
  if (raw?.schemaVersion !== 1) throw new Error(`${filePath}: schemaVersion must be 1`);
  if (!raw.productId || raw.productId !== expectedProductId) {
    throw new Error(`${filePath}: productId must be ${expectedProductId}`);
  }
  if (!raw.surface || typeof raw.surface.embedBase !== 'string') {
    throw new Error(`${filePath}: surface.embedBase is required`);
  }
  if (!Array.isArray(raw.processes)) throw new Error(`${filePath}: processes must be an array`);
  if (!Array.isArray(raw.probes) || raw.probes.length === 0) throw new Error(`${filePath}: probes must contain at least one probe`);
}

export async function readIntegrationContract(repoPath, product, fileName = 'koali.integration.json') {
  const filePath = path.join(repoPath, fileName);
  const raw = JSON.parse(await fs.readFile(filePath, 'utf8'));
  validateRaw(raw, product.id, filePath);

  const variables = resolveVariables(raw.variables, {
    repo: repoPath,
    productId: product.id,
    moduleId: product.moduleId,
  });
  const embedBase = assertResolvedEmbedBase(interpolate(raw.surface.embedBase, variables));

  const processes = raw.processes
    .filter(activeOnPlatform)
    .map((spec) => {
      if (!spec.id) throw new Error(`${filePath}: every process requires an id`);
      const cwdRaw = interpolate(spec.cwd ?? '.', variables);
      const cwd = path.resolve(repoPath, cwdRaw);
      const argsRaw = platformValue(spec.args) ?? [];
      if (!Array.isArray(argsRaw)) throw new Error(`${filePath}: ${spec.id}.args must be an array`);
      return {
        id: String(spec.id),
        probeId: spec.probeId == null ? null : String(spec.probeId),
        cwd,
        command: resolveCommand(spec.command, variables),
        args: argsRaw.map((item) => interpolate(String(item), variables)),
        env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR ?? '1', ...resolveMap(spec.env, variables) },
        shell: resolveBoolean(spec.shell, false),
      };
    });

  const probes = raw.probes
    .filter(activeOnPlatform)
    .map((probe) => {
      if (!probe.id || typeof probe.url !== 'string') throw new Error(`${filePath}: every probe requires id and url`);
      const url = assertLocalProbeUrl(interpolate(probe.url, variables));
      return {
        id: String(probe.id),
        url,
        required: probe.required !== false,
        timeoutMs: Number.isFinite(Number(probe.timeoutMs)) ? Math.max(100, Number(probe.timeoutMs)) : 1500,
        statuses: normalizeStatuses(probe.statuses),
      };
    });

  if (!probes.some((probe) => probe.required)) {
    throw new Error(`${filePath}: at least one required readiness probe is required`);
  }

  const probeIds = new Set(probes.map((probe) => probe.id));
  for (const processSpec of processes) {
    if (processSpec.probeId && !probeIds.has(processSpec.probeId)) {
      throw new Error(`${filePath}: process ${processSpec.id} references unknown probeId ${processSpec.probeId}`);
    }
  }

  return {
    schemaVersion: 1,
    filePath,
    productId: product.id,
    owner: raw.owner ?? product.publicName,
    embedBase,
    variables,
    processes,
    probes,
  };
}
