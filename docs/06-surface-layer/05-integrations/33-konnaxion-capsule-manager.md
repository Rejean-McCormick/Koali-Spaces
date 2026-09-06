# 33. Konnaxion Capsule Manager

Le Konnaxion Capsule Manager est une surface opérateur distincte de l'application Konnaxion utilisateur.

Il possède son propre modèle Manager/Agent/Builder et des opérations sensibles de lifecycle, réseau, backup, restore et Security Gate.

Règles Koali :

- l'UI Manager peut être hostée uniquement dans un contexte opérateur autorisé ;
- Koali ne remplace pas ses gates de sécurité ;
- la surface ne transforme jamais ses boutons en appels Docker directs depuis Koali ;
- les opérations privilégiées restent chez le Manager/Agent propriétaire ;
- son onboarding doit déclarer explicitement les restrictions de réseau et de permissions browser.

Cette surface ne doit pas apparaître comme une page normale d'un Space utilisateur général par simple découverte automatique.
