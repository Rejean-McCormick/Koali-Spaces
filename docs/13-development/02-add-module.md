# Ajouter un module d’interface

**Classe : Procédure**

1. identifier l’owner ;
2. fournir un module interface manifest valide ;
3. définir home route, routes, navigation, widgets, capabilities, offline state ;
4. si le produit expose plusieurs expériences, définir `default_surface_id` + `surface_profiles` sans dupliquer les pages ;
5. déclarer `ui_portability` (standalone/intégré) lorsque applicable ;
6. ajouter la module instance au Space candidat ;
7. valider collisions et safe fallbacks ;
8. vérifier localisation/accessibilité ;
9. si la route est une application complète, suivre l’onboarding Surface Layer ;
10. tester online/offline et denied state ;
11. activer atomiquement via le control path.
