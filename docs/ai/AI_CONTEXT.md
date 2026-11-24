<!-- kOA Doc Server · Docs IA · lot 03 · projet : koali-spaces · proposition dérivée à valider -->
# Contexte IA — koali-spaces

## Identité et périmètre observés

Système Koali Spaces : composition facultative des interfaces, contribution de routes et surfaces, contrôle et rendu de présentation.

**Limite d'autorité :** Les chapitres normatifs de la Surface Layer sont la source humaine; les locks générés en sont des projections. Les applications conservent leur état métier.

**Provenance :** `SmartDump_20261120_221507.zip` → `koali-spaces_Code_snapshot.zip` (20 novembre 2026). Les sources citées sont celles de cette capture; le propriétaire du dépôt conserve l'autorité sur les révisions présentes et futures.

## Avant toute proposition de modification

1. Déterminer si le travail demandé porte sur **un document, un contrat, une donnée, un exécutable ou un résultat dérivé**.
2. Consulter les fichiers propriétaires, dans cet ordre :
   - [`README.md`](../../README.md)
   - [`docs/00-governance/00-document-authority.md`](../../docs/00-governance/00-document-authority.md)
   - [`docs/06-surface-layer/AI_READ_ORDER.md`](../../docs/06-surface-layer/AI_READ_ORDER.md)
   - [`docs/06-surface-layer/README.md`](../../docs/06-surface-layer/README.md)
   - [`contracts/koa/space-definition.schema.json`](../../contracts/koa/space-definition.schema.json)

3. Vérifier les éventuels `AGENTS.md`, manifests, locks, schémas ou décisions de ce checkout; ne pas traiter cette fiche dérivée comme un substitut.
4. Cartographier producteur, consommateur, format, version et permissions pour chaque frontière franchie.

## Procédure adaptée

**Tâche type :** Commencer par l’ordre d’autorité et le protocole anti-dérive; suivre le parcours de contribution, les contrats et le lock de surface; vérifier les tests et refus.

**Éviter précisément :** Ne pas fermer une décision OPEN-KS-SURF ni modifier un LOCK-KS-SURF sans ADR, tests et mise à jour de source unique.

**Contrôles attendus avant la conclusion :** identifier les tests, validateurs et rapports réellement présents sur le système cible; exécuter uniquement ceux qui sont non destructifs et appropriés; relier chaque résultat à une révision et un environnement précis. En absence de code/test (ou si les sources sont insuffisantes), écrire « non vérifié », jamais « PASS ».

## Utilisation par kOA Doc Server

- **Lecture et export :** n'inclure que les documents explicitement sélectionnés, avec chemins relatifs, empreintes et provenance.
- **RepoSurveyor :** profils mesurés séparément à partir du code local. Ne pas fabriquer `ENGINEERING_PROFILE.md` depuis cette fiche; l'alias français est `PROFIL_INGENIERIE.md` après génération réelle.
- **Diagnostics :** observations datées, preuves historiques et états certifiés restent distincts. Aucune promotion automatique.
- **Wikis et vues :** documents dérivés, jamais propriétaires des contrats ni des permissions.
- **Confidentialité :** filtrer secrets, données personnelles, médias sous droits, caches, backups et rapports privés avant un ZIP de contexte IA.
- **Standard Kristal Framework v11 :** si pertinent, consulter le cadre comme référence possible, sans l'exiger pour naviguer ni forcer une migration du profil historique du dépôt.

## État de cette fiche

`DOCUMENTATION_REDACTIONNELLE_A_REVOIR` : elle facilite le démarrage d'un agent, mais **ne prouve aucun état d'intégration, publication, conformité ni maturité**.
