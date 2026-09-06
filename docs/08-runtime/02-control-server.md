# Control server

**Classe : Référence d’implémentation**

Linux Unix socket par défaut : `/run/koa/sockets/koa-spaces.sock`.

Endpoints actuels :

- `GET /health` ;
- `GET /capabilities` ;
- `POST /capabilities/update` ;
- `GET /shell-state` ;
- `POST /manifest/read` ;
- `POST /space/activate` ;
- `POST /space/rollback` ;
- `POST /space/deactivate`.

La request body est bornée. Les refs de manifest sont confinées sous l’artifact root.

Sur Windows, le control socket est désactivé dans le launcher actuel ; Windows sert au smoke test de présentation.
