# Dependency lock status

The current reviewed dependency set is already locked in the real Koali Spaces repository with pnpm 10.20.0.

The qualified lock reported before this Surface Layer patch is:

`pnpm-lock.yaml` SHA256: `2de582a0ed4ce160fe3eecc39b7b9b165f2b15d3a2683e0ed4b5492c20097de8`

This Surface Layer implementation pack changes `package.json` scripts only. It does **not** add, remove or change dependency versions, so the existing dependency lock should remain compatible with `pnpm install --frozen-lockfile`.

After applying the pack, run the normal qualification gate. Do not regenerate the lock merely because package scripts changed; regenerate it only if pnpm reports a real dependency/importer mismatch or if dependency fields are deliberately changed.
