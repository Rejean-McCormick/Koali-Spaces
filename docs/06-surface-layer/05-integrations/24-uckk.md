# 24. UCKK : verrou d'externalité

UCKK-Moodle peut être affiché dans Koali comme application, mais les règles d'externalité restent intactes.

`LOCK-KS-SURF-083` — **Afficher UCKK dans Koali ne transforme pas UCKK en sous-système interne kOA-Linux.**

`LOCK-KS-SURF-084` — **Aucun partage implicite de DB, identité, stockage, accès ou lifecycle entre Koali et UCKK.**

`LOCK-KS-SURF-085` — **Pas de background bidirectional synchronization introduit par la Surface Layer.**

`LOCK-KS-SURF-086` — **Les opérations de contenu UCKK restent `publish_to_uckk` ou `import_from_uckk` lorsqu'elles concernent les flux de données ; l'embed UI n'est pas une troisième voie de synchronisation.**

---
