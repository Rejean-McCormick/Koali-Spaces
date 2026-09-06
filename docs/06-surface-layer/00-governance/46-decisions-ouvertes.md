# 46. Décisions ouvertes — ne pas inventer

Les points suivants sont volontairement **ouverts** :

1. `OPEN-KS-SURF-001` — catalogue final des transports admis et stratégie par application. L’ADR doit comparer au minimum : iframe vers origine locale enregistrée, gateway path same-origin, et origine locale dédiée par application. La v1.1 verrouille l’abstraction `transport_profile_ref`, pas l’implémentation finale.
2. `OPEN-KS-SURF-002` — stratégie SSO globale multi-app.
3. `OPEN-KS-SURF-003` — protocole parent/child `postMessage` versionné éventuel.
4. `OPEN-KS-SURF-004` — palette exacte des accents de contexte par module.
5. `OPEN-KS-SURF-005` — Browser Fullscreen API éventuel.
6. `OPEN-KS-SURF-006` — politique exacte de persistance du display mode entre sessions.

Un développeur peut expérimenter localement derrière un feature flag. Une expérience ne devient pas canonique par usage, par réussite technique ou par génération IA.

Aucun `OPEN-KS-SURF-*` ne peut être fermé par un patch de code seul.
