# Routes Koali Spaces

**Classe : Référence**

Globales : `/`, `/search`, `/tasks`, `/offline`, `/health`, `/settings`.

API presentation : `/api/shell-state`.

Host dynamique : `/apps/[moduleId]/[[...route]]`.

Control socket HTTP : `/health`, `/capabilities`, `/capabilities/update`, `/shell-state`, `/manifest/read`, `/space/activate`, `/space/rollback`, `/space/deactivate`.

Les routes internes d’une child app restent hors de cet index sauf entry/deep links explicitement déclarés.
