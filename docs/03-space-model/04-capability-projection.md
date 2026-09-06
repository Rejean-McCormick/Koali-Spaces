# Capability projection

**Classe : Normatif**

Koali reçoit une snapshot non autoritative dont :

- `source` doit identifier kOA ;
- `may_grant_capabilities` doit être `false` ;
- `capabilities` est une liste dédupliquée.

Koali utilise cette liste pour :

- filtrer modules ;
- filtrer sidebar ;
- filtrer widgets ;
- choisir safe routes ;
- présenter `access_denied`/`unavailable`.

Koali ne peut pas ajouter une capability à la snapshot ni interpréter l’absence d’une capability comme une permission alternative.
