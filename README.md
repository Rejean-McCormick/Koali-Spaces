# Koali Spaces reference implementation

Reference implementation of the independently versioned Koali Spaces experience layer. The kOA integration protocol identifier remains `koa_spaces`; the public product name is **Koali Spaces**.

Koali Spaces composes validated Space definitions and module interface manifests into a responsive Ant Design shell. It owns presentation and experience composition only: it does not acquire owner business data, workflow, authorization, identity, or internal application UI authority.

## Surface Layer

The repository now contains the Koali Spaces Surface Layer v1.1 specification with the **implementation hardening baseline v1.2**:

- server-side `SurfaceResolutionService`;
- strict `ResolvedSurfaceInternal -> SurfaceDescriptorPublic` minimization;
- three closed surface kinds: `local_shell_page`, `registered_component_surface`, `local_module_surface`;
- closed local registries rather than manifest-driven executable imports;
- `ApplicationHost` with framed and immersive Koali layout modes;
- owner-router preservation after the initial admitted deep link, including namespace-safe owner `/` routes and canonical alias forwarding;
- a separate Koali-owned runtime registration projection (`surface-runtime.json`);
- bounded iframe loading/retry behavior with explicit render-state tracking;
- CSP frame allowlisting without arbitrary runtime URLs from Space definitions, plus closed iframe permission/sandbox token catalogues;
- lifecycle requests separated from process execution;
- global Home/Health/Offline/Settings surfaces and closed Search/Tasks provider registries;
- strict activation checks for route namespaces, fallback references, `home_route_override`, shell-page ownership and schema-safe paths;
- immersive focus restoration with the activation control kept mounted;
- semantic module accent tokens mapped through safe CSS-variable indirection.

The final transport catalogue, global SSO, optional parent/child bridge, module accent palette, Browser Fullscreen behavior and display-mode persistence remain explicit `OPEN-KS-SURF-*` decisions in `docs/06-surface-layer/`. Code must not silently close them.

## Stack and runtime

The reference stack is Next.js 15.5.24, React 18.2.0, Ant Design 5.26.2, `@ant-design/pro-components` 2.8.10, TypeScript 5.9.x and pnpm 10.20.0.

Presentation HTTP is loopback-bound by default. Linux additionally exposes the declared HTTP-over-Unix control boundary; Windows disables that Unix socket for presentation/runtime smoke testing. Required shell runtime assets are local and remote runtime assets are rejected.

Useful gates:

```text
pnpm run validate
pnpm run build
pnpm run smoke:runtime
```

`validate` includes Surface Layer spec validation. `build` packages the Next standalone runtime and verifies `dist/runtime/server.js`. `smoke:runtime` boots the packaged runtime and checks the principal shell routes.

## Runtime surface registry

By default Koali reads:

```text
<KOALI_SPACES_STATE_ROOT>/surface-runtime.json
```

or the path in `KOALI_SPACES_SURFACE_REGISTRY`. This file is a Koali runtime projection, not a capability grant. Module manifests still cannot provide arbitrary executable URLs.

Additional absolute iframe origins must also be present in the build-time `KOALI_SPACES_FRAME_SRC` CSP allowlist. The absence of a runtime registration or target fails closed.

## Naming

Use **Koali Spaces** for product/UI/repository naming. Use `koa_spaces` only where the existing kOA protocol/contract identifier requires it. Runtime configuration uses `KOALI_SPACES_*` environment variables.
