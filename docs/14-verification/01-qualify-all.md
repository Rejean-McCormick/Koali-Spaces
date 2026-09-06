# QUALIFY ALL

**Classe : Gate de release**

Gate actuel : dependency lock -> validation -> production build -> Git read-only handoff.

Cible : ajouter un runtime smoke après build : lancer `pnpm start` sur port de test, attendre readiness, vérifier au moins `/`, `/tasks`, `/settings`, `/health`, puis arrêter proprement.

Avec Surface Layer : ajouter spec validation, surface unit tests et un child fixture d’intégration.
