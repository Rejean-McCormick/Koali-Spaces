# Backup et restore

**Classe : Normatif**

Koali backup coordination porte seulement sur l’état de présentation nécessaire : Space actif validé, préférences locales sûres et références de rollback selon policy.

Les données métier des owners sont sauvegardées par leurs propres mécanismes.

Un restore Koali ne doit jamais écrire dans les stores d’une application intégrée.
