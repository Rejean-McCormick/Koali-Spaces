# 36. Shell integration

`GlobalShell` doit devenir sensible au `SurfaceDisplayMode` sans transférer cette logique aux applications hostées.

Pseudo-structure :

```tsx
<SurfaceModeProvider>
  <GlobalShell>
    <SurfaceRenderer />
  </GlobalShell>
</SurfaceModeProvider>
```

En `framed` :

```text
GlobalShell = normal
TopBar = visible
Sidebar = visible selon responsive
MainSurface = normal constraints
```

En `immersive` :

```text
GlobalShell = immersive modifier
TopBar = not rendered/hidden accessibly
Sidebar = not rendered/hidden accessibly
MainSurface = viewport fill
ImmersiveSurfaceControls = visible
```

`LOCK-KS-SURF-116` — **Le shell ne doit pas déléguer à l'iframe la responsabilité de masquer le shell Koali.**

`LOCK-KS-SURF-117` — **Le layout mobile doit obéir aux mêmes modes conceptuels que desktop.**

---
