# 2. Thèse architecturale verrouillée

Koali Spaces est le **bureau commun / experience layer**. Une application intégrée reste l'application propriétaire de son expérience interne.

Le modèle est :

```text
Koali Spaces
  ├─ sélectionne le module actif
  ├─ compose la navigation de contexte
  ├─ vérifie la disponibilité de la surface
  ├─ résout une surface admise
  ├─ encadre visuellement l'application
  ├─ peut retirer son propre chrome en mode immersif
  └─ n'absorbe jamais l'autorité métier de l'application

Application propriétaire
  ├─ conserve ses routes internes
  ├─ conserve son UI
  ├─ conserve sa navigation interne
  ├─ conserve son authentification/session
  ├─ conserve ses données
  ├─ conserve ses permissions métier
  └─ conserve ses workflows et décisions
```

`LOCK-KS-SURF-003` — **Koali Spaces est une couche de présentation non autoritative.**

`LOCK-KS-SURF-004` — **La présentation n'accorde jamais une autorité.** Être visible dans un menu, être rendu dans une surface ou être actif dans un Space ne constitue pas une autorisation métier.

`LOCK-KS-SURF-005` — **Koali Spaces ne possède pas les données métier représentées par les modules.**

`LOCK-KS-SURF-006` — **Koali Spaces ne possède pas le workflow interne, l'état métier, les permissions métier ou la validation spécifique d'un module.**

`LOCK-KS-SURF-007` — **Les écritures directes inter-sous-systèmes restent interdites.** Toute mutation passe par l'interface autorisée du propriétaire.

`LOCK-KS-SURF-008` — **Un module hosté ne devient pas un sous-module interne de Koali par le seul fait d'être visible dans Koali.**

---
