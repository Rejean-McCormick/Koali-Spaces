# Global Shell

**Classe : Normatif**

Le shell desktop est composé d’une bande supérieure et d’un corps :

```text
+---------------------+---------------------------------------------+
| Product selector    | Context header                              |
+---------------------+---------------------------------------------+
| Surface navigation  | Main workspace                           |
|                     |                                             |
+---------------------+---------------------------------------------+
```

Composants actuels : `GlobalShell`, `ModuleSelector` (product selector compatible), `ProductSurfaceSelector`, `SharedTopBar`, `ActiveModuleSidebar`, `MainPageSurface`, `SkipLinks`.

En mode intégré, le shell est rendu une fois. Le content owner n’instancie pas une deuxième navigation Koali autour de sa contribution. En mode standalone, le produit peut rendre les mêmes primitives Koali dans son propre entry point sans dépendre de Koali Spaces.
