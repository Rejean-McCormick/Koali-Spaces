# Authorization boundary

**Classe : Normatif**

Koali peut : cacher, désactiver, marquer unavailable, choisir un safe fallback.

Koali ne peut pas : accorder un rôle, valider une mutation métier, créer un trust root, contourner une policy owner.

Toute commande propriétaire doit être revalidée par l’owner même si Koali avait affiché le contrôle à partir d’une capability snapshot valide.
