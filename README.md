# Koali Spaces reference implementation

Passive source package for the independently versioned `koa_spaces` experience layer.

The shell is structurally aligned with the current Konnaxion frontend snapshot: a responsive Ant Design global frame, upper-left module selector, fixed desktop sidebar with mobile drawer, shared top bar, and module-owned PageShell content. The implementation replaces Konnaxion's hard-coded suite list with validated Koali Space/module manifests. No Konnaxion business functionality is copied.

The reference stack deliberately aligns with Konnaxion where practical: Next.js 15.3.1, React 18.2.0, Ant Design 5.26.2, `@ant-design/pro-components` 2.8.10, TypeScript 5.9.x and pnpm 10.20.0. The visual baseline keeps the shared `#1e6864` accent and neutral surfaces rather than creating a separate Koali palette.

The runtime exposes presentation HTTP only on loopback and a separate HTTP-over-Unix control boundary compatible with the kOA-Linux Python adapter. Browser-rendered technology is not treated as an Internet dependency: required runtime assets are local, remote runtime assets are rejected, and owner-declared local/offline module surfaces can remain available without public network access.

`pnpm-lock.yaml` is intentionally absent from this passive source proposal until a genuine dependency resolution is performed in an approved connected environment. Source admission and release freezing must fail closed until that lock is generated, reviewed and committed.

## Naming

The public product and repository name is **Koali Spaces**. kOA names the broader initiative. The Koali integration boundary currently uses the protocol identifier `koa_spaces`; it is not public branding.
Runtime configuration uses only `KOALI_SPACES_*` environment variables.
