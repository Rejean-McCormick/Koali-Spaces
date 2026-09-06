# Runtime smoke test

**Classe : Gate de qualification**

Le script implémenté est :

```text
pnpm run smoke:runtime
```

Pseudo-flow :

```text
require dist/runtime from prior build
allocate loopback test port
spawn dist/runtime/server/main.mjs
use development shell fallback only for the smoke state
wait HTTP ready
GET /
GET /tasks
GET /settings
GET /health
assert HTTP 200
terminate wrapper
assert bounded shutdown
```

Sous Linux, le smoke utilise un control socket temporaire sous le répertoire temporaire du système afin de ne pas dépendre de `/run/koa` pendant le test. Sous Windows, le smoke de présentation reste valide même si le control socket Unix est désactivé.

Ce smoke vérifie le runtime packagé, pas seulement `next build`. Les applications onboardées ajoutent ensuite leurs propres smoke/conformance tests sans remplacer ce gate shell.
