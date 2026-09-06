# 34. Kristal Farms

Kristal Farms possède une expérience Web propre orientée Showcase, Explorer et, à terme, Scenario Studio.

Koali peut héberger cette application comme `local_module_surface` lorsque son runtime UI est déployé et enregistré.

Koali ne doit pas :

- devenir la source de vérité géospatiale ;
- recopier PostGIS ou les datasets dans son propre store ;
- inventer de géométrie pour des preuves sans coordonnées ;
- convertir un scénario en observation ;
- transformer l'accent visuel Koali en statut d'évidence.

L'Application Conformance Profile doit porter les besoins MapLibre/WebGL, storage/cache, workers éventuels, fullscreen éventuel et comportement offline.
