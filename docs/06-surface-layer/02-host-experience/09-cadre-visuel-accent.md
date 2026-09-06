# 9. Cadre visuel et accent de contexte

Le snapshot Koali actuel conserve un accent global principal `#1e6864` et des surfaces neutres. La demande d'une différence de couleur par application est donc implémentée comme **accent de contexte**, pas comme un nouveau design system global.

Le contexte MAY afficher :

- un trait/bordure d'accent ;
- un badge ou label de module ;
- un petit marqueur dans l'entête du cadre ;
- un focus ring cohérent ;
- un indicateur de contexte dans le module selector.

Il MUST NOT recolorer l'UI interne de l'application hostée.

```ts
interface ResolvedSurfacePresentation {
  displayModes: Array<"framed" | "immersive">;
  defaultDisplayMode: "framed" | "immersive";
  contextAccentToken?: string;
  contextLabel: string;
}
```

`LOCK-KS-SURF-030` — **L'accent de contexte est strictement visuel.** Il ne signale ni autorité, ni sécurité, ni validation, ni statut de confiance.

`LOCK-KS-SURF-031` — **L'accent de contexte ne remplace pas les couleurs sémantiques de statut.**

`LOCK-KS-SURF-032` — **Koali ne crée pas un deuxième thème interne pour les applications hostées.**

`LOCK-KS-SURF-033` — **L'application propriétaire reste propriétaire de son design system.**

`LOCK-KS-SURF-034` — **La couleur ne doit jamais être l'unique moyen d'identifier le contexte.** Le nom du module doit rester exposé de manière accessible.

---
