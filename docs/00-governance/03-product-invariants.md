# Invariants produit anti-dérive

**Classe : Normatif**

1. **KS-INV-001** — Koali Spaces compose la présentation et ne gagne jamais d’autorité métier par composition.
2. **KS-INV-002** — La visibilité d’un module, route ou widget n’est jamais une preuve d’autorisation.
3. **KS-INV-003** — Un Space configure l’expérience ; il n’est ni un tenant authority ni un deployment profile.
4. **KS-INV-004** — Un module interface manifest est une contribution de présentation, pas un contrat métier.
5. **KS-INV-005** — Les applications complètes gardent leur UI, router et état interne.
6. **KS-INV-006** — Le browser ne résout pas des ports/processus internes arbitraires.
7. **KS-INV-007** — Le renderer ne démarre ni Docker, ni systemd, ni processus privilégié.
8. **KS-INV-008** — Les runtimes distants arbitraires ne sont jamais chargés depuis un manifest.
9. **KS-INV-009** — Un offline claim exige des assets locaux et une dégradation explicite.
10. **KS-INV-010** — Un état `degraded` ou `offline` ne fabrique jamais un succès métier.
11. **KS-INV-011** — Les capabilities consommées par Koali sont des projections non autoritatives.
12. **KS-INV-012** — Une application admise n’est pas automatiquement trusted comme origine Koali.
13. **KS-INV-013** — Le shell global est rendu une fois ; une application peut avoir son propre shell interne dans sa surface.
14. **KS-INV-014** — Le mode immersif masque le chrome Koali sans transférer l’autorité au child.
15. **KS-INV-015** — Le nom public du produit est Koali Spaces.
16. **KS-INV-016** — Les identifiants techniques restent stables malgré labels, langue et thème.
17. **KS-INV-017** — Une erreur d’un module optionnel ne doit pas rendre tout Koali indisponible.
18. **KS-INV-018** — Une contribution requise invalide peut bloquer l’activation du Space.
19. **KS-INV-019** — Les secrets et credentials ne sont jamais des artifacts de présentation.
20. **KS-INV-020** — Les choix encore ouverts sont résolus par ADR, pas par convention implicite d’un commit.
