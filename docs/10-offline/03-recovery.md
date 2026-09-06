# Recovery de présentation

**Classe : Normatif**

Koali conserve le dernier Space validé et un chemin de rollback. Le recovery de présentation ne restaure pas les données métier.

Après perte d’un runtime child, Koali peut retenter readiness ou proposer un fallback ; il ne recrée pas l’état interne du child.

La reprise réseau ne déclenche pas de synchronisation cross-system implicite.
