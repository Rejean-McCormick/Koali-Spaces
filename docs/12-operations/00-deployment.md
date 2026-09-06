# Déploiement

**Classe : Référence opérationnelle**

Koali Spaces est un subsystem optionnel. Le host profile décide de sa présence et de son lifecycle.

Le runtime packagé est local. Presentation HTTP reste loopback dans le modèle courant. Le control socket est local au nœud Linux.

Activation du Space et démarrage du processus Koali sont deux opérations distinctes : l’une sélectionne l’expérience, l’autre appartient au lifecycle host.
