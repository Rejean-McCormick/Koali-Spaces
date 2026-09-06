# 8. État de mode et navigation navigateur

Le mode d'affichage est un état Koali.

Recommandation normative :

```ts
interface SurfaceViewState {
  moduleId: string;
  displayMode: "framed" | "immersive";
}
```

L'état MAY être persisté par session utilisateur locale. Il MUST NOT être stocké dans le système métier du module.

La navigation Back/Forward du navigateur SHOULD préserver une expérience cohérente. La route métier du module et le display mode ne doivent pas être confondus.

`LOCK-KS-SURF-028` — **Koali ne modifie pas la route interne d'un module uniquement pour entrer/sortir du mode immersive.**

`LOCK-KS-SURF-029` — **Changer de module sort du mode immersive du module précédent.** Le nouveau module reprend son mode par défaut ou sa préférence propre, jamais un mode hérité accidentellement d'un autre module.

---
