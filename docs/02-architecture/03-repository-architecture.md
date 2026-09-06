# Architecture du repository

**Classe : Référence d’implémentation**

```text
src/app/                 routes Next.js globales et module host
src/components/shell/    chrome global
src/providers/           shell state + theme bridge
src/lib/                 registry, capabilities, URL policy
src/types/               modèles TypeScript
server/                  runtime local et control boundary
contracts/koa/           JSON Schemas consommés localement
interface/themes/        thèmes locaux
public/localization/     bundles de labels
scripts/                 build, validation, packaging
tests/                   tests frontend/unitaires
tests-runtime/           tests runtime Node
```

La future Surface Layer doit être ajoutée sans transformer `src/components/shell` en registry métier. Le layout cible de fichiers est documenté dans la spec Surface Layer v1.1.
