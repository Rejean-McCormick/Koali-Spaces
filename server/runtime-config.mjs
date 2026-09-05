import path from 'node:path';
import { fileURLToPath } from 'node:url';
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const defaultAppRoot = path.resolve(serverDir, '..');
const env = (primary, legacy) => process.env[primary] || process.env[legacy];
export const config = {
  bind: env('KOALI_SPACES_BIND', 'KOA_SPACES_BIND') || '127.0.0.1',
  port: Number(env('KOALI_SPACES_PORT', 'KOA_SPACES_PORT') || 4173),
  socketPath: env('KOALI_SPACES_SOCKET', 'KOA_SPACES_SOCKET') || '/run/koa/sockets/koa-spaces.sock',
  stateRoot: env('KOALI_SPACES_STATE_ROOT', 'KOA_SPACES_STATE_ROOT') || '/var/lib/koa/integrations/koa-spaces',
  artifactRoot: env('KOALI_SPACES_ARTIFACT_ROOT', 'KOA_SPACES_ARTIFACT_ROOT') || '/usr/lib/koa/integrations/koa-spaces',
  appRoot: env('KOALI_SPACES_APP_ROOT', 'KOA_SPACES_APP_ROOT') || defaultAppRoot,
};
export const stateFile = () => path.join(config.stateRoot, 'active-state.json');
