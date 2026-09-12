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

`ADR-KS-SURF-0001` — **La stratégie SSO commune retenue est `koa-common-oidc-v1`.**

---
## Profil commun `koa-common-oidc-v1`

Le profil ferme la décision globale de SSO sans déplacer l'autorité des applications.

```text
Common OIDC IdP
    ↓
kOA Identity & Trust
    ↓
Koali shell identity/session context

Application owner
    ↓
same OIDC issuer + subject
    ↓
owner-local account
    ↓
owner-local authorization
```

Invariants :

- la clé fédérée est le couple exact `issuer + subject (sub)`;
- l'email et le display name ne sont jamais des clés de liaison silencieuse;
- Koali Spaces ne possède pas la base utilisateur Konnaxion, Orgo ou UCKK-Moodle;
- Koali Spaces ne transmet pas son cookie/session comme credential propriétaire;
- `authProfileRef = "koa-common-oidc-v1"` signifie compatibilité avec le profil commun, pas partage de session applicative;
- chaque application conserve son login local/recovery quand son contrat standalone l'exige;
- les identités machine/service utilisent un contrat distinct du SSO humain;
- l'autorisation reste toujours owner-local.

Le parcours navigateur peut être silencieux lorsque l'IdP possède déjà une session, mais chaque application établit sa propre session locale après validation OIDC.
