# Architecture système

**Classe : Normatif**

```text
                    kOA host authorities
       identity / governance / lifecycle / resources
                              |
                    capability + state projections
                              v
+------------------------- Koali Spaces -------------------------+
| control-side                                                     |
| Space + product manifests + surfaces + theme + runtime registrations |
|        -> resolution / filtering / activation                    |
|                                                                  |
| render-side                                                      |
| GlobalShell -> Product/Surface projection -> SurfaceRenderer      |
|             -> page/component/ApplicationHost                      |
+------------------------------+-----------------------------------+
                               |
                     declared app boundary
                               v
         Konnaxion / Orgo / UCKK / Architect / ...
        own UI + own router + own APIs + own business state
```

Koali Spaces est volontairement mince sur l’autorité et riche sur la composition d’expérience.


## Product autonomy

Koali Spaces ne constitue pas un parent runtime obligatoire pour les interfaces propriétaires. Le shell intégré consomme un registre de manifests admis. Chaque produit reste owner de son entry point standalone, de son router, de ses pages, de ses commandes métier et de ses inspectors métier. Le registre intégré peut perdre un produit sans obliger les autres produits à changer leur code source.
