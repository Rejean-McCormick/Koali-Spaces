# Global Shell

**Classe : Normatif**

Le shell desktop est composé d’une bande supérieure et d’un corps :

```text
+---------------------+---------------------------------------------+
| Module selector     | Shared top bar                              |
+---------------------+---------------------------------------------+
| Active module nav   | Main page surface                           |
|                     |                                             |
+---------------------+---------------------------------------------+
```

Composants actuels : `GlobalShell`, `ModuleSelector`, `SharedTopBar`, `ActiveModuleSidebar`, `MainPageSurface`, `SkipLinks`.

Le shell est rendu une fois. Le content owner n’instancie pas une deuxième navigation Koali.
