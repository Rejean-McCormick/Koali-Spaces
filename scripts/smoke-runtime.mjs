import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close(() => port ? resolve(port) : reject(new Error('unable to allocate smoke port')));
    });
  });
}

function get(port, pathname) {
  return new Promise((resolve, reject) => {
    const request = http.get({ host: '127.0.0.1', port, path: pathname, timeout: 3000 }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode ?? 0, body: Buffer.concat(chunks).toString('utf8') }));
    });
    request.on('timeout', () => request.destroy(new Error('request timeout')));
    request.on('error', reject);
  });
}

async function waitReady(port, child) {
  const deadline = Date.now() + 20_000;
  let lastError = null;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`runtime exited early with code ${child.exitCode}`);
    try {
      const response = await get(port, '/health');
      if (response.status === 200) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw lastError ?? new Error('runtime did not become ready');
}

const port = await freePort();
const socket = path.join(os.tmpdir(), `koali-spaces-smoke-${process.pid}.sock`);
const child = spawn(process.execPath, ['dist/runtime/server/main.mjs'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  env: {
    ...process.env,
    KOALI_SPACES_BIND: '127.0.0.1',
    KOALI_SPACES_PORT: String(port),
    KOALI_SPACES_SOCKET: socket,
    KOALI_SPACES_DEV_FALLBACK: '1',
  },
});

let output = '';
child.stdout.on('data', (chunk) => { output += chunk.toString(); });
child.stderr.on('data', (chunk) => { output += chunk.toString(); });

try {
  await waitReady(port, child);
  for (const pathname of ['/', '/tasks', '/settings', '/health']) {
    const response = await get(port, pathname);
    if (response.status !== 200) throw new Error(`${pathname} returned HTTP ${response.status}`);
  }
  console.log(`PASS: packaged runtime smoke on 127.0.0.1:${port}`);
} catch (error) {
  console.error(output.trim());
  throw error;
} finally {
  if (child.exitCode === null) {
    child.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => child.once('exit', resolve)),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
    if (child.exitCode === null) child.kill('SIGKILL');
  }
}
