# Principes d’intégration

**Classe : Normatif**

Une intégration Koali Spaces décrit comment présenter un owner, pas comment absorber son architecture.

Avant onboarding : lire le contract/boundary kOA applicable, la documentation officielle du propriétaire et la Surface Layer.

Chaque application complète doit posséder un Application Conformance Profile décrivant transport, readiness, base path, frame policy, auth, offline behavior, browser permissions et route ownership.


## Standalone + integrated

Un owner peut rester une application standalone et publier simultanément une contribution Koali intégrée. Une intégration ne doit pas créer de dépendance UI privée entre deux produits. Les comportements génériques de shell viennent du contrat/primitives Koali ; les objets, pages et actions métier restent dans le produit propriétaire.

Le retrait d’un produit est un cas nominal : son manifest disparaît du registre et les autres produits restent fonctionnels.
