# 3. Anti-réimplémentation : règle centrale de la couche

La Surface Layer existe précisément pour éviter que Koali recrée les interfaces des applications complètes.

```text
Accepté
Koali -> host Konnaxion -> Konnaxion rend Konnaxion
Koali -> host Orgo -> Orgo rend Orgo
Koali -> host UCKK-Moodle -> Moodle rend UCKK
Koali -> host SemantiK Architect -> Architect rend son frontend

Interdit
Koali -> copie React des pages Konnaxion
Koali -> copie des workflows Orgo
Koali -> réécriture d'un campus Moodle
Koali -> duplication des outils Architect
```

`LOCK-KS-SURF-009` — **No business UI cloning.** Lorsqu'une application possède une UI runtime exploitable, Koali MUST l'héberger ou lancer cette UI ; il MUST NOT recréer ses écrans métier pour “mieux intégrer” le produit.

`LOCK-KS-SURF-010` — **No backend duplication.** La Surface Layer MUST NOT recopier API, modèles, workflow, stockage, service métier ou logique d'autorisation d'une application hostée.

`LOCK-KS-SURF-011` — **No internal navigation stripping.** Koali MUST NOT retirer, masquer par CSS injecté, réécrire ou remplacer la navigation interne d'une application propriétaire dans le but de la faire ressembler à Koali.

Exception : une application propriétaire MAY offrir elle-même un mode “embedded” ou “chrome-less”. Koali MAY le demander par un contrat explicite. Koali MUST NOT le simuler en modifiant le DOM interne de l'application.

---
