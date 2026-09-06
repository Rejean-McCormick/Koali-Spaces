# 5. Architecture cible du renderer

```text
/apps/[moduleId]/[[...route]]
            |
            v
     request normalization
            |
            v
  SERVER / CONTROL SIDE
            |
     Active Space
     validated manifest
     capability projection
     runtime registration
     lifecycle/readiness
            |
            v
 SurfaceResolutionService
            |
            v
 ResolvedSurfaceInternal
            |
    minimize / project
            |
            v
 SurfaceDescriptorPublic
            |
  ---------------- browser boundary ----------------
            |
            v
     SurfaceRenderer
     /      |       \
    /       |        \
local   registered   module
shell   component    application
page    surface      surface
                    |
                    v
              ApplicationHost
               /          \
            framed       immersive
```

Le renderer navigateur ne reçoit pas un manifest brut et ne résout pas un runtime.

Concept serveur :

```ts
interface ResolvedSurfaceInternal {
  kind: SurfaceKind;
  spaceId: string;
  moduleId: string;
  routeId: string;
  routePath: string;
  runtime?: {
    registrationId: string;
    runtimeRef: string;
    healthRef?: string;
    lifecycleProfileRef?: string;
    transportProfileRef?: string;
  };
  status: SurfaceStatus;
  presentation: SurfacePresentationPolicy;
}
```

Projection navigateur :

```ts
interface SurfaceDescriptorPublic {
  surfaceId: string;
  moduleId: string;
  routeId: string;
  kind: SurfaceKind;
  status: SurfaceStatus;
  presentation: {
    label: string;
    accentTokenRef?: string;
    immersiveAllowed: boolean;
    defaultMode?: "framed" | "immersive";
  };
  target?: {
    embedSrc: string;
    iframeTitle: string;
    sandboxTokens: string[];
    browserPermissions: string[];
    bridgeProtocolRef?: string;
  };
}
```

`LOCK-KS-SURF-015` — **SurfaceRenderer est un dispatcher de présentation.** Il ne fait pas de requêtes métier spécifiques à Konnaxion, Orgo, UCKK, etc.

`LOCK-KS-SURF-016` — **Les manifests bruts ne sont pas passés directement aux composants d'affichage comme source de confiance.** Ils sont validés, résolus et projetés dans une structure runtime bornée.

`LOCK-KS-SURF-017` — **La résolution d'autorisation reste distincte de la résolution d'affichage.** Une capability projetée peut décider qu'une route n'est pas présentable ; le renderer ne peut pas créer une permission.
