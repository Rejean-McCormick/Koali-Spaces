# Modèle de sécurité

**Classe : Normatif**

Koali Spaces applique least exposure et fail closed.

Principes : loopback presentation, control socket local, paths confinés, CSP, no remote runtime assets pour le shell offline, capability projection non autoritative, absence de secrets dans artifacts de présentation.

L’hébergement d’applications ajoute une frontière browser qui doit suivre le threat model Surface Layer v1.1.
