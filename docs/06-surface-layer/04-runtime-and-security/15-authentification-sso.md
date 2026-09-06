# 15. Authentification et SSO

Présenter une application ne signifie pas devenir son système d'identité.

Modes conceptuels possibles :

```text
owner_managed_session
explicit_oidc_sso
explicit_lti_launch
explicit_integration_token_exchange
```

Ce sont des **modes d'intégration**, pas des fonctionnalités automatiques du renderer.

`LOCK-KS-SURF-056` — **Le renderer ne fabrique pas de SSO.**

`LOCK-KS-SURF-057` — **OIDC, LTI ou tout token exchange exige un contrat d'intégration séparé.**

`LOCK-KS-SURF-058` — **Une session Koali ne doit pas être supposée équivalente à une session Konnaxion, Orgo, UCKK, SemantiK Architect ou autre.**

`OPEN-KS-SURF-002` — **La stratégie SSO globale multi-app n'est pas définie par ce document.**

---
