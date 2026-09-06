# QUALIFY ALL

**Classe : Gate de release**

Gate attendu après ce pack :

```text
dependency lock
-> typecheck
-> unit tests
-> runtime boundary tests
-> contract validation
-> Surface Layer spec validation
-> local asset closure
-> production build
-> runtime package validation
-> packaged runtime smoke
-> Git read-only handoff
```

`pnpm run validate` inclut la validation de la Surface Layer. Après `pnpm run build`, exécuter `pnpm run smoke:runtime`.

Le smoke vérifie au moins `/`, `/tasks`, `/settings`, `/health` sur le runtime packagé. Un onboarding d’application ajoute ses propres tests d’embed/conformance au gate sans remplacer ce smoke shell.
