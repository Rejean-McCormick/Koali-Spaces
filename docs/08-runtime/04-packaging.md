# Packaging production

**Classe : Référence d’implémentation**

`pnpm run build` :

```text
next build
-> build-interface-assets
-> package-runtime
-> validate-runtime-package
```

`dist/runtime` contient le standalone Next, `.next/static`, `public`, `server`, `contracts`, `interface` et l’inventaire d’assets.

`pnpm start` doit être testable depuis la racine du repository et lancer le runtime packagé, pas la source dev.
