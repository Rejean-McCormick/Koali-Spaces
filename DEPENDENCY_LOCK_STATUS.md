# Dependency lock status

`pnpm-lock.yaml` is intentionally **not fabricated** by this passive pack because neither supplied Konnaxion snapshot contains a lockfile and this isolated build environment cannot resolve the npm registry.

Before the Koali Spaces source repository is admitted or release-frozen, run the reviewed `package.json` with **pnpm 10.20.0** in an approved connected dependency-resolution environment, review the resulting transitive graph, commit `pnpm-lock.yaml`, then use `pnpm install --frozen-lockfile` thereafter.

The CI workflow deliberately fails closed while the genuine lockfile is absent.
