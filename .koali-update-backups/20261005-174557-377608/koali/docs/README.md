# Koali Spaces — Documentation technique unifiée

**Produit : Koali Spaces**  
**Repository : `koali-spaces`**  
**Statut : baseline de développement v1.1**

Cette arborescence documente Koali Spaces comme produit autonome et comme sous-système d’expérience intégré à kOA-Linux. Elle contient également la **Surface Layer Technical Specification v1.1 complète** ; aucune spécification externe parallèle n’est requise.

## Ce que Koali Spaces est

Koali Spaces est la couche d’expérience locale et le composition host intégré optionnel qui :

- rend le shell global Koali ;
- active un **Space** validé ;
- compose les produits/modules d’interface déclarés sans devenir leur runtime standalone obligatoire ;
- affiche le product selector, la surface active, la context header, la navigation et le workspace principal ;
- projette des `surface_profiles` (Control, My Work, Operations, etc.) à partir des mêmes routes/pages produit ;
- filtre la présentation à partir de projections de capabilities sans accorder d’autorité ;
- fournit des surfaces globales telles que Accueil, Recherche, Tâches, Hors ligne, Santé et Paramètres ;
- héberge des applications propriétaires de leur propre UI au moyen de la Surface Layer ;
- reste local-first et offline-capable lorsque les propriétaires déclarent cette capacité.

Koali Spaces ne possède pas les données métier, permissions, workflows ou identités des applications qu’il présente. Un produit peut être retiré du registre intégré sans imposer de modification aux autres produits et peut rester fonctionnel standalone lorsqu’il déclare ce mode.

## Ordre de lecture général

1. `AI_CONTEXT.md`
2. `00-governance/00-document-authority.md`
3. `00-governance/01-naming-and-identity.md`
4. `01-product/00-product-definition.md`
5. `02-architecture/00-system-overview.md`
6. `03-space-model/00-space-definition.md`
7. `04-shell/00-global-shell.md`
8. `06-surface-layer/README.md` pour le rendu et l’hébergement d’applications
9. `06-surface-layer/AI_READ_ORDER.md` avant tout changement non trivial de Surface Layer
10. sections spécialisées selon le travail demandé

## Statut documentaire

Les documents utilisent trois classes :

- **Normatif** : intention architecturale et règles à respecter.
- **Contrat** : structure machine-readable ou interface explicitement versionnée.
- **Référence d’implémentation** : état du code actuel ; peut évoluer sans changer l’architecture si les contrats restent respectés.

Le code actuel ne doit pas être utilisé pour inventer une nouvelle architecture quand une règle normative existe déjà.

## Autorité documentaire externe

La documentation kOA-Linux possède les décisions du host : profil, membership, lifecycle hôte, ressources, sécurité du système, artifact admission et boundary d’intégration. La documentation Koali Spaces possède l’architecture interne du produit, le shell, le rendu, la Surface Layer et les comportements de présentation.

Pour une application propriétaire, sa documentation officielle reste autoritative pour son UI interne, ses routes, ses données, son auth et ses workflows.
