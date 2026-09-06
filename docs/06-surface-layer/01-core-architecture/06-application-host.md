# 6. ApplicationHost : contrat fonctionnel

`ApplicationHost` encadre une `local_module_surface` **après** résolution côté serveur.

Il possède uniquement :

- le cadre visuel Koali minimal ;
- le mode framed/immersive ;
- l'état de chargement de l'embed ;
- l'affichage de l'état public de disponibilité ;
- la commande de retour à Koali ;
- la gestion bornée des erreurs d'embed ;
- les événements de télémétrie de présentation ;
- les contrôles d'accessibilité propres au host.

Il reçoit un `SurfaceDescriptorPublic`. Il ne connaît pas `runtimeRef`, ne choisit pas un port et ne démarre pas le runtime.

Il ne possède pas :

- l'état de session métier du module ;
- les permissions métier ;
- les données métier ;
- le router interne du module ;
- les formulaires du module ;
- le stockage du module ;
- les décisions du module ;
- le cycle de vie métier du module ;
- le lifecycle système du runtime.

`LOCK-KS-SURF-018` — **ApplicationHost n'est pas un BFF métier.** Toute projection additionnelle doit rester non autoritative, bornée et explicitement déclarée.

`LOCK-KS-SURF-019` — **ApplicationHost n'inspecte pas le DOM interne de l'application hostée.**

`LOCK-KS-SURF-020` — **ApplicationHost n'injecte pas de JavaScript dans l'application hostée.**

`LOCK-KS-SURF-021` — **ApplicationHost ne dépend pas d'un CDN ou d'un asset runtime distant pour fonctionner.**
