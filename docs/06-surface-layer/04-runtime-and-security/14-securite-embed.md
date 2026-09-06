# 14. Sécurité de l'embed

Pour une application web hostée, les contrôles minimums sont :

- target local enregistré ;
- schéma autorisé ;
- host/port ou runtime ref allowlisté ;
- pas de userinfo dans URL ;
- pas de redirection ouverte ;
- pas de navigation externe implicite ;
- CSP Koali explicite ;
- `sandbox` iframe évalué par application ;
- permissions browser (`allow`) minimales ;
- pas de `allow-same-origin + allow-scripts` ajouté sans justification lorsque l'isolation dépend du sandbox ;
- pas de secrets dans URL ;
- pas de transfert automatique de token Koali.

`LOCK-KS-SURF-051` — **Koali ne partage pas automatiquement ses credentials avec l'application hostée.**

`LOCK-KS-SURF-052` — **Koali ne lit pas les cookies privés du module pour fabriquer une identité.**

`LOCK-KS-SURF-053` — **Koali ne réécrit pas les décisions d'autorisation du module.**

`LOCK-KS-SURF-054` — **Toute permission navigateur accordée à une iframe doit être déclarée et minimale.** Caméra, micro, clipboard, geolocation, fullscreen et autres permissions ne sont pas autorisées par défaut.

`LOCK-KS-SURF-055` — **Une redirection de la surface vers une origine non allowlistée doit être bloquée ou sortir explicitement du host dans un nouveau contexte contrôlé.**

---
