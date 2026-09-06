# Nom, identité et compatibilité

**Classe : Normatif**

## Nom public

Le produit s’appelle **Koali Spaces**.

Formes autorisées :

- `Koali Spaces` — nom public et documentaire ;
- `koali-spaces` — repository/package ;
- `KOALI_SPACES_*` — variables d’environnement ;
- `koa_spaces` — identifiant d’intégration historique avec kOA-Linux uniquement.

## Forme à ne pas propager

Les documents hôtes kOA-Linux existants utilisent encore « kOA Spaces ». Cette forme est considérée comme une nomenclature hôte héritée. Les nouveaux documents internes utilisent **Koali Spaces**.

Une migration du wording dans kOA-Linux est un changement de documentation/contrat hôte séparé. Koali Spaces ne change pas silencieusement un identifiant externe pour corriger le branding.

## Identités stables

Les IDs tels que `space_id`, `module_id`, `route_id`, `manifest_id` et `widget_id` sont techniques. Un Space peut modifier un label public sans modifier ces identités.
