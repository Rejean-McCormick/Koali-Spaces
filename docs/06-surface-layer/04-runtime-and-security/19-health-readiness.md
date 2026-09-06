# 19. Health et readiness

Une `local_module_surface` peut déclarer une référence de health locale admise.

Koali MAY utiliser la health pour :

- indiquer prêt / non prêt ;
- différer le chargement ;
- afficher un état dégradé ;
- fournir un diagnostic opérateur ;
- permettre un retry borné.

Koali MUST NOT utiliser la health comme preuve d'autorité ou de validité métier.

`LOCK-KS-SURF-070` — **Health ≠ authorization ≠ business validity.**

`LOCK-KS-SURF-071` — **Le health check ne doit pas exposer de secret au navigateur.**

---
