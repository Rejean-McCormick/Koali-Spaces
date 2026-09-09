# Main Page Surface

**Classe : Normatif**

`MainPageSurface` est le workspace global de contenu du mode intégré. Il reçoit :

- pages globales Koali ;
- module shell pages ;
- registered component surfaces ;
- local module application surfaces.

La future implémentation doit déléguer le choix au `SurfaceRenderer` plutôt qu’à une collection de placeholders dans les routes dynamiques.


Le mécanisme d’inspector contextuel, lorsqu’un produit le déclare, est une primitive de composition adjacente au workspace. Son contenu reste product-owned ; Koali Spaces ne transforme pas un `inspector_ref` en logique métier générique.
