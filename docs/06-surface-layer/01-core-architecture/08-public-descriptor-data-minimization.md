# 8. Minimisation du descriptor public

Le fait qu’un champ existe dans le control side ne justifie pas son exposition au navigateur.

## 8.1 Informations typiquement server-only

```text
runtimeRef
agent/control endpoint
local service-manager identity
artifact staging path
socket path
operator filesystem path
secret-store reference
privileged lifecycle operation
raw capability evidence
```

## 8.2 Informations nécessaires au navigateur

```text
surfaceId
moduleId
routeId
kind
public status
label/accent token
immersiveAllowed + default display mode
safe embedSrc
iframeTitle
sandbox tokens
browser permissions
optional bridgeProtocolRef
```

`LOCK-KS-SURF-154` — **Une target navigateur peut exposer uniquement l'adresse nécessaire au rendu admis ; elle ne peut pas exposer l'endpoint de contrôle/lifecycle ni des détails internes sans nécessité de présentation explicite.**
