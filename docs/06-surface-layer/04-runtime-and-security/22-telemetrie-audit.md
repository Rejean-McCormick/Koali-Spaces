# 22. Télémétrie et audit de présentation

Koali peut journaliser des événements de présentation bornés :

```text
surface_resolve_started
surface_resolve_succeeded
surface_resolve_failed
surface_load_started
surface_ready
surface_degraded
surface_unavailable
surface_enter_immersive
surface_exit_immersive
```

Les événements doivent contenir uniquement les métadonnées nécessaires :

- module ID ;
- route key/path normalisé ;
- type de surface ;
- état ;
- durée ;
- correlation ID technique si disponible ;
- code d'erreur borné.

`LOCK-KS-SURF-076` — **La télémétrie Koali ne collecte pas le contenu métier de l'application hostée.**

`LOCK-KS-SURF-077` — **Aucun contenu d'iframe n'est capturé pour le logging général.**

`LOCK-KS-SURF-078` — **Les événements de présentation ne deviennent pas une preuve d'exécution d'une action métier.**

---
