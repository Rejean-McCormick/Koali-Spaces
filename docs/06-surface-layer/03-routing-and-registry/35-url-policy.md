# 35. URL policy

Le fichier existant `src/lib/url-policy.ts` doit rester la base conceptuelle pour la politique URL ; la Surface Layer l'étend sans affaiblir ses contrôles.

Politique minimale pour une target web :

```text
- target resolved server-side
- no javascript: / data: / file: from manifests
- no protocol-relative //host
- no credentialed URL
- no raw external URL from user input
- no path traversal
- no unsafe encoded traversal
- redirect destination revalidated
- module route is relative to owner target
```

`LOCK-KS-SURF-114` — **Un redirect doit être soumis à la même politique que la destination initiale.**

`LOCK-KS-SURF-115` — **Une route relative ne peut pas changer l'origine enregistrée du module.**

---
