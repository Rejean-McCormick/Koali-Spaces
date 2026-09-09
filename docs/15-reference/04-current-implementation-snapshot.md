# Snapshot d’implémentation de référence

**Classe : Référence — non normative**

Après le patch Surface Layer v1.1 implementation pack :

- Next App Router ;
- GlobalShell client sensible au mode `framed` / `immersive` et à la surface produit active ;
- `ProductSurfaceSelector` apparaît lorsqu’un produit expose plusieurs surfaces admises et encode la sélection via `ks_surface` ;
- ShellProvider polling `/api/shell-state` toutes les 5 s ;
- localisation shell `fr-CA` / `en` avec bundles locaux ;
- densité Space `comfortable` / `compact` / `touch` projetée vers Ant Design ;
- `registry.ts` gère admission dynamique produit/module, aliases, route availability, home override, outer namespace `/apps/<moduleId>`, surface profiles, navigation/widgets ;
- shell adaptatif : sidebar/Drawer absents lorsqu’aucune navigation owner n’est visible ;
- topbar normale sans bruit permanent `ready`/réseau/refresh ;
- contrat widget corrigé : `projection_ref` séparé de `activation` ;
- surface produit adressable/restaurable via le namespace Koali réservé `ks_surface` ;
- `SurfaceResolutionService` serveur ;
- projection `ResolvedSurfaceInternal -> SurfaceDescriptorPublic` ;
- registre runtime Koali séparé (`surface-runtime.json`) ;
- `SurfaceRenderer` avec les trois SurfaceKind v1 ;
- `ApplicationHost` framed/immersive sans process lifecycle direct ;
- closed registries pour shell pages, registered components et providers globaux ;
- Home/Health/Offline/Settings ont un contenu Koali réel ;
- Search/Tasks utilisent un provider model serveur fermé (aucun owner provider n’est onboardé par défaut) ;
- CSP autorise `frame-src 'self'` et des origines additionnelles uniquement via allowlist locale de build `KOALI_SPACES_FRAME_SRC` ;
- la runtime URL policy rejette les origines Internet arbitraires et les combinaisons same-origin sandbox dangereuses ;
- control server Node sur Unix socket Linux ;
- state JSON atomique ;
- production Next standalone ;
- packaging vérifie explicitement `dist/runtime/server.js` ;
- runtime smoke script vérifie `/`, `/tasks`, `/settings`, `/health`.

Non implémenté par ce patch :

- transport canonique final par application (`OPEN-KS-SURF-001`) ;
- SSO multi-app (`OPEN-KS-SURF-002`) ;
- bridge parent/child versionné (`OPEN-KS-SURF-003`) ;
- palette module finale, Browser Fullscreen, persistance exacte du display mode ;
- owner providers Search/Tasks ;
- command palette execution for `command_refs` ;
- contextual inspector renderer for `inspector_ref` ;
- onboarding production de Konnaxion/Orgo/UCKK/SemantiK Architect ;
- lifecycle broker concret côté kOA.

Ce fichier doit être mis à jour après des étapes majeures, sans servir de substitut aux docs normatives.


Compatibilité : les manifests v1 sans `surface_profiles` continuent à fonctionner comme une surface `control` synthétique. Le shell ne contient toujours aucune liste hardcodée de produits.
