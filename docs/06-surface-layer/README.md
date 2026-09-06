---
doc_id: KOALI-SURFACE-LAYER-INDEX-001
title: Koali Spaces — Surface Layer Technical Specification v1.1
version: 1.1.0
status: canonical-development-lock
language: fr-CA
scope: koali_spaces_surface_layer
owner: Koali Spaces
change_control: ADR + contract/test/spec-registry update required
---

# Koali Spaces — Surface Layer Technical Specification v1.1

Ce dossier est la section canonique de la documentation unifiée dédiée à la couche **Surface Renderer / Application Host** de Koali Spaces.

La v1.1 durcit la v1.0 avant codage de masse. Elle sépare explicitement le **control side serveur** du **render side navigateur**, sépare le registre runtime de la politique de présentation, remplace l’état runtime monolithique par quatre axes orthogonaux, verrouille la frontière lifecycle, ajoute un threat model navigateur, pinne les context packs utilisés et rend la cohérence du pack vérifiable par outil.

## Règle de source unique

Les déclarations de locks dans les chapitres Markdown sont la **source normative humaine unique** pour `LOCK-KS-SURF-*`.

`locks/koali-surface-layer.lock.json` est une **projection machine-readable générée** de ces déclarations. Elle MUST correspondre exactement aux IDs et aux règles déclarées dans les chapitres. Elle ne doit pas être éditée comme une deuxième source de vérité.

Les context packs utilisés sont pinnés dans `sources/SOURCES.lock.json`.

## Règles de lecture

1. Lire `00-governance/00-statut-force-normative.md`.
2. Lire `00-governance/01-base-documentaire-et-ordre-autorite.md`.
3. Lire `00-governance/02-source-unique-et-projections-generees.md`.
4. Charger `locks/koali-surface-layer.lock.json`.
5. Charger `sources/SOURCES.lock.json`.
6. Lire les chapitres du domaine touché.
7. Pour tout travail assisté par IA, appliquer `AI_READ_ORDER.md` et `00-governance/44-anti-ai-drift-protocol.md`.
8. Une décision `OPEN-KS-SURF-*` ne peut pas être fermée implicitement. Elle exige un ADR accepté.

## Architecture de référence

```text
                       kOA authority / lifecycle owners
                                  |
                         verified projections
                                  |
                    +-------------v--------------+
                    | Koali server/control side  |
                    | Active Space               |
                    | validated manifests        |
                    | capabilities               |
                    | runtime registrations      |
                    | lifecycle/health refs      |
                    | SurfaceResolutionService   |
                    +-------------+--------------+
                                  |
                     minimized public descriptor
                                  |
                    +-------------v--------------+
                    | Koali browser/render side  |
                    | SurfaceRenderer            |
                    |  |- LocalShellPage         |
                    |  |- RegisteredComponent    |
                    |  `- ApplicationHost        |
                    |       framed / immersive   |
                    +-------------+--------------+
                                  |
                         isolated owner app
                                  |
                   owner UI / auth / data / router
```

## Arborescence v1.1

```text
docs/06-surface-layer/
├── README.md
├── CHANGELOG.md
├── MIGRATION_v1.0_to_v1.1.md
├── AI_READ_ORDER.md
├── DOC_INDEX.json
├── locks/
│   └── koali-surface-layer.lock.json
├── sources/
│   └── SOURCES.lock.json
├── schemas/
│   ├── surface-descriptor-public.schema.json
│   ├── runtime-registration.schema.json
│   ├── surface-presentation-policy.schema.json
│   └── application-conformance-profile.schema.json
├── examples/
│   └── konnaxion.application-conformance-profile.example.json
├── tools/
│   ├── rebuild-spec-indexes.mjs
│   └── validate-surface-spec.mjs
├── adr/
├── 00-governance/
├── 01-core-architecture/
├── 02-host-experience/
├── 03-routing-and-registry/
├── 04-runtime-and-security/
├── 05-integrations/
├── 06-implementation/
├── 07-verification/
├── 08-reference/
└── archive/
    └── KOALI_SPACES_SURFACE_LAYER_TECHNICAL_LOCK_v1.0.monolith.md
```

## Principes non négociables

Koali Spaces compose la présentation. Il ne devient pas le propriétaire des données, décisions, permissions, workflow ou UI interne des applications hostées.

Une application hostée peut rester dans le **framed mode** avec un contexte Koali minimal, ou passer en **immersive mode** où le chrome Koali disparaît sans transformer ce mode en Browser Fullscreen.

Aucune surface exécutable n’est découverte depuis Internet, depuis un URL arbitraire de manifest, ni depuis un import dynamique non enregistré.

Le fait qu’une application soit admise ne la rend pas équivalente à l’origine de confiance Koali.

Le rendu d’une application et son démarrage/lifecycle sont deux responsabilités distinctes.

## Commandes de validation documentaire

Depuis ce dossier :

```text
node tools/rebuild-spec-indexes.mjs
node tools/validate-surface-spec.mjs
```

La seconde commande MUST réussir avant qu’une version de cette spécification soit utilisée comme baseline de développement.
