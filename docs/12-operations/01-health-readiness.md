# Health et readiness

**Classe : Normatif**

Le control health actuel mappe : `ready` -> healthy/ready, `offline|degraded` -> degraded mais ready, autres -> unavailable/non-ready.

À terme, distinguer health du shell, readiness de l’active Space et health des child runtimes.

Un child unhealthy ne rend pas nécessairement Koali unhealthy si le module est optionnel.
