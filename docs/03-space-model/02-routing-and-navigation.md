# Routes et navigation

**Classe : Normatif**

Chaque route possède `route_id`, `module_id`, `path`, `page_ref`, label, availability, offline behavior, deep-link policy, aliases, safe fallback et capability policy.

Règles :

- pas de collision de path/alias ;
- pas de path distant ;
- route stable malgré localisation ;
- deep link contrôlé indépendamment du menu ;
- safe fallback explicite ;
- le module propriétaire conserve ses routes internes lorsqu’il est hébergé comme application complète.

Le route composer choisit le match le plus spécifique et ne transforme pas la visibilité en autorisation.
