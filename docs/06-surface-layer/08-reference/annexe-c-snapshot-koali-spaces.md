# Annexe C — Snapshot Koali Spaces utilisé

Snapshot de référence fourni : généré `2026-09-05T16:03:46.899520`.

Stack documentée :

```text
Next.js 15.5.24
React 18.2.0
Ant Design 5.26.2
@ant-design/pro-components 2.8.10
TypeScript 5.9.x
pnpm 10.20.0
```

Le snapshot indique que Koali Spaces est déjà conçu comme couche d'expérience indépendante, avec shell partagé, module selector, sidebar responsive, top bar, PageShell générique, assets locaux et absence de copie du business Konnaxion.

Ce document étend cette direction en fixant la couche de rendu manquante : **SurfaceRenderer + ApplicationHost + framed/immersive + local surface registration + règles anti-dérive**.
