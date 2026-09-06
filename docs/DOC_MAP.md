# Carte documentaire — Koali Spaces v1.1

```text
docs/
├── AI_CONTEXT.md
├── README.md
├── DOC_MAP.md
├── 00-governance/      autorité, nom, invariants, ADR
├── 01-product/         définition produit et expérience
├── 02-architecture/    architecture interne et frontières
├── 03-space-model/     Space, manifests, routes, activation
├── 04-shell/           chrome global et navigation
├── 05-design-system/   thème, accessibilité, localisation
├── 06-surface-layer/   Surface Layer v1.1 complète
│   ├── AI_READ_ORDER.md
│   ├── README.md
│   ├── 00-governance/
│   ├── 01-core-architecture/
│   ├── 02-host-experience/
│   ├── 03-routing-and-registry/
│   ├── 04-runtime-and-security/
│   ├── 05-integrations/
│   ├── 06-implementation/
│   ├── 07-verification/
│   ├── 08-reference/
│   ├── locks/
│   ├── schemas/
│   ├── examples/
│   ├── sources/
│   └── tools/
├── 07-global-surfaces/ Home/Search/Tasks/Health/Offline/Settings
├── 08-runtime/         servers, state, packaging, plateformes
├── 09-security/        boundaries, origins, secrets, failures
├── 10-offline/         local-first, assets, dégradation, recovery
├── 11-integrations/    owners et onboarding applicatif
├── 12-operations/      deployment, health, backup, troubleshooting
├── 13-development/     setup, règles, procédures, roadmap
├── 14-verification/    tests et release gates
├── 15-reference/       contrats, routes, glossaire, alignment
└── adr/                décisions architecturales produit
```

## Règle de non-duplication

`docs/06-surface-layer/` est la seule copie active de la spécification Surface Layer dans cette baseline. Une ancienne copie externe peut être archivée, mais elle n’est pas normative.
