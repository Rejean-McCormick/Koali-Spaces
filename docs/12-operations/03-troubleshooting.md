# Troubleshooting rapide

**Classe : Référence**

Ordre de diagnostic :

1. `pnpm run validate` ;
2. `pnpm run build` ;
3. `pnpm start` ;
4. vérifier `/`, `/tasks`, `/settings`, `/health` ;
5. Linux : vérifier control socket et `/health` control ;
6. vérifier `KOALI_SPACES_STATE_ROOT` et active state ;
7. vérifier manifests/theme/assets admis ;
8. pour child app : vérifier readiness/transport selon son conformance profile.

Ne pas « réparer » une erreur d’application en copiant sa logique dans Koali.
