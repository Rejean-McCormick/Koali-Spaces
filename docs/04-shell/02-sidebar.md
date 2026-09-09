# Sidebar

**Classe : Normatif**

La navigation globale est fournie par le manifest du produit/module actif puis projetée par la surface produit active. Une liste `navigation_item_ids` peut réduire cette navigation sans dupliquer les routes ou pages.

- profondeur visible : 2 ;
- groupes vides omis ;
- enfants filtrés par capabilities et disponibilité de route ;
- desktop : sidebar seulement lorsqu’au moins un item owner visible existe ;
- mobile : Drawer seulement lorsque cette même navigation visible existe ;
- une sidebar ou un Drawer vide est un bug de shell et doit être omis ;
- le focus revient au déclencheur de navigation mobile après fermeture du Drawer ;
- les badges sont présentation-only et jamais une autorisation.

Lorsqu’aucune contribution sidebar ne reste visible après filtrage par capability, disponibilité et surface, le contenu occupe toute la largeur sous la rangée module selector/topbar. Koali ne réserve pas une colonne de navigation vide de 256 px.

Une application hébergée ou standalone peut garder sa navigation interne dans sa surface propriétaire. La sidebar Koali ne doit pas reproduire toute la navigation interne de l’application.
