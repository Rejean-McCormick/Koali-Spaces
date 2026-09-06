# Dependency lock status

A genuine `pnpm-lock.yaml` was first generated in the real Koali Spaces repository with pnpm 10.20.0 during qualification.

The first generated lock reported by the qualification console had SHA256:

`64e1d507901fd09ec304192f0ee4a3ef9bd0b4e9aec1c5ff1c868f5c8a684e5f`

That lock corresponds to the earlier dependency set. This hotfix updates the reviewed `package.json` (including the maintained Next.js 15 security line), so the real repository must regenerate the lock once with **PREPARE / LOCK** or **QUALIFY ALL** in Build Console v1.2.

After regeneration:
1. the console verifies `pnpm run check:dependency-lock`;
2. it immediately verifies `pnpm install --frozen-lockfile`;
3. validation and production build must pass;
4. only then should the resulting `pnpm-lock.yaml` be committed.

No lockfile is fabricated or shipped by this passive overlay.
