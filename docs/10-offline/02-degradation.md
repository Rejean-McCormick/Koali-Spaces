# Dégradation

**Classe : Normatif**

La dégradation doit être capability-scoped et visible. Une route peut être read-only pendant qu’une autre du même module reste unavailable.

Ne pas utiliser un unique booléen `online` pour déduire toutes les fonctions d’une application propriétaire. L’owner expose ses states pertinents.

Pour la Surface Layer, les axes access/runtime/connectivity/render restent distincts.
