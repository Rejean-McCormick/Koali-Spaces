# Presentation server

**Classe : Référence d’implémentation**

Defaults : bind `127.0.0.1`, port `4173`.

Production : `dist/runtime/server/main.mjs` lance `dist/runtime/server.js` avec `NODE_ENV=production`, `HOSTNAME` et `PORT`.

Le presentation server sert shell, routes globales, API shell-state et assets locaux.

Il n’est pas un backend métier général.
