<!-- kOA Doc Server · Docs IA · lot 03 · projet : koali-spaces · proposition dérivée à valider -->
# Navigation IA — koali-spaces

**Objet constaté :** Système Koali Spaces : composition facultative des interfaces, contribution de routes et surfaces, contrôle et rendu de présentation.

**Frontière de responsabilité :** Les chapitres normatifs de la Surface Layer sont la source humaine; les locks générés en sont des projections. Les applications conservent leur état métier.

**Source :** `SmartDump_20261120_221507.zip` → `koali-spaces_Code_snapshot.zip` (20 novembre 2026). Le chemin Windows est une déclaration de snapshot, pas une vérification de l'état actuel.

**Statut :** Documentation de navigation dérivée de sources propriétaires, à revoir. Ce document ne vaut ni profil d'ingénierie mesuré, ni certification, ni permission d'exécution.

## Ordre de lecture — fichiers réellement présents dans la capture

1. [`README.md`](../../README.md) — SHA-256 `ffc2668007b46cb6…` dans la capture.
2. [`docs/00-governance/00-document-authority.md`](../../docs/00-governance/00-document-authority.md) — SHA-256 `d8e9805793724e0b…` dans la capture.
3. [`docs/06-surface-layer/AI_READ_ORDER.md`](../../docs/06-surface-layer/AI_READ_ORDER.md) — SHA-256 `492a14d717deeea2…` dans la capture.
4. [`docs/06-surface-layer/README.md`](../../docs/06-surface-layer/README.md) — SHA-256 `78f842133227a7bf…` dans la capture.
5. [`contracts/koa/space-definition.schema.json`](../../contracts/koa/space-definition.schema.json) — SHA-256 `9519cfd7ab7177f5…` dans la capture.

## Parcours recommandé pour une intervention assistée par IA

1. Identifier la question, le sous-système concerné et les responsabilités du propriétaire.
2. Lire les documents ci-dessus **dans cet ordre**; consulter les contrats et consignes propriétaires plus récents si le checkout a évolué.
3. Commencer par l’ordre d’autorité et le protocole anti-dérive; suivre le parcours de contribution, les contrats et le lock de surface; vérifier les tests et refus.
4. Établir les vérifications effectivement disponibles dans la révision locale, consigner les résultats et ne conclure qu'à l'intérieur du périmètre couvert.
5. Proposer les changements; demander une décision explicite avant toute écriture à effet, déploiement, publication ou promotion de preuves.

## Risque propre à ce dépôt

Ne pas fermer une décision OPEN-KS-SURF ni modifier un LOCK-KS-SURF sans ADR, tests et mise à jour de source unique.

## Compléments

- [`AI_CONTEXT.md`](AI_CONTEXT.md) : règles de travail et frontières de confiance.
- `AGENTS.md` : s'il existe déjà chez le propriétaire, ses consignes priment sur ces propositions; sinon l'overlay peut en ajouter un sans remplacement.
- `PROFIL_INGENIERIE.md` : optionnel, uniquement après exécution réelle de RepoSurveyor sur un dépôt local et accord explicite pour sa copie.
- Le Framework Kristal v11 est un standard documentaire **facultatif** : lire le profil réellement verrouillé, sans imposer de migration.
