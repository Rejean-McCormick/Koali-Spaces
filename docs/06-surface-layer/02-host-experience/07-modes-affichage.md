# 7. Deux modes d'affichage verrouillés

```ts
type SurfaceDisplayMode = "framed" | "immersive";
```

## 7.1 Mode `framed`

Koali reste visible.

```text
┌ Koali top bar ────────────────────────────────────────────────┐
├ sidebar ──────┬───────────────────────────────────────────────┤
│               │ context accent + module label    [Immersif]   │
│ Koali context │ ┌───────────────────────────────────────────┐ │
│ navigation    │ │ application propriétaire                 │ │
│               │ │ nav + contenu + style de l'application   │ │
│               │ └───────────────────────────────────────────┘ │
└───────────────┴───────────────────────────────────────────────┘
```

Le module conserve son interface complète. La différence visuelle Koali se limite au **cadre de contexte**.

## 7.2 Mode `immersive`

Koali retire son chrome sans transformer le module.

Koali masque :

- module selector ;
- shared top bar ;
- sidebar ;
- marge/padding de la surface principale ;
- page shell Koali concurrent.

Koali conserve une commande locale visible et accessible : **Retour à Koali**.

```text
┌───────────────────────────────────────────────────────────────┐
│ application propriétaire                                     │
│                                                               │
│                                                               │
│                                         [← Retour à Koali]     │
└───────────────────────────────────────────────────────────────┘
```

`LOCK-KS-SURF-022` — **Immersive n'est pas Browser Fullscreen.** Il s'agit d'un état de layout Koali.

`LOCK-KS-SURF-023` — **Le Browser Fullscreen API n'est pas requis en v1.** Il ne doit pas être ajouté implicitement sous le nom “immersive”.

`LOCK-KS-SURF-024` — **Le mode immersive ne recharge pas volontairement l'application.** Le changement doit être un changement de layout. Si une technologie force un reload, celui-ci doit être documenté comme limitation.

`LOCK-KS-SURF-025` — **Le retour à Koali ne doit pas dépendre uniquement de la touche Escape.** Une commande visuelle parent-owned reste disponible.

`LOCK-KS-SURF-026` — **L'application ne reçoit aucune nouvelle autorité en mode immersive.**

`LOCK-KS-SURF-027` — **Le mode est de la préférence d'expérience, pas une permission.**

---
