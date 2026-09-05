import http from 'node:http';
import fsp from 'node:fs/promises';
import next from 'next';
import { config } from './runtime-config.mjs';
import { startControlServer } from './control-server.mjs';
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: config.appRoot, hostname: config.bind, port: config.port });
await app.prepare();
const handle = app.getRequestHandler();
const control = await startControlServer();
const presentation = http.createServer((req, res) => handle(req, res));
presentation.listen(config.port, config.bind, () => console.log(`Koali Spaces presentation listening on local ${config.bind}:${config.port}`));
async function stop() { await Promise.all([new Promise((resolve) => presentation.close(resolve)), new Promise((resolve) => control.close(resolve))]); try { await fsp.unlink(config.socketPath); } catch {} process.exit(0); }
process.once('SIGINT', () => void stop()); process.once('SIGTERM', () => void stop());
