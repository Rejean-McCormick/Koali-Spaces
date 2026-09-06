# 20. Communication parent ↔ application

Par défaut, aucune communication métier parent/child n'est implicite.

Un futur bridge `postMessage` peut être utile pour :

- signaler un changement de taille ;
- demander une navigation explicitement admise ;
- signaler un changement de titre ;
- demander une sortie immersive ;
- signaler un besoin d'ouverture externe.

Il ne doit pas être utilisé pour contourner les APIs propriétaires.

`LOCK-KS-SURF-072` — **Aucun protocole `postMessage` générique ne donne accès aux données ou commandes métier.**

`LOCK-KS-SURF-073` — **Tout message doit avoir un type allowlisté, une version, une origine validée et une validation de payload.**

`OPEN-KS-SURF-003` — **Le protocole parent/child n'est pas requis pour le MVP du renderer.** Ne pas le créer sans besoin concret.

---
