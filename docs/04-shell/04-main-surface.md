# Main Page Surface

**Classe : Normatif**

`MainPageSurface` est le seul espace global de contenu. Il reçoit :

- pages globales Koali ;
- module shell pages ;
- registered component surfaces ;
- local module application surfaces.

La future implémentation doit déléguer le choix au `SurfaceRenderer` plutôt qu’à une collection de placeholders dans les routes dynamiques.
