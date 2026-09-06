# 13. RuntimeRegistration vs SurfacePresentationPolicy

Ces deux objets ne doivent pas être fusionnés.

## RuntimeRegistration

Possède les faits techniques nécessaires au control side :

```text
module/runtime identity
artifact reference
runtime reference
health/readiness reference
lifecycle profile reference
transport profile reference
offline class
embed compatibility
```

## SurfacePresentationPolicy

Possède seulement l'expérience Koali :

```text
moduleId
label source
accentTokenRef
allowed display modes
default display mode
chrome profile
```

`LOCK-KS-SURF-145` — **Les informations de runtime/lifecycle/transport et les préférences de présentation Koali sont des structures distinctes ; une couleur ou un mode d'affichage ne peut pas devenir une propriété d'autorité runtime.**
