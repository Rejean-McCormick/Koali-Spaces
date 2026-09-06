# 13. Transport d'embed : abstraction verrouillée, implémentation ouverte

La v1.1 ne choisit pas un transport universel.

Le control side résout un `transport_profile_ref` enregistré pour l'application. Le browser reçoit seulement le résultat public nécessaire au rendu.

L’ADR de transport doit comparer au minimum :

```text
A. iframe vers une origine locale explicitement enregistrée
B. gateway/reverse-proxy sous un path same-origin contrôlé
C. gateway avec origine locale dédiée par application
```

Les critères comprennent au minimum :

```text
CSP / frame-ancestors
X-Frame-Options
cookies / SameSite
CSRF
OAuth/OIDC redirect behavior
basePath / absolute URLs
WebSocket / SSE
service workers
localStorage / IndexedDB
downloads / popups
offline behavior
TLS/local trust
origin isolation
```

`OPEN-KS-SURF-001` — **Le catalogue final des transports et leur politique d'affectation ne sont pas décidés dans v1.1.**

`LOCK-KS-SURF-049` — **Une IA ou un développeur ne peut pas présenter une stratégie de transport comme canonique sans ADR de transport accepté.**

`LOCK-KS-SURF-050` — **Il est interdit de contourner la sécurité d'une application en supprimant silencieusement `X-Frame-Options`, CSP ou `frame-ancestors`.** Toute compatibilité d'embed doit être obtenue par configuration propriétaire ou architecture de transport explicitement approuvée.

`LOCK-KS-SURF-142` — **Le transport est sélectionné par application via une référence de profil fermée côté runtime ; le renderer ne suppose pas qu'un seul mécanisme d'embed convient à toutes les applications.**
