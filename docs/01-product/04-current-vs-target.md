# État actuel et cible

**Classe : Référence d’implémentation**

## Actuel après Surface Layer implementation hardening v1.2

Le repository contient :

- shell global responsive ;
- module selector ;
- sidebar dynamique ;
- shared top bar ;
- thèmes Ant Design 5 ;
- localisation locale fr-CA / en ;
- state projection via `/api/shell-state` ;
- control server Linux ;
- activation/rollback/deactivation de Space ;
- validation de contracts ;
- packaging Next standalone ;
- SurfaceResolutionService serveur et descriptor public minimisé ;
- SurfaceRenderer ;
- ApplicationHost framed/immersive sans remount de la surface propriétaire ;
- restauration du focus vers le contrôle d’activation après sortie immersive ;
- runtime registration projection Koali séparée avec catalogues fermés des permissions iframe ;
- Home/Health/Offline/Settings fonctionnels au niveau présentation ;
- Search/Tasks branchés sur un provider registry fermé sans provider owner par défaut ;
- validation d’activation renforcée : namespace de route, fallback/home override, chemins stricts et propriété des shell pages ;
- tests Surface Layer unit/runtime/security ;
- smoke du runtime packagé disponible après build.

## Cible suivante dépendante des owners/ADR

1. accepter l’ADR de transport et configurer un premier transport production ;
2. connecter le lifecycle broker kOA sans process control direct depuis Koali ;
3. créer le premier Application Conformance Profile production ;
4. onboarder une application pilote (Konnaxion recommandé après fixture) ;
5. ajouter les providers owner Search/Tasks/Status/Counter/Resume ;
6. décider le SSO seulement via ADR séparé ;
7. onboarder les autres applications une par une.

Cette distinction empêche de présenter une cible documentaire comme déjà implémentée.

## Limites encore intentionnelles

Le host générique est prêt à être qualifié, mais l’intégration écosystème n’est pas déclarée complète tant qu’aucune vraie application propriétaire n’a passé son `ApplicationConformanceProfile`. Les providers `Status/Counter/Resume`, les commandes owner, les badges/icônes dynamiques, `offline_entrypoint`, le lifecycle broker réel et le transport production restent des travaux séparés ou dépendants des ADR/owners. Le contrôle visible parent est la sortie immersive garantie; `Escape` n’est pas garanti lorsque le focus clavier est capturé par une iframe cross-origin sans bridge explicite.
