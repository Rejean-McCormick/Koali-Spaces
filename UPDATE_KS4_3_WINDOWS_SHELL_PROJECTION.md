# KS4.3 — Windows Shell Projection

KS4.3 closes the development-state gap identified by the Windows diagnostic.

`dev-ecosystem.mjs` already produced `ecosystem-status.json` and `surface-runtime.json`, but the presentation server only consumed `active-state.json`. The result was a permanent development fallback containing only `space_home`.

KS4.3 adds a development projection compiler:

```text
owner contracts + discovery + runtime observations
                    |
                    v
       ecosystem-status / surface-runtime
                    |
                    v
        shell-state-compiler.mjs
                    |
                    v
            active-state.json
                    |
                    v
             /api/shell-state
                    |
                    v
               ShellProvider
```

The generated state contains presentation metadata only. Repository paths, process commands and credentials stay outside the browser-facing shell contract.

The root layout now server-seeds `ShellProvider`, so the initial page no longer falsely displays `Shell: loading` while hydration starts. Client polling remains active for runtime changes.

Linked owner products are projected as sibling `local_module_surface` modules. Source-only repositories such as Kristal Framework and kOA Linux are not turned into fake applications.
