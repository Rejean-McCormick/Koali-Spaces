import fs from 'node:fs/promises';
import path from 'node:path';
import { config, stateFile } from './runtime-config.mjs';

const EMPTY_STATE = Object.freeze({
  state: 'unavailable', network_state: 'unknown', active_space_id: null,
  active_space: null, active_theme: null, modules: [], active_module_id: null,
  active_route_id: null, capabilities: [], reason: 'no active Space',
  _capability_snapshot: null, _shell_asset_manifest: null,
  _module_asset_manifests: [], _previous_state: null,
});
const clone = (value) => JSON.parse(JSON.stringify(value));
export const emptyState = () => clone(EMPTY_STATE);
export function publicState(value) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !key.startsWith('_')));
}
export function stateForRollback(value) { const copy = clone(value); copy._previous_state = null; return copy; }
export async function readState() { try { return { ...emptyState(), ...JSON.parse(await fs.readFile(stateFile(), 'utf8')) }; } catch { return emptyState(); } }
export async function writeState(value) {
  await fs.mkdir(config.stateRoot, { recursive: true });
  const tmp = `${stateFile()}.tmp-${process.pid}`;
  await fs.writeFile(tmp, `${JSON.stringify(value, null, 2)}
`, { mode: 0o600 });
  await fs.rename(tmp, stateFile());
}
export async function readJson(ref) {
  if (typeof ref !== 'string' || !ref || ref.includes('..') || ref.startsWith('/') || ref.includes('\\')) throw new Error('unsafe manifest ref');
  const resolved = path.resolve(config.artifactRoot, ref);
  const root = `${path.resolve(config.artifactRoot)}${path.sep}`;
  if (!resolved.startsWith(root)) throw new Error('manifest ref escapes artifact root');
  return JSON.parse(await fs.readFile(resolved, 'utf8'));
}
