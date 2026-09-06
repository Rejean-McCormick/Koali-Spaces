# Concept de Space

**Classe : Normatif**

Un **Space** est une configuration d’expérience validée qui :

- possède `space_id`, titre et version ;
- sélectionne des module instances ;
- définit un module par défaut ;
- applique ordre et labels publics ;
- référence un thème ;
- définit le comportement offline du shell ;
- configure la top bar globale.

Un Space ne contient pas de business state et ne transporte pas d’extension exécutable arbitraire.

Exemple conceptuel :

```text
Space « École »
├── Accueil
├── Apprendre       -> UCKK / learning surfaces admises
├── Bibliothèque    -> Mediatheque/Kristal surfaces
├── Travail         -> Orgo
├── Communauté      -> Konnaxion
└── Créer           -> SemantiK Architect
```

Les labels ci-dessus sont des labels publics ; les `module_id` restent stables.
