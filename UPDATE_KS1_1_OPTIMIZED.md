# KS-1.1 — Appearance Authority Hardening

This snapshot hardens the KS-1 Appearance Authority implementation before KS-2.

## Completed corrections

- `InterfaceTheme` is now a real input to the effective appearance resolver.
- New Spaces may omit legacy `appearance.density` and inherit `InterfaceTheme.tokens.density`.
- Accent identities/colors have one canonical runtime registry: `interface/appearance/accent-palette.json`.
- Theme `primary_accent_id` is validated against the canonical accent color.
- Koali shell semantic CSS aliases are populated from resolved Ant Design semantic tokens.
- Static light/dark colors remain bootstrap-only fallbacks before hydration.
- A pre-hydration appearance bootstrap avoids avoidable system/dark/accent flashes while remaining outside Space authority.
- Personal presentation preferences embedded in Space activation are rejected fail-closed.
- Receipt tests prove different device-local preferences cannot alter the Space activation digest.

## Validation executed in this transported snapshot

- `node --test tests-runtime/*.test.mjs`: 36/36 PASS
- `node scripts/validate-contracts.mjs`: 16 contracts parse
- `node scripts/validate-appearance-registry.mjs`: PASS
- `node scripts/validate-surface-spec.mjs`: 154 locks PASS
- `node scripts/check-no-remote-assets.mjs`: PASS
- TypeScript syntax transpilation of changed TS/TSX sources: PASS

The transported snapshot does not include `node_modules` or a usable dependency lock, so full `pnpm validate`, Vitest, Next build, and packaged runtime smoke must still be rerun in the real checkout before release qualification.
