# Superseded by KS4

This development bootstrap design is retained for history. `UPDATE_KS4_OWNER_CONTRACTS.md` replaces the centralized runtime-profile launcher with repo-owned integration contracts and strict multi-probe readiness.

# KS3 — Koali Ecosystem Auto-Link

## Goal

`pnpm dev` now starts Koali in **ecosystem mode**. Koali discovers the local owner repositories, keeps them in their original working trees, generates the local Surface Runtime registry, optionally starts their development runtimes, and exposes them as Koali modules.

No owner application source is copied into `koali-spaces`.

## Product topology

The integrated development Space exposes:

- Konnaxion;
- Orgo;
- SemantiK Architect;
- Médiathèque kOA.

Kristal Framework, kOA Linux, Koali Control Panel, and kOA Digital Ecosystem are discovered as **source/infrastructure links**, not as fake application surfaces. Médiathèque kOA and Kristal are siblings in the ecosystem; neither is inserted as a transport layer for the other.

## One-command development

```text
pnpm dev
```

Windows also has:

```text
RUN_KOALI_ECOSYSTEM.cmd
```

The bootstrap does the following in one execution:

1. locate repositories by explicit environment overrides, known directory names, and bounded marker scanning;
2. retain all discovered base/Worlds variants while selecting one source for each product identity;
3. assign non-conflicting local presentation/backend ports;
4. avoid starting a duplicate runtime when the configured target is already reachable;
5. start the selected owner runtimes without copying source code;
6. continuously project runtime health to `.koali-dev/state/surface-runtime.json`;
7. launch Koali Spaces;
8. expose `/ecosystem` so the operator can see linked sources and runtime state.

## Variants

Worlds repositories are source variants, not duplicate product modules.

```text
KOALI_KONNAXION_VARIANT=base|worlds
KOALI_ORGO_VARIANT=base|worlds
```

Default selection is the preferred `base` variant when present. If it is absent, Koali selects the first discovered variant. Explicit selection fails visibly when the requested variant is missing.

## Repository overrides

```text
KOALI_REPO_KONNAXION
KOALI_REPO_KONNAXION_WORLDS
KOALI_REPO_ORGO
KOALI_REPO_ORGO_WORLDS
KOALI_REPO_SEMANTIK_ARCHITECT
KOALI_REPO_KOA_MEDIATHEQUE
KOALI_REPO_KRISTAL
KOALI_REPO_KOA_LINUX
KOALI_REPO_CONTROL_PANEL
KOALI_REPO_DIGITAL_ECOSYSTEM
```

Additional bounded scan roots can be supplied with `KOALI_ECOSYSTEM_ROOTS`.

## Runtime overrides

Any application can be externally managed while remaining integrated into Koali:

```text
KOALI_KONNAXION_URL=http://127.0.0.1:4301
KOALI_ORGO_URL=http://127.0.0.1:4302
KOALI_SEMANTIK_ARCHITECT_URL=http://127.0.0.1:4304
KOALI_KOA_MEDIATHEQUE_URL=http://127.0.0.1:8501
```

When an explicit URL is supplied Koali links to that runtime and does not spawn the owner process.

Per-product autostart can be disabled:

```text
KOALI_KONNAXION_AUTOSTART=0
KOALI_ORGO_AUTOSTART=0
KOALI_SEMANTIK_ARCHITECT_AUTOSTART=0
KOALI_KOA_MEDIATHEQUE_AUTOSTART=0
```

Global autostart can be disabled with `KOALI_ECOSYSTEM_AUTOSTART=0`.

## Default ports

| Product | UI | backend/API |
| --- | ---: | ---: |
| Konnaxion | 4301 | 8301 |
| Orgo | 4302 | 4303 |
| SemantiK Architect | 4304 | 8304 |
| Médiathèque kOA | 8501 | — |
| Koali Spaces | 4173 | — |

Every application port has an environment override in `config/ecosystem.catalog.json`.

## Deep links

A linked owner can declare `/` as its Koali surface boundary. Koali now forwards any safe path below `/apps/<moduleId>/...` to that root surface. This removes the need to copy the owner's router into Koali.

Example:

```text
/apps/konnaxion/ethikos/deliberate/123
        -> http://127.0.0.1:4301/ethikos/deliberate/123
```

## Production boundary

The auto-link supervisor is a **development convenience**. Production still consumes admitted immutable runtime targets/artifacts and the existing kOA activation authority. The development catalog does not grant capabilities, identity, or owner business authority.
