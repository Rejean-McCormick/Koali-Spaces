import http from 'node:http';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { config } from './runtime-config.mjs';
import { publicState, readJson, readState, stateForRollback, writeState } from './state-store.mjs';
import { receipt } from './receipt.mjs';
import { assertActivationPayload, assertCapabilitySnapshot } from './validation.mjs';

function json(res, status, data) { const payload = Buffer.from(JSON.stringify(data)); res.writeHead(status, { 'content-type': 'application/json', 'content-length': payload.length }); res.end(payload); }
async function body(req) { let size = 0; const chunks = []; for await (const chunk of req) { size += chunk.length; if (size > 2_000_000) throw new Error('request too large'); chunks.push(chunk); } const parsed = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}; if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('request body must be a JSON object'); return parsed; }
function readiness(state) { if (state.state === 'ready') return { state: 'healthy', ready: true, reason: null }; if (state.state === 'offline' || state.state === 'degraded') return { state: 'degraded', ready: true, reason: state.reason ?? null }; return { state: 'unavailable', ready: false, reason: state.reason ?? 'no active Space' }; }
function receiptFromState(operation, state, profileId, result, actorRef = null, previous = null) {
  if (!state.active_space || !state.active_theme || !state._shell_asset_manifest || !state._capability_snapshot) throw new Error('active presentation evidence is incomplete');
  return receipt({ operation, space: state.active_space, theme: state.active_theme, shellAssets: state._shell_asset_manifest, capabilitySnapshot: state._capability_snapshot, manifests: state.modules ?? [], moduleAssets: state._module_asset_manifests ?? [], profileId, actorRef, result, previous });
}
export async function startControlServer() {
  await fsp.mkdir(path.dirname(config.socketPath), { recursive: true });
  try { await fsp.unlink(config.socketPath); } catch {}
  const server = http.createServer(async (req, res) => {
    try {
      const method = req.method || 'GET'; const url = req.url || '/';
      if (method === 'GET' && url === '/health') return json(res, 200, readiness(await readState()));
      if (method === 'GET' && url === '/capabilities') { const state = await readState(); return json(res, 200, { state: state._capability_snapshot ? 'available' : 'degraded', source: 'koa_projection', capabilities: state.capabilities ?? [], unavailable_capabilities: [], reasons: state._capability_snapshot ? [] : ['capability snapshot unavailable'] }); }
      if (method === 'POST' && url === '/capabilities/update') { const request = await body(req); const snapshot = assertCapabilitySnapshot(request.capability_snapshot); const current = await readState(); await writeState({ ...current, capabilities: [...snapshot.capabilities].sort(), _capability_snapshot: snapshot }); return json(res, 200, { state: 'updated', capabilities: [...snapshot.capabilities].sort() }); }
      if (method === 'GET' && url === '/shell-state') return json(res, 200, publicState(await readState()));
      if (method === 'POST' && url === '/manifest/read') { const request = await body(req); return json(res, 200, await readJson(request.manifest_ref)); }
      if (method === 'POST' && url === '/space/activate') {
        const request = assertActivationPayload(await body(req)); const previous = await readState(); const space = request.space_definition; const modules = request.module_manifests; const activeModule = space.default_module_id; const manifest = modules.find((candidate) => candidate.module_id === activeModule); const instance = space.module_instances.find((candidate) => candidate.module_id === activeModule); const activeRoute = instance?.home_route_override ?? manifest.home_route_id; const snapshot = request.capability_snapshot;
        const next = { state: 'ready', network_state: previous.network_state ?? 'unknown', active_space_id: space.space_id, active_space: space, active_theme: request.interface_theme, modules, active_module_id: activeModule, active_route_id: activeRoute, capabilities: [...snapshot.capabilities].sort(), reason: null, _capability_snapshot: snapshot, _shell_asset_manifest: request.shell_asset_manifest, _module_asset_manifests: request.module_asset_manifests, _previous_state: previous.active_space ? stateForRollback(previous) : null };
        await writeState(next); return json(res, 200, receiptFromState('activate', next, request.profile_id, 'activated', request.actor_ref ?? null));
      }
      if (method === 'POST' && url === '/space/rollback') { const request = await body(req); const current = await readState(); if (!current._previous_state) throw new Error('no previous validated Space available'); const target = current._previous_state; if (request.space_id && request.space_id !== target.active_space_id) throw new Error('rollback target space_id mismatch'); if (request.space_version && request.space_version !== target.active_space?.version) throw new Error('rollback target space_version mismatch'); target._previous_state = stateForRollback(current); await writeState(target); return json(res, 200, receiptFromState('rollback', target, request.profile_id, 'rolled_back', request.actor_ref ?? null, request.previous_receipt_ref ?? null)); }
      if (method === 'POST' && url === '/space/deactivate') { const request = await body(req); const current = await readState(); const evidence = receiptFromState('deactivate', current, request.profile_id, 'deactivated', request.actor_ref ?? null); await writeState({ ...current, state: 'unavailable', active_module_id: null, active_route_id: null, reason: 'deactivated' }); return json(res, 200, evidence); }
      return json(res, 404, { error: 'not_found' });
    } catch (error) { return json(res, 400, { error: error instanceof Error ? error.message : 'request_failed' }); }
  });
  server.listen(config.socketPath); await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); }); await fsp.chmod(config.socketPath, 0o660); return server;
}
