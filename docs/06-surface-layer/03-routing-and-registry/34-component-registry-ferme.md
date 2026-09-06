# 34. Component registry fermé

Pour `registered_component_surface` :

```ts
const REGISTERED_SURFACES = {
  // explicit imports only
} as const;
```

Interdit :

```ts
import(`/components/${manifest.componentName}`)
```

si `componentName` peut être fourni librement par un manifest non compilé/allowlisté.

`LOCK-KS-SURF-112` — **Pas d'import dynamique arbitraire à partir d'un nom fourni par une définition de Space ou un manifest.**

`LOCK-KS-SURF-113` — **Chaque composant exécutable est présent dans la build locale et enregistré explicitement.**

---
