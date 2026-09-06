# Koali Spaces reference implementation

Passive source package for the independently versioned `koa_spaces` experience layer.

The shell is structurally aligned with the current Konnaxion frontend snapshot: a responsive Ant Design global frame, upper-left module selector, fixed desktop sidebar with mobile drawer, shared top bar, and module-owned PageShell content. The implementation replaces Konnaxion's hard-coded suite list with validated Koali Space/module manifests. No Konnaxion business functionality is copied.

The reference stack deliberately aligns with Konnaxion where practical while keeping Koali Spaces independently maintainable: Next.js 15.5.24 (Maintenance LTS security line), React 18.2.0, Ant Design 5.26.2, `@ant-design/pro-components` 2.8.10, TypeScript 5.9.x and pnpm 10.20.0. Structural and design alignment does not require Koali Spaces to inherit an insecure dependency revision from another product. The visual baseline keeps the shared `#1e6864` accent and neutral surfaces rather than creating a separate Koali palette.

The runtime exposes presentation HTTP only on loopback and a separate HTTP-over-Unix control boundary compatible with the kOA-Linux Python adapter. Browser-rendered technology is not treated as an Internet dependency: required runtime assets are local, remote runtime assets are rejected, and owner-declared local/offline module surfaces can remain available without public network access.

`pnpm-lock.yaml` must be generated from the reviewed `package.json` by pnpm 10.20.0 in the real repository and then used with `--frozen-lockfile`. When `package.json` changes, the lock must be regenerated deliberately and re-qualified before commit.

## Naming

The public product and repository name is **Koali Spaces**. kOA names the broader initiative. The Koali integration boundary currently uses the protocol identifier `koa_spaces`; it is not public branding.
Runtime configuration uses only `KOALI_SPACES_*` environment variables.
