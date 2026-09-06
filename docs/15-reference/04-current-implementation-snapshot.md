# Snapshot d’implémentation de référence

**Classe : Référence — non normative**

Au snapshot analysé :

- Next App Router ;
- GlobalShell client ;
- ShellProvider polling `/api/shell-state` toutes les 5 s ;
- `registry.ts` gère module admission, active manifest, safe route, sidebar/widgets ;
- control server Node sur Unix socket Linux ;
- state JSON atomique ;
- production Next standalone ;
- CSP actuelle interdit les frames (`frame-src 'none'`) : elle devra évoluer de façon contrôlée avec la Surface Layer ;
- pages globales sont des placeholders de contenu ;
- Surface Renderer n’est pas encore câblé au route host.

Ce fichier doit être mis à jour après des étapes majeures, sans servir de substitut aux docs normatives.
