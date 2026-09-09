# Module Selector

**Classe : Normatif**

Le selector en haut à gauche affiche dynamiquement les produits/modules : enabled dans le Space, admis et compatibles avec les capabilities visibles. La liste n’est pas un catalogue produit hardcodé dans le shell.

Sélectionner un produit/module choisit la route home sûre de sa surface par défaut en fonction du network state et des capabilities.

Le label public vient du Space lorsqu’il existe, sinon du manifest.

Cible : supporter `home_route_override`, icon refs, localisation des labels et reprise de dernière route sûre par module.


La sélection de produit et la sélection de surface sont distinctes. `ProductSurfaceSelector` n’est affiché que lorsqu’un manifest expose plusieurs surfaces admises.
