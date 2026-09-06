# Orgo

**Classe : Boundary d’intégration**

Orgo reste owner de ses Tasks, Cases, signals, workflows, multi-tenancy et UI.

Koali peut héberger l’application Orgo et agréger des Task provider items explicitement exposés. L’agrégateur `/tasks` n’est pas le Task engine Orgo.

Toute action modifiant un Task/Case passe par Orgo et son authorization path.
