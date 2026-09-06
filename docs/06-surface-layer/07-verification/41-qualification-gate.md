# 41. Qualification gate

La Definition of Done minimale après intégration de la v1.1 :

```text
pnpm install --frozen-lockfile
pnpm run check:dependency-lock
pnpm run validate:surface-spec
pnpm run typecheck
pnpm run test
pnpm run test:runtime
pnpm run validate:contracts
pnpm run check:local-assets
pnpm run build
runtime package validation
runtime startup smoke
```

Puis :

- smoke framed ;
- smoke immersive ;
- au moins une application hostée réelle ;
- test `access=blocked` avec runtime pourtant ready ;
- test runtime missing/inactive ;
- test offline/local-only ;
- test d'origin/redirect non allowlisté ;
- test lifecycle prouvant qu'aucun spawn direct ne vient du renderer ;
- validation d'au moins un `ApplicationConformanceProfile` ;
- Git working tree propre pour la qualification de référence.

`LOCK-KS-SURF-125` — **Le baseline de développement verrouillé doit être enregistré sur un commit propre.**
