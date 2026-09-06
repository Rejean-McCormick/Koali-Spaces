# 31. Fichiers cibles recommandés dans Koali Spaces

Arborescence de code cible :

```text
src/
├── app/
│   └── apps/[moduleId]/[[...route]]/
│       └── page.tsx
├── components/
│   └── surfaces/
│       ├── SurfaceRenderer.tsx
│       ├── ApplicationHost.tsx
│       ├── LocalShellPageSurface.tsx
│       ├── RegisteredComponentSurface.tsx
│       ├── SurfaceBoundary.tsx
│       ├── SurfaceStatusView.tsx
│       └── ImmersiveExitControl.tsx
├── lib/
│   └── surfaces/
│       ├── types.ts
│       ├── resolve-surface.server.ts
│       ├── project-public-descriptor.server.ts
│       ├── runtime-registry.server.ts
│       ├── presentation-policy.ts
│       ├── lifecycle.server.ts
│       ├── health.server.ts
│       ├── transport.server.ts
│       ├── url-policy.ts
│       └── component-registry.ts
└── contracts/
    └── surface-layer/

server/
└── surface-runtime/
    ├── runtime-registry.mjs
    ├── lifecycle-adapter.mjs
    └── transport-registry.mjs

tests/
├── surface-resolution.test.ts
├── surface-public-descriptor.test.ts
├── application-host.test.tsx
├── immersive-mode.test.tsx
├── surface-status.test.ts
├── surface-security.test.ts
└── surface-routing.test.ts

tests-runtime/
├── surface-runtime-registry.test.mjs
├── surface-lifecycle-boundary.test.mjs
└── surface-transport-policy.test.mjs

scripts/
└── validate-surface-spec.mjs
```

Les noms exacts MAY être ajustés par l'implémentation, mais la séparation serveur/navigateur, runtime/presentation et lifecycle/render est normative.

`LOCK-KS-SURF-106` — **Les extensions de runtime Koali doivent être placées sous une propriété/namespace Koali, pas déguisées en modification canonique kOA.**
