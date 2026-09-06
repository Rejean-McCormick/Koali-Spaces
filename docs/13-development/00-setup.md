# Setup développement

**Classe : Référence**

Pré-requis de la baseline : Node compatible, pnpm 10.20.0, repository propre.

Commandes usuelles :

```powershell
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run test
pnpm run test:runtime
pnpm run validate:contracts
pnpm run check:local-assets
pnpm run build
pnpm start
```

Sous Windows, Developer Mode peut être nécessaire pour le build standalone à cause des symlinks.
