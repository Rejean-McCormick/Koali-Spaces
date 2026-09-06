# 45. Change control et ADR obligatoires

Un ADR est obligatoire pour :

- ajouter un SurfaceKind ;
- modifier la séparation authority/presentation ;
- choisir une stratégie de transport uniforme ;
- introduire un BFF d'expérience ;
- introduire un postMessage bridge métier ;
- introduire Browser Fullscreen comme comportement produit ;
- introduire un SSO global ;
- autoriser une origine réseau non locale dans le renderer de base ;
- permettre des extensions exécutables distantes ;
- modifier la politique de capability ;
- modifier l'externalité UCKK ;
- modifier les exclusions Ame-Artificielle / VotingMachine ;
- faire de Koali le propriétaire d'un nouvel état métier cross-module.

Template minimal :

```markdown
# ADR-KS-SURF-XXXX — Decision
Status: proposed|accepted|rejected|superseded

## Context
## Source contracts
## Lock IDs affected
## Decision
## Security consequences
## Authority consequences
## Compatibility consequences
## Migration
## Tests required
## Rollback
```

---
