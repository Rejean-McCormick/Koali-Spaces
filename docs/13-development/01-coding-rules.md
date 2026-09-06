# Règles de codage

**Classe : Normatif**

- préférer manifest/registry à un switch par produit ;
- garder les Server Components compatibles avec Ant Design (pas de dotted subcomponents non supportés côté serveur) ;
- ne pas exposer d’état interne `_...` au browser ;
- ne pas appeler une API propriétaire directement depuis un composant global sans provider/adapter déclaré ;
- toute navigation shell passe par route IDs/paths validés ;
- erreurs visibles, pas de silent fallback ;
- pas de remote runtime asset pour le shell offline ;
- ajouter tests avec chaque nouvelle règle de resolution/filtering.
