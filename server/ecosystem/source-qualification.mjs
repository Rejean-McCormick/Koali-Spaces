import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

function platformValue(value, platform = process.platform) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return value;
  if (Object.hasOwn(value, platform)) return value[platform];
  if (Object.hasOwn(value, 'default')) return value.default;
  return undefined;
}

async function exists(filePath) {
  try { await fs.access(filePath); return true; } catch { return false; }
}

function truncate(value, limit = 600) {
  const normalized = String(value ?? '').trim().replace(/\s+/g, ' ');
  return normalized.length <= limit ? normalized : `${normalized.slice(0, limit - 1)}…`;
}

async function commandCheck(source, check) {
  const command = platformValue(check.command);
  const args = platformValue(check.args) ?? [];
  if (typeof command !== 'string' || !command.trim()) {
    return { id: String(check.id), state: 'failed', reason: 'command unsupported on this platform' };
  }
  if (!Array.isArray(args)) return { id: String(check.id), state: 'failed', reason: 'command args must be an array' };
  const cwd = path.resolve(source.path, check.cwd ?? '.');
  if (!await exists(cwd)) return { id: String(check.id), state: 'failed', reason: `working directory missing: ${check.cwd ?? '.'}` };

  return await new Promise((resolve) => {
    const child = spawn(command, args.map(String), {
      cwd,
      env: { ...process.env, ...(check.env ?? {}) },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32' && /\.(?:cmd|bat)$/i.test(command),
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });
    const timeoutMs = Math.max(250, Number(check.timeoutMs ?? 15000));
    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch {}
      resolve({ id: String(check.id), state: 'failed', reason: `timeout after ${timeoutMs}ms` });
    }, timeoutMs);
    child.once('error', (error) => {
      clearTimeout(timer);
      resolve({ id: String(check.id), state: 'failed', reason: truncate(error.message) });
    });
    child.once('exit', (code, signal) => {
      clearTimeout(timer);
      const output = truncate(stdout || stderr);
      if (code === 0) resolve({ id: String(check.id), state: 'ready', ...(output ? { detail: output } : {}) });
      else resolve({ id: String(check.id), state: 'failed', reason: truncate(output || `exit ${signal ?? code ?? 'unknown'}`) });
    });
  });
}

async function runCheck(source, check) {
  if (!check?.id) return { id: 'invalid', state: 'failed', reason: 'qualification check id is required' };
  if (check.kind === 'file') {
    const target = path.resolve(source.path, String(check.path ?? ''));
    const ready = Boolean(check.path) && await exists(target);
    return { id: String(check.id), state: ready ? 'ready' : 'failed', ...(ready ? {} : { reason: `missing ${check.path ?? 'path'}` }) };
  }
  if (check.kind === 'command') return commandCheck(source, check);
  return { id: String(check.id), state: 'failed', reason: `unsupported qualification kind: ${check.kind ?? 'unknown'}` };
}

export async function qualifySource(source) {
  if (source.referenceOnly) {
    return {
      state: 'reference',
      reason: source.found ? 'reference only; no runtime qualification executed' : 'reference only; repository intentionally not bundled into Koali',
      checks: [],
    };
  }
  if (!source.found || !source.path) return { state: 'missing', reason: source.reason ?? 'repository not found', checks: [] };
  const checks = source.qualification?.checks ?? [];
  if (!Array.isArray(checks) || checks.length === 0) return { state: 'linked', reason: 'repository linked; no executable qualification declared', checks: [] };
  const results = [];
  for (const check of checks) results.push(await runCheck(source, check));
  const failed = results.filter((item) => item.state !== 'ready');
  return failed.length === 0
    ? { state: 'ready', reason: `${results.length} qualification check(s) passed`, checks: results }
    : { state: 'degraded', reason: failed.map((item) => `${item.id}: ${item.reason ?? item.state}`).join('; '), checks: results };
}

export async function qualifySources(discovery) {
  const states = new Map();
  for (const source of discovery.sources ?? []) states.set(source.id, await qualifySource(source));
  return states;
}
