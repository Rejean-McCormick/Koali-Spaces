# 42. Séquence d'implémentation v1.1

Ordre recommandé afin d'éviter une refonte après onboarding des applications.

## Phase 0 — Spec gate

```text
integrate docs/surface-layer
add validate:surface-spec
QUALIFY
```

## Phase 1 — Types et frontières

```text
SurfaceKind
SurfaceStatus (4 axes)
RuntimeRegistration
SurfacePresentationPolicy
ResolvedSurfaceInternal
SurfaceDescriptorPublic
ApplicationConformanceProfile
```

## Phase 2 — Control side

```text
active Space resolution
manifest resolution
capability projection
runtime registry
presentation policy registry
transport profile abstraction
lifecycle/readiness abstraction
SurfaceResolutionService
public descriptor minimization
```

## Phase 3 — Render side

```text
SurfaceRenderer
LocalShellPageSurface
RegisteredComponentSurface
ApplicationHost
framed/immersive state
focus/return control
error/loading boundaries
```

## Phase 4 — Security

```text
URL/redirect policy
sandbox/permissions
origin policy
browser isolation
no secret leakage
no direct lifecycle execution
```

## Phase 5 — Onboarding pilote

Choisir une vraie application dont le runtime est déjà connu et créer :

```text
RuntimeRegistration
SurfacePresentationPolicy
ApplicationConformanceProfile
route contribution
tests
```

Ne pas onboarder plusieurs gros systèmes avant que le pilote passe tous les gates.

## Phase 6 — Catalog onboarding

Konnaxion, UCKK, Orgo, SemantiK Architect et autres applications sont ajoutés une par une selon leur propre conformance profile.

`LOCK-KS-SURF-126` — **Ne pas commencer par reconstruire les pages métier des applications propriétaires ; terminer d'abord le host générique et ses frontières.**

`LOCK-KS-SURF-127` — **Ne pas spécialiser `ApplicationHost` avec des branches métier Konnaxion/Orgo/UCKK ; les variations passent par contracts, registrations et policies déclarés.**
