# Control plane, render plane et data plane

**Classe : Normatif**

## Control side Koali

Résout : Space actif, manifests admis, capabilities projetées, thème, registrations, availability et safe fallbacks.

## Render side browser

Reçoit uniquement des descriptors minimisés nécessaires au rendu. Le browser ne reçoit pas de secrets, credentials de service ou détails de lifecycle privilégié.

## Data plane propriétaire

Les données métier circulent entre l’application et ses APIs selon ses propres contrats. Koali ne devient pas un proxy métier générique simplement parce qu’il héberge l’UI.

Pour une vue agrégée Koali, utiliser des providers/projections déclarés et non autoritatifs.
