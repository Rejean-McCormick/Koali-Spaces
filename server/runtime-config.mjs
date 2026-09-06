import path from 'node:path';
import { fileURLToPath } from 'node:url';
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const defaultAppRoot = path.resolve(serverDir, '..');
export const config = {
  bind: process.env.KOALI_SPACES_BIND || '127.0.0.1',
  port: Number(process.env.KOALI_SPACES_PORT || 4173),
  socketPath: process.env.KOALI_SPACES_SOCKET || '/run/koa/sockets/koa-spaces.sock',
  stateRoot: process.env.KOALI_SPACES_STATE_ROOT || '/var/lib/koa/integrations/koa-spaces',
  artifactRoot: process.env.KOALI_SPACES_ARTIFACT_ROOT || '/usr/lib/koa/integrations/koa-spaces',
  appRoot: process.env.KOALI_SPACES_APP_ROOT || defaultAppRoot,
  surfaceRegistryPath: process.env.KOALI_SPACES_SURFACE_REGISTRY || null,
};
export const stateFile = () => path.join(config.stateRoot, 'active-state.json');
