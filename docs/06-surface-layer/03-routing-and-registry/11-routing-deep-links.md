# 11. Routing et deep links

La route Koali publique reste :

```text
/apps/[moduleId]/[[...route]]
```

Cette route représente **la surface Koali**. Elle ne change pas l'identité des routes internes du module.

Le mapping conceptuel est :

```text
Koali route
/apps/konnaxion/ethikos/deliberate/...
       |
       v
validated module contribution
       |
       v
resolved owner path
/ethikos/deliberate/...
       |
       v
registered local Konnaxion surface
```

`LOCK-KS-SURF-039` — **Le module ID est stable et technique. Un alias public ne change pas l'identité technique.**

`LOCK-KS-SURF-040` — **Les routes d'un module sont namespaced dans Koali.** Une route de module ne peut pas capturer `/settings`, `/health`, `/tasks`, `/search` ou d'autres routes shell réservées.

`LOCK-KS-SURF-041` — **Aucune route ne peut résoudre `..`, un changement de schéma URL, un host externe ou une origine non enregistrée.**

`LOCK-KS-SURF-042` — **Le mapping de route ne peut pas construire une URL à partir d'une chaîne arbitraire non validée provenant du navigateur.**

`LOCK-KS-SURF-043` — **Les query parameters doivent être passés selon une politique explicite.** Les paramètres Koali internes ne doivent pas être transmis au module par défaut.

---
