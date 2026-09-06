# 24. Threat model de l'application hostée

Une application admise peut être correcte, boguée, mal configurée ou compromise. L'admission ne supprime donc pas la frontière browser/origin.

Principe :

```text
admitted application
!=
trusted as Koali origin
```

Les catégories à contrôler dans l'onboarding sont :

```text
top-level navigation
window.open / popups
downloads
clipboard
camera
microphone
geolocation
fullscreen
WebAuthn
file picker
drag/drop
cookies
localStorage
IndexedDB
service workers
cross-origin redirects
OAuth/OIDC callbacks
WebSocket/SSE
external links
```

`LOCK-KS-SURF-143` — **L'admission d'une application ne la rend pas équivalente à l'origine de confiance Koali et ne lui accorde aucun accès implicite au parent.**

`LOCK-KS-SURF-144` — **Chaque application hostée doit avoir une politique explicite et minimale pour top-navigation, popups, downloads, browser permissions, storage et service-worker scope ; l'absence de politique ne signifie pas autorisation.**
