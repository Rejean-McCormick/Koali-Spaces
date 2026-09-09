# Orgo

**Classe : Boundary d’intégration**

Orgo reste owner de ses Tasks, Cases, signals, workflows, multi-tenancy et UI.

Koali peut héberger l’application Orgo et agréger des Task provider items explicitement exposés. L’agrégateur `/tasks` n’est pas le Task engine Orgo.

Toute action modifiant un Task/Case passe par Orgo et son authorization path.


## Surfaces Orgo

Le gros **Orgo Control Panel** est la surface maximale de référence. Des surfaces telles que `my_work`, `operations`, `supervisor`, `intake`, `workflow_admin`, `executive` ou `embedded` doivent être des projections de la même UI Orgo et de ses mêmes routes/capabilities, pas des frontends indépendants.

Le manifest Orgo peut donc publier plusieurs `surface_profiles` qui sélectionnent navigation, home route, widgets, commandes et inspector contextuel. Orgo reste fonctionnel standalone lorsque cette capacité est déclarée, et son retrait du registre Koali ne doit pas modifier Konnaxion ou les autres produits.
