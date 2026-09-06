# Fail-closed et erreurs visibles

**Classe : Normatif**

- manifest invalide -> contribution rejetée ;
- module optionnel manquant -> omis/unavailable selon policy ;
- module required manquant -> activation bloquée ;
- capability absente -> route/widget non admis ou access denied ;
- runtime child indisponible -> surface unavailable/degraded, jamais substitution silencieuse ;
- control state absent en production -> 503/unavailable ;
- assets offline incomplets -> ne pas revendiquer la disponibilité offline.
