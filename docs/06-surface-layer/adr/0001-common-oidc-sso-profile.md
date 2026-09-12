# ADR-KS-SURF-0001 — Common OIDC SSO profile

Status: accepted

## Context

Koali Spaces must provide a coherent multi-application sign-in experience without becoming the identity provider, password store, role authority, or credential injector for hosted owner applications.

## Source contracts

- `04-runtime-and-security/15-authentification-sso.md`
- `schemas/application-conformance-profile.schema.json`
- kOA `identity_and_trust` authority boundary
- ecosystem common identity contract

## Lock IDs affected

No lock is relaxed.

The decision preserves:

- `LOCK-KS-SURF-056` — renderer does not fabricate SSO;
- `LOCK-KS-SURF-057` — OIDC requires a separate integration contract;
- `LOCK-KS-SURF-058` — Koali session is not equivalent to an owner session.

This ADR closes the former global multi-application SSO open decision.

## Decision

Adopt the integration profile identifier:

```text
koa-common-oidc-v1
```

The federated subject key is the exact pair:

```text
issuer + subject (sub)
```

Koali Spaces may project sign-in state and launch owner applications under this profile. It must not inject bearer tokens, passwords, cookies, roles, or authorization decisions into an owner application.

Each owner application validates OIDC through its own accepted integration path, resolves the federated subject to its own local account, creates its own local session, and applies its own authorization.

A previously authenticated IdP browser session may make the owner OIDC round-trip effectively silent; that convenience does not merge application sessions.

Local/standalone authentication remains owner-defined and may coexist with the common profile.

Machine-to-machine identities remain separate from human SSO.

## Security consequences

- no email-only account linking;
- no Koali credential injection;
- no shared password database;
- no automatic role propagation;
- no equivalence between shell session and owner application session.

## Authority consequences

Authentication federation does not transfer business authority to Koali Spaces.

## Compatibility consequences

Existing `owner_managed_session`, LTI and explicit token-exchange integrations remain valid. Applications opt in using:

```json
{
  "authBoundary": {
    "ownerRetainsAuthorization": true,
    "koaliCredentialInjection": false,
    "authProfileRef": "koa-common-oidc-v1"
  }
}
```

## Migration

Owner applications may opt in one at a time. Applications without `authProfileRef` retain their previous authentication behavior.

## Tests required

- Surface Layer specification validation;
- Application Conformance Profile JSON validation;
- owner authorization boundary remains unchanged;
- no browser-side credential injection is introduced.

## Rollback

Remove the `authProfileRef` from an owner profile and return that application to its previous owner-managed authentication mode.
