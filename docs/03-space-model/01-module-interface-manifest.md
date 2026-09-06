# Module Interface Manifest

**Classe : Contrat + Normatif**

Un manifest décrit comment un propriétaire apparaît dans Koali Spaces.

Il contribue :

- identité stable ;
- public name/icon ;
- home route ;
- routes ;
- sidebar ;
- topbar widgets ;
- capabilities requises ;
- localisation/accessibilité ;
- offline behavior ;
- design-system compatibility ;
- références de surface/assets.

Il ne décrit pas l’API métier complète et n’accorde aucune permission.

Le shell doit éviter les branches hardcodées de type `if module_id === 'konnaxion'`. Les particularités d’onboarding doivent être déclaratives ou isolées dans un adapter explicitement enregistré.
