# Konnaxion

**Classe : Boundary d’intégration**

Konnaxion est une application/système propriétaire avec Next.js UI, backend et routes internes riches.

Koali fournit : launch context, frame/immersive hosting, entry route, availability, accent contextuel et navigation de retour.

Konnaxion conserve : modules internes, routes `/ethikos/*`, `/konnected/*`, `/konsensus/*`, `/kreative/*`, reports, auth, APIs, workflows et business state.

Ne pas créer une copie Koali des pages Konnaxion. Ne pas renommer ses routes pour convenance du shell.


Konnaxion peut conserver son entry point standalone tout en exposant au shell intégré les mêmes routes et une ou plusieurs `surface_profiles`. Koali Spaces ne devient pas le runtime obligatoire de Konnaxion, et Orgo ou un autre produit ne doit pas importer le shell privé de Konnaxion pour obtenir une grammaire UX commune.
