# Hébergement d’application

**Classe : Normatif**

Mode normal : application nested dans la main surface avec chrome Koali minimal. Mode immersive : Koali masque module selector/topbar/sidebar/padding pour donner le viewport à l’application, tout en gardant une sortie parent-owned.

Le child garde son shell interne. Koali ne tente pas de mapper chaque page interne dans sa sidebar.

L’ApplicationHost n’est pas un process manager et ne résout pas de runtime secret côté browser.
