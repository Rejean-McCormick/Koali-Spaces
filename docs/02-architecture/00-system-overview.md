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
| Space + manifests + theme + runtime registrations                |
|        -> resolution / filtering / activation                    |
|                                                                  |
| render-side                                                      |
| GlobalShell -> SurfaceRenderer -> page/component/ApplicationHost |
+------------------------------+-----------------------------------+
                               |
                     declared app boundary
                               v
         Konnaxion / Orgo / UCKK / Architect / ...
        own UI + own router + own APIs + own business state
```

Koali Spaces est volontairement mince sur l’autorité et riche sur la composition d’expérience.
