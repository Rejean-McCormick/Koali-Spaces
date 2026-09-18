import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

function productEnvKey(product, suffix) {
  return `KOALI_${product.id.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_${suffix}`;
}

export function productAutostartEnabled(product) {
  const raw = process.env[productEnvKey(product, 'AUTOSTART')];
  return raw == null ? true : !['0', 'false', 'no', 'off'].includes(raw.toLowerCase());
}

async function cwdExists(value) {
  try { return (await fs.stat(value)).isDirectory(); } catch { return false; }
}

function statusAccepted(status, statuses) {
  if (Array.isArray(statuses) && statuses.length) return statuses.includes(status);
  return status >= 200 && status < 400;
}

export async function probeHttp(probe) {
  try {
    const response = await fetch(probe.url, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(probe.timeoutMs ?? 1500),
      headers: { 'user-agent': 'Koali-Workspace-Launcher/2.0' },
    });
    const ready = statusAccepted(response.status, probe.statuses);
    return {
      id: probe.id,
      url: probe.url,
      required: probe.required !== false,
      state: ready ? 'ready' : 'degraded',
      reason: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      id: probe.id,
      url: probe.url,
      required: probe.required !== false,
      state: 'unreachable',
      reason: error instanceof Error ? error.message : 'runtime not reachable',
    };
  }
}

export async function probeProduct(product) {
  if (!product.integration) {
    return { state: product.externallyManaged ? 'starting' : 'missing', reason: product.discoveryReason ?? 'integration contract unavailable', probes: [] };
  }
  const probes = await Promise.all(product.integration.probes.map(probeHttp));
  const required = probes.filter((probe) => probe.required);
  const failed = required.filter((probe) => probe.state !== 'ready');
  if (failed.length === 0) return { state: 'ready', reason: `${required.length} required probe(s) ready`, probes };
  const anyReady = required.some((probe) => probe.state === 'ready');
  const anyDegraded = failed.some((probe) => probe.state === 'degraded');
  return {
    state: anyReady || anyDegraded ? 'degraded' : 'starting',
    reason: failed.map((probe) => `${probe.id}: ${probe.reason}`).join('; '),
    probes,
  };
}

export function processSpecsForProduct(product) {
  return product.integration?.processes ?? [];
}

export async function startProductProcesses(discovery, processStates = new Map()) {
  const children = [];
  for (const product of discovery.products) {
    if (product.externallyManaged || !product.repoFound || !product.integration || !productAutostartEnabled(product)) continue;
    const existing = await probeProduct(product);
    if (existing.state === 'ready') {
      processStates.set(product.id, { state: 'external-or-already-running', pids: [], commands: [] });
      continue;
    }

    const specs = processSpecsForProduct(product);
    const probeStates = new Map((existing.probes ?? []).map((probe) => [probe.id, probe.state]));
    const record = { state: 'starting', pids: [], commands: [], skipped: [] };
    processStates.set(product.id, record);
    for (const spec of specs) {
      if (spec.probeId && probeStates.get(spec.probeId) === 'ready') {
        record.skipped.push({ id: spec.id, reason: `probe ${spec.probeId} already ready` });
        continue;
      }
      if (!await cwdExists(spec.cwd)) {
        record.state = 'failed';
        record.reason = `missing working directory for ${spec.id}: ${spec.cwd}`;
        continue;
      }
      try {
        const child = spawn(spec.command, spec.args, {
          cwd: spec.cwd,
          env: spec.env,
          stdio: 'inherit',
          windowsHide: false,
          shell: spec.shell ?? false,
        });
        children.push({ child, productId: product.id, specId: spec.id });
        record.pids.push(child.pid ?? null);
        record.commands.push({ id: spec.id, probeId: spec.probeId ?? null, command: spec.command, args: spec.args, cwd: spec.cwd });
        child.once('error', (error) => {
          record.state = 'failed';
          record.reason = `${spec.id}: ${error.message}`;
        });
        child.once('exit', (code, signal) => {
          if (record.state === 'stopping') return;
          if (code !== 0) {
            record.state = 'failed';
            record.reason = `${spec.id} exited (${signal ?? code ?? 'unknown'})`;
          }
        });
      } catch (error) {
        record.state = 'failed';
        record.reason = `${spec.id}: ${error instanceof Error ? error.message : 'spawn failed'}`;
      }
    }
    if (record.pids.length === 0 && record.state !== 'failed') {
      record.state = record.skipped.length > 0 ? 'external-or-already-running' : 'inactive';
    }
  }
  return children;
}

export async function stopChildren(children, processStates = new Map()) {
  for (const { child, productId } of children) {
    const state = processStates.get(productId);
    if (state) state.state = 'stopping';
    if (!child || child.exitCode !== null || child.signalCode !== null || !child.pid) continue;
    try {
      if (process.platform === 'win32') {
        const killer = spawn('taskkill.exe', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
        await new Promise((resolve) => killer.once('exit', resolve));
      } else {
        child.kill('SIGTERM');
      }
    } catch {
      // Best effort only. Owner applications remain independently operable.
    }
  }
}
