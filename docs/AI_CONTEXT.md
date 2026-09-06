# AI Context — Koali Spaces

Ce fichier est le point d’entrée obligatoire pour tout travail assisté par IA sur Koali Spaces.

## Identité obligatoire

Le nom public est **Koali Spaces**. Ne pas renommer le produit en « kOA Spaces ». Le protocole d’intégration historique peut utiliser l’identifiant technique `koa_spaces`; cet identifiant n’est pas du branding.

## Ordre d’autorité

1. documentation normative de `docs/` dans le repository Koali Spaces ;
2. contrats locaux `contracts/koa/*.schema.json` pour la structure des artifacts consommés par Koali Spaces ;
3. `docs/06-surface-layer/` pour le rendu et l’hébergement des applications ;
4. contrat hôte kOA-Linux `contracts/subsystems/koa-spaces.subsystem.json` et ses documents de boundary ;
5. documentation officielle du système propriétaire lorsqu’une application est intégrée ;
6. code courant comme référence d’implémentation, jamais comme permission d’annuler silencieusement une règle normative.

## Lecture minimale selon la tâche

- Shell/navigation : `04-shell/`, `03-space-model/`, `05-design-system/`.
- Surface/application imbriquée : `06-surface-layer/AI_READ_ORDER.md`, puis les chapitres exigés par ce fichier.
- Runtime : `08-runtime/`, `09-security/`, `10-offline/`; ajouter `06-surface-layer/04-runtime-and-security/` si une surface hostée est concernée.
- Nouveau module : `03-space-model/`, `11-integrations/`, `13-development/02-add-module.md`.
- Nouvelle application complète : `11-integrations/01-application-hosting.md`, `06-surface-layer/`, puis la documentation du propriétaire.
- Recherche/Tâches/Health : `07-global-surfaces/`.
- Modification d’un lock Surface Layer : appliquer aussi `06-surface-layer/00-governance/44-anti-ai-drift-protocol.md`.

## Anti-dérive

Une IA ne doit pas :

- déplacer de logique métier dans Koali Spaces ;
- considérer un menu visible comme une permission ;
- créer une origine distante arbitraire à partir d’un manifest ;
- inventer un SSO, un bridge parent/enfant ou un transport non décidé ;
- réimplémenter Konnaxion, Orgo, UCKK, SemantiK Architect ou un autre produit dans le shell ;
- utiliser Ame-Artificielle ou VotingMachine/VM Engine comme application Koali ;
- confondre le Space avec un deployment profile ;
- confondre la Surface Layer avec le lifecycle des processus propriétaires ;
- modifier une famille de routes propriétaire pour « simplifier » l’intégration ;
- traiter une ancienne copie séparée de la Surface Layer comme une deuxième source normative ;
- fermer implicitement une décision `OPEN-KS-SURF-*`.

Toute décision encore ouverte doit rester ouverte jusqu’à ADR explicite.
