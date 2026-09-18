# KS4 — Owner Integration Contracts

## Final development architecture

Koali Spaces remains the composition shell. It no longer owns application-specific launch recipes.

Each owner repository publishes a root `koali.integration.json` that owns:

- local runtime variables/ports;
- the owner application's process commands;
- environment projected into those processes;
- the embeddable local surface origin;
- required readiness probes.

Koali owns only product identity, shell ordering, presentation policy, repository discovery, and runtime projection.

```text
Koali shell
   |
   +-- runtime registry / presentation
   |
Generic workspace launcher
   |
   +-- read Konnaxion/koali.integration.json
   +-- read Orgo/koali.integration.json
   +-- read SemantiK_Architect/koali.integration.json
   +-- read koa_mediatheque/koali.integration.json
```

No owner source or launch recipe is vendored into Koali.

## Discovery versus workspace binding

Repository scanning is a first-discovery fallback only. The lookup precedence is:

1. explicit `KOALI_REPO_*` environment override;
2. `.koali-dev/workspace.json` working-tree binding;
3. known directory-name candidates;
4. bounded marker scan.

Every successful discovery refreshes the local workspace binding. Later launches therefore use stable explicit paths without repeatedly walking the broader workspace.

The workspace file is local state and remains ignored by Git.

## Strict readiness

The old bootstrap treated a reachable presentation URL as sufficient runtime readiness. KS4 replaces that with required owner probes.

A product is `ready` only when every required probe is ready. If the web process answers while a required API/database probe fails, the product is `degraded`.

Each launchable process may bind to a readiness probe through `probeId`. Before spawning, the generic launcher probes the owner contract and skips any process whose mapped probe is already healthy. This prevents duplicate frontend/backend instances when part of an application was started manually. Disabling autostart also no longer hides a manually running runtime: Koali continues to probe it and reports its real health.

Current contract probes:

| Product | Required probes |
| --- | --- |
| Konnaxion | Django/database readiness + Next health |
| Orgo | Nest `/health/ready` + web presentation |
| SemantiK Architect | runtime `/health/ready` + web presentation |
| Médiathèque kOA | Streamlit `/_stcore/health` |

Konnaxion now provides explicit `/health/live/` and `/health/ready/` endpoints; readiness executes `SELECT 1` against the configured Django database.

## Owner variants

`Konnaxion_Worlds` and `Orgo_Worlds` each carry the same product contract as their base product. Selection remains source-level:

```text
KOALI_KONNAXION_VARIANT=base|worlds
KOALI_ORGO_VARIANT=base|worlds
```

The shell still exposes one Konnaxion and one Orgo module.

## External runtimes

An explicit local URL override remains supported:

```text
KOALI_KONNAXION_URL=http://127.0.0.1:4301
KOALI_ORGO_URL=http://127.0.0.1:4302
KOALI_SEMANTIK_ARCHITECT_URL=http://127.0.0.1:4304
KOALI_KOA_MEDIATHEQUE_URL=http://127.0.0.1:8501
```

External URLs remain restricted to admitted local Koali origins. When supplied, the generic launcher does not spawn owner processes.

## Process authority boundary

The application-specific recipes are gone from `server/ecosystem/process-supervisor.mjs`. That file is now only a compatibility re-export.

Generic process execution lives under `tools/workspace-launcher/`. This keeps process supervision outside the Koali presentation/runtime server boundary and leaves a clean delegation point for Koali Control Panel.

## Production boundary

`koali.integration.json` is a development-owner contract. Production continues to consume qualified immutable runtime artifacts/targets through the existing kOA admission and activation boundaries. A mutable working-tree path is never a production authority.
