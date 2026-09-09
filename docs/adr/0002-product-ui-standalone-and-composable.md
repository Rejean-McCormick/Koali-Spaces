# ADR 0002 — Product UIs are standalone and composable

**Status:** Accepted

**Date:** 2026-09-08

## Context

Koali products must be removable one at a time while remaining independently useful. At the same time, the integrated Koali experience needs one coherent shell grammar rather than unrelated layouts or private cross-product UI imports.

## Decision

1. Koali Spaces is an optional integrated composition host, not the mandatory runtime of product UIs.
2. A product may expose a standalone application entry point and an integrated manifest at the same time.
3. Generic Koali shell behavior is a reusable UI contract/primitives layer; it contains no product business semantics.
4. The integrated product selector is derived from admitted manifests, never from a hard-coded mandatory product list.
5. A product manifest may expose declarative `surface_profiles`. A surface projects existing product-owned routes, navigation items, widgets, command refs and an optional inspector ref.
6. Surface profiles do not grant capability and do not duplicate business pages.
7. Removing one product removes its integrated contribution without requiring source changes to unrelated products.
8. Legacy manifests without surface profiles remain valid as one synthetic `control` surface.

## Consequences

- Orgo can provide one maximal Control Panel plus reduced surfaces without maintaining separate frontends.
- Konnaxion remains standalone and can share the Koali shell grammar without becoming a UI dependency of Orgo.
- Koali Spaces can evolve the integrated shell independently of product business applications.
- Future product onboarding must validate both integration references and any declared standalone/integrated portability metadata.
