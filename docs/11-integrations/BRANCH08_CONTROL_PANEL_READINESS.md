# Branch 08 — Public shell-state contract consumed by Control Panel

**Status:** present Koali-owned source semantics and tested offline consumer alignment. **Authority:** Koali Spaces owns composition and the public shell-state projection, not host admission or application business state.

## Public projection

`GET /api/shell-state` (Next route `src/app/api/shell-state/route.ts`) returns the selected Koali-owned state via `readServerShellState`. State values include `ready`, `degraded`, and `unavailable`; `unavailable` is returned with HTTP 503. The development compiler in `server/ecosystem/shell-state-compiler.mjs` emits:

- `state`: aggregate shell readiness based on shell-critical product observations;
- `modules`: admitted presentation manifests;
- `active_space.module_instances`: enabled Space contributions;
- `module_health`: individual `module_id`, `state`, `reason`, `affects_shell_state` observations for admitted owner products;
- private `_development_projection` metadata, which **must not be returned** by the public endpoint.

A headless product can be required by the ecosystem while not projecting a fake UI module. `affects_shell_state=false` allows an optional UI contribution to degrade without taking down the whole shell; it does not turn the product itself into `ready`. Neither this response nor an HTTP route grants permissions or ownership of the product's internal application APIs.

## Consumer alignment

The updated Koali Control Panel requires aggregate `state == ready` and an actual `module_health.state == ready` for each **configured required** module in delegated mode. It never writes Koali-owned Space definitions, ACP decisions, runtime registrations or activation receipts. The proof is an offline, two-source test: `KOALI_SPACES_SOURCE=/path/to/this/repo python -m unittest tests.test_branch08_shell_readiness` from Control Panel, plus `node --test tests-runtime/control-panel-readiness.test.mjs` here.

## Qualification boundaries

This source-based test is not the final runtime qualification. The separate LevelUpDiag-Koali N12/N14 campaigns check required owner products, qualified runtime sources, bootstrap evidence, public/privacy projections, surface health and actual loopback probes. A full ready/healthy verdict additionally requires a named host environment and authoritative runtime observations; absence of the trusted state file in production must fail closed.
