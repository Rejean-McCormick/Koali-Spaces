# Changelog — Koali Spaces Surface Layer

## 1.1.0 — 2026-09-06

Hardening architectural avant implémentation de masse.

### Changements normatifs

- la source normative des locks est désormais unique : déclarations Markdown ; JSON = projection générée ;
- le registre machine-readable couvre la totalité des locks ;
- ajout de provenance pinnée des context packs dans `sources/SOURCES.lock.json` ;
- séparation `ResolvedSurfaceInternal` / `SurfaceDescriptorPublic` ;
- `ApplicationHost` ne résout plus les runtime targets ;
- séparation `RuntimeRegistration` / `SurfacePresentationPolicy` ;
- remplacement de l’enum runtime unique par quatre axes : access, runtime, connectivity, render ;
- verrouillage du lifecycle : le renderer ne lance pas Docker/systemd/process directement ;
- transport abstrait par application via un `transport_profile_ref` fermé côté runtime ;
- ajout d’un threat model embed/browser ;
- propriété du router enfant explicitée après le deep link initial ;
- chrome framed réduit au minimum ;
- ajout de règles explicites sur focus et contrôle de sortie immersive ;
- clarification : exclusion de VotingMachine ≠ suppression de Smart Vote dans les systèmes qui le possèdent ;
- clarification : exclusion d’Ame-Artificielle ≠ interdiction des outils AI optionnels déjà propriétaires d’une application admise ;
- ajout d’un `ApplicationConformanceProfile` obligatoire pour l’onboarding ;
- ajout du gate `validate:surface-spec`.

### Nouveaux locks

`LOCK-KS-SURF-131` à `LOCK-KS-SURF-154`.

### Décisions toujours ouvertes

Les `OPEN-KS-SURF-001` à `OPEN-KS-SURF-006` restent ouvertes. La v1.1 n’invente pas une solution de transport, SSO, bridge, palette, Browser Fullscreen ou persistance de mode.
