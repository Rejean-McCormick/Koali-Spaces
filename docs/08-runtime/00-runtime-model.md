# Runtime model

**Classe : Normatif + Référence d’implémentation**

Koali Spaces possède deux boundaries locales :

1. **presentation HTTP** loopback pour le browser ;
2. **control HTTP-over-Unix-socket** sur Linux pour l’intégration kOA.

En production, le presentation runtime est le Next standalone généré dans `dist/runtime`. Le launcher Koali orchestre le standalone sans recréer un custom production server Next.

En développement, un custom Next dev server est permis.
