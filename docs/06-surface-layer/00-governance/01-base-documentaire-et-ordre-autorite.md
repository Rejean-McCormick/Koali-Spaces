# 1. Base documentaire et ordre d'autorité

## 1.1 Sources utilisées

Cette spécification est construite à partir des sources fournies dans les context packs et du snapshot Koali Spaces :

- kOA-Linux : contrats de système, boundary Koali Spaces, profils, intégrations, sécurité et navigation IA ;
- Konnaxion v14 ;
- UCKK-Moodle ;
- Orgo v3 ;
- SemantiK Architect ;
- Kristal Framework ;
- Konnaxion Capsule Manager ;
- kOA Digital Ecosystem ;
- K-Port ;
- XKaliber ;
- MediKristal ;
- Kristal Farms ;
- UCKK Assets ;
- Freeze–Vote–Rebuild Operational Peace Framework ;
- snapshot de référence Koali Spaces généré le 2026-09-05.

Les projets **Ame-Artificielle** et **VotingMachine / VM Engine** sont explicitement hors scope de la couche décrite ici.

Les versions exactes des context packs utilisées par cette spécification sont fixées dans `sources/SOURCES.lock.json`. Le nom d'un projet sans son pin de source ne suffit pas à établir une base reproductible.

## 1.2 Hiérarchie d'autorité pour cette couche

Lors d'une modification de la Surface Layer, l'ordre suivant MUST être appliqué :

1. **Contrats canoniques kOA-Linux applicables** à l'autorité, aux limites, à l'activation, à la sécurité et à la boundary Koali Spaces.
2. **Ce document** pour les décisions propres au Surface Renderer et à l'Application Host.
3. **Contrats et documentation canonique du sous-système propriétaire** pour son UI interne, ses routes internes, son authentification, ses données et son comportement.
4. **Code snapshot réel** pour les noms et chemins réellement implémentés, sauf lorsqu'une migration est explicitement définie dans ce document ou dans un ADR accepté.
5. Documentation de référence non canonique.
6. Index générés, uniquement pour la découverte.

`LOCK-KS-SURF-001` — **Les index générés ne sont jamais une autorité de comportement.** Ils peuvent aider à trouver une source mais ne peuvent pas remplacer le contrat propriétaire.

`LOCK-KS-SURF-002` — **Un conflit non résolu ne peut pas être “corrigé” par l'IA.** Il doit produire une erreur documentaire, une question d'architecture ou un ADR.

---
