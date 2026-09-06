# 38. Loading, retry et timeouts

Le host doit distinguer :

- lancement local en cours ;
- page qui charge ;
- health non prête ;
- target absente ;
- embed refusé ;
- erreur réseau locale ;
- erreur de politique.

Retry :

- utilisateur MAY déclencher un retry ;
- retry automatique MAY être borné pour readiness ;
- aucun retry infini ;
- aucun retry ne change d'origine ou de fournisseur.

`LOCK-KS-SURF-119` — **Pas de retry loop non bornée.**

`LOCK-KS-SURF-120` — **Pas de fallback provider pendant un retry.**

---
