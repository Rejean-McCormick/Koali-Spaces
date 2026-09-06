## 0. Statut, objectif et force normative

Ce document fixe l'architecture de développement de la couche **Surface Renderer / Application Host** de **Koali Spaces**. Il sert de base aux travaux de conception, de codage, de tests, de revue, de documentation et aux générations assistées par IA.

Les mots **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT** et **MAY** sont normatifs.

Ce document n'accorde aucune nouvelle autorité métier à Koali Spaces. Il fixe uniquement la manière dont Koali Spaces compose, héberge, encadre, masque ou expose des interfaces appartenant à des modules et applications déjà propriétaires de leur état, de leurs workflows et de leurs décisions.

Une règle portant un identifiant `LOCK-KS-SURF-*` est un **verrou anti-dérive**. Elle ne peut pas être modifiée par une implémentation, un ticket, une génération IA, une refactorisation ou une préférence UI locale. Toute modification exige :

1. un ADR explicite ;
2. la mise à jour de ce document ;
3. la régénération et validation du registre JSON des locks ;
4. la mise à jour des schémas/contracts touchés ;
5. la mise à jour des tests de conformité ;
6. un `QUALIFY ALL` propre ;
7. `node tools/validate-surface-spec.mjs` réussi ;
8. un commit de référence propre.

**Règle de sécurité documentaire :** en cas d'incertitude ou de conflit non résolu entre les sources, l'implémentation MUST s'arrêter sur la décision concernée. Elle MUST NOT inventer silencieusement une réconciliation.

---
