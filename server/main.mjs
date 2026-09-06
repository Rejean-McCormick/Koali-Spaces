import http from 'node:http';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { config } from './runtime-config.mjs';
import { startControlServer } from './control-server.mjs';

const standaloneEntry = path.join(config.appRoot, 'server.js');

let presentation = null;
let presentationApp = null;
let standalone = null;
let control = null;
let stopping = false;

async function exists(filePath) {
  try {
    await fsp.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function closeServer(server) {
  if (!server) return Promise.resolve();

  return new Promise((resolve) => {
    try {
      server.close(() => resolve());
    } catch {
      resolve();
    }
  });
}

function waitForExit(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    child.once('exit', () => resolve());
  });
}

async function startControl() {
  /*
   * The Koali control transport is a Unix-domain socket.
   * Windows is supported here for presentation/runtime smoke tests only.
   */
  if (process.platform === 'win32') {
    console.log(
      'Koali Spaces control socket disabled on Windows; presentation runtime only.',
    );
    return null;
  }

  return startControlServer();
}

async function startDevelopmentPresentation() {
  const { default: next } = await import('next');

  presentationApp = next({
    dev: true,
    dir: config.appRoot,
    hostname: config.bind,
    port: config.port,
  });

  await presentationApp.prepare();

  const handle = presentationApp.getRequestHandler();

  presentation = http.createServer((req, res) => {
    handle(req, res);
  });

  await new Promise((resolve, reject) => {
    presentation.once('error', reject);
    presentation.listen(config.port, config.bind, resolve);
  });

  console.log(
    `Koali Spaces presentation listening on local ${config.bind}:${config.port}`,
  );
}

async function startStandalonePresentation() {
  standalone = spawn(process.execPath, [standaloneEntry], {
    cwd: config.appRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      HOSTNAME: config.bind,
      PORT: String(config.port),
    },
  });

  await new Promise((resolve, reject) => {
    const onError = (error) => {
      reject(error);
    };

    standalone.once('error', onError);

    standalone.once('spawn', () => {
      standalone.off('error', onError);
      resolve();
    });
  });

  standalone.once('exit', (code, signal) => {
    if (stopping) return;

    const reason =
      signal !== null
        ? `signal ${signal}`
        : `exit code ${code ?? 'unknown'}`;

    console.error(`Koali Spaces standalone presentation stopped: ${reason}`);

    void stop(code ?? 1);
  });
}

async function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;

  if (
    standalone &&
    standalone.exitCode === null &&
    standalone.signalCode === null
  ) {
    standalone.kill('SIGTERM');

    await Promise.race([
      waitForExit(standalone),
      new Promise((resolve) => {
        setTimeout(() => {
          if (
            standalone &&
            standalone.exitCode === null &&
            standalone.signalCode === null
          ) {
            standalone.kill('SIGKILL');
          }

          resolve();
        }, 5000);
      }),
    ]);
  }

  await Promise.allSettled([
    closeServer(presentation),
    closeServer(control),
    presentationApp?.close?.() ?? Promise.resolve(),
  ]);

  if (control && process.platform !== 'win32') {
    try {
      await fsp.unlink(config.socketPath);
    } catch {
      // Socket may already have been removed.
    }
  }

  process.exit(exitCode);
}

const standaloneAvailable = await exists(standaloneEntry);
const production =
  process.env.NODE_ENV === 'production' || standaloneAvailable;

if (production && !standaloneAvailable) {
  throw new Error(
    `Koali Spaces standalone runtime is missing: ${standaloneEntry}. Run pnpm run build first.`,
  );
}

try {
  control = await startControl();

  if (production) {
    await startStandalonePresentation();
  } else {
    await startDevelopmentPresentation();
  }
} catch (error) {
  console.error(error);
  await stop(1);
}

process.once('SIGINT', () => void stop(0));
process.once('SIGTERM', () => void stop(0));