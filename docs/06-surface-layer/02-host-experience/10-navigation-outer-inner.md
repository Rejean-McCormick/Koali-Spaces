# 10. Navigation : outer navigation vs inner navigation

Deux navigations peuvent coexister en mode framed :

1. **Outer navigation** Koali : sélection de module, navigation de Space, raccourcis de contexte.
2. **Inner navigation** : navigation native de l'application hostée.

Cette duplication visuelle est acceptée par design. Elle est préférable à la fusion artificielle des responsabilités.

`LOCK-KS-SURF-035` — **La sidebar Koali est une contribution de présentation, pas l'autorité des routes internes du module.**

`LOCK-KS-SURF-036` — **Le module selector choisit un contexte de surface ; il n'accorde pas une permission applicative.**

`LOCK-KS-SURF-037` — **Koali ne déduit pas automatiquement toute la navigation interne d'une application par scraping ou introspection DOM.**

`LOCK-KS-SURF-038` — **Une navigation Koali vers une sous-route de module n'est valide que si cette route est déclarée/admise par le contrat de présentation applicable.**

---
