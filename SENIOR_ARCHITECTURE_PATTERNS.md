# Senior Architecture Pattern Alignment

This note maps Koali Spaces to the `senior-architecture-patterns` corpus. Koali Spaces is an optional composition/presentation host; it does not take ownership of product business data, workflow, authorization or internal application semantics.

| Pattern | Status | Koali Spaces alignment |
|---|---|---|
| Graceful Degradation | **Applied** | Modules/surfaces can be `degraded`, `offline` or `unavailable`; safe fallbacks are explicit and semantic state is not fabricated. |
| Bulkhead / Fault Isolation | **Applied at module boundaries** | Failure of an optional owner runtime is isolated and does not automatically degrade the whole shell; shell-critical dependencies are treated separately. |
| Timeout Budgets | **Applied** | Embedded surface loading and owner readiness probes are explicitly bounded by timeouts. |
| Health Check API | **Applied** | Koali exposes a control `/health` boundary and requires declared readiness probes from integrated owner applications. |
| Ports & Adapters | **Selective** | Owner integration is contract-driven through manifests, runtime registrations, providers and lifecycle adapters rather than product-specific internal imports. |
| Anti-Corruption Layer | **Selective principle** | Public surface descriptors and owner contracts minimize/translate what crosses into the shell while owners retain authorization and business semantics. |

## Deliberate non-selections

- Koali Spaces is **not a BFF/business backend** for Konnaxion, Orgo or other owner applications.
- It is **not** the authorization authority for hosted products.
- No general Circuit Breaker, Transactional Outbox, Event Sourcing or Saga pattern is claimed for the shell core.
- “Composable modules” here should not be misread as a claim that Koali itself is a domain Modular Monolith.

## Evidence anchors

- `README.md`
- `docs/adr/0002-product-ui-standalone-and-composable.md`
- `docs/07-global-surfaces/07-provider-model.md`
- `docs/07-global-surfaces/04-health.md`
- `server/ecosystem/shell-state-compiler.mjs`
- `server/ecosystem/integration-contract.mjs`
- `server/control-server.mjs`
- `server/surface-runtime/lifecycle-adapter.mjs`
- `src/components/surfaces/ApplicationHost.tsx`
