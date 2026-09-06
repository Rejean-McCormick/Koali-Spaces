# AI_READ_ORDER — Koali Spaces Surface Layer v1.1

Ce fichier fixe l’ordre minimal de contexte pour toute IA qui propose, génère, révise ou refactore du code de Surface Layer.

## Toujours charger

1. `README.md`
2. `00-governance/00-statut-force-normative.md`
3. `00-governance/01-base-documentaire-et-ordre-autorite.md`
4. `00-governance/02-source-unique-et-projections-generees.md`
5. `locks/koali-surface-layer.lock.json`
6. `sources/SOURCES.lock.json`
7. `00-governance/44-anti-ai-drift-protocol.md`
8. `00-governance/46-decisions-ouvertes.md`

## Ensuite, charger selon la tâche

- Renderer / dispatch : `01-core-architecture/04-taxonomie-surfaces.md`, `05-architecture-renderer.md`, `06-application-host.md`, `07-control-plane-render-plane.md`, `08-public-descriptor-data-minimization.md`.
- UI host / immersive : `02-host-experience/`.
- Routing / registry : `03-routing-and-registry/`.
- Embed / auth / sécurité / offline / lifecycle : `04-runtime-and-security/`.
- Onboarding d’une technologie : son fichier dans `05-integrations/`, `32-onboarding-conformance-profile.md`, puis le context pack pinné du propriétaire.
- Codage / fichiers / rollout : `06-implementation/`.
- Tests / acceptance : `07-verification/`.

## Règle de contexte propriétaire

Pour une application donnée, une IA MUST utiliser le pin correspondant dans `sources/SOURCES.lock.json`. Elle MUST signaler si les fichiers actuellement disponibles ne correspondent pas au commit/hash pinné.

## Sortie obligatoire d’une IA

Pour tout plan ou patch non trivial, l’IA MUST :

- identifier les fichiers touchés ;
- citer les `LOCK-KS-SURF-*` affectés ;
- signaler tout `OPEN-KS-SURF-*` rencontré ;
- distinguer `ResolvedSurfaceInternal` de `SurfaceDescriptorPublic` ;
- distinguer `RuntimeRegistration` de `SurfacePresentationPolicy` ;
- indiquer qui possède le lifecycle lorsqu’un runtime doit démarrer ;
- ne pas inventer de nouvelle autorité, SurfaceKind, transport, SSO ou runtime ;
- distinguer ce qui est déjà canonique de ce qui est une proposition ;
- refuser de traiter `archive/` comme une seconde source normative.
