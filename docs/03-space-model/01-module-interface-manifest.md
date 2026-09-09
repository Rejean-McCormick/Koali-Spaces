# Module Interface Manifest

**Classe : Contrat + Normatif**

Un manifest décrit comment un propriétaire apparaît dans Koali Spaces.

Il contribue :

- identité stable ;
- public name/icon ;
- home route ;
- routes ;
- navigation/sidebar ;
- topbar widgets ;
- `default_surface_id` et `surface_profiles` optionnels ;
- références de commandes et d’inspector optionnelles par surface ;
- `ui_portability` pour déclarer support standalone/intégré ;
- capabilities requises ;
- localisation/accessibilité ;
- offline behavior ;
- design-system compatibility ;
- références de surface/assets.

Il ne décrit pas l’API métier complète et n’accorde aucune permission.

Le shell doit éviter les branches hardcodées de type `if module_id === 'konnaxion'`. Les particularités d’onboarding doivent être déclaratives ou isolées dans un adapter explicitement enregistré.


## Surface profiles

`surface_profiles` décrit des projections intentionnelles du même produit. Un profil sélectionne une home route, un sous-ensemble de navigation, un sous-ensemble de widgets, des command refs et éventuellement un inspector ref. Il ne crée pas une deuxième implémentation de page.

Un manifest historique sans `surface_profiles` reste valide et est interprété comme une surface synthétique `control` utilisant `home_route_id`, la sidebar et les widgets existants.

## Portabilité UI

`ui_portability.integrated_supported` est `true` pour un manifest admis dans Koali Spaces. `standalone_supported` indique si le produit possède également un entry point fonctionnel hors de Koali Spaces. Cette déclaration ne donne aucune autorité à Koali Spaces sur le runtime standalone.
