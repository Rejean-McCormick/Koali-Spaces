# KS-2 — Shell Model Cleanup

**Statut :** implémenté dans ce snapshot.

## Implémenté

- sidebar owner vide omise sur desktop ;
- Drawer mobile vide impossible à ouvrir/rendre ;
- contenu du shell pleine largeur lorsqu’aucune navigation owner n’existe ;
- restauration du focus vers le déclencheur mobile après fermeture du Drawer ;
- un seul module admis est rendu comme identité plutôt que comme dropdown inutile ;
- topbar normale sans bruit permanent de readiness/réseau/refresh ;
- état shell dégradé/offline représenté par un seul contrôle compact vers Health ;
- `projection_ref` topbar indépendant de `activation` ;
- ancienne activation `status_provider` rejetée ;
- `counter` et `resume` exigent une projection ;
- surface produit sélectionnée encodée dans l’état de navigation réservé `ks_surface` ;
- surface invalide/non admise fail-closed vers la surface par défaut admise ;
- URL canonicalisée ; refresh/back/bookmark restaurent l’intention de surface ;
- navigation sidebar conserve l’état de surface Koali sans inventer de query state owner.

## Non revendiqué par KS-2

- badges sidebar alimentés par provider ;
- rendu topbar status/counter/resume alimenté par provider ;
- registre/rendu des icônes sidebar ;
- sections conditionnelles Home et launcher hosted/native ;
- exécution des commandes owner.

Ces éléments restent dans les travaux suivants parce qu’ils dépendent du `GlobalProjectionRuntime` ou de contrats runtime/owner distincts.
