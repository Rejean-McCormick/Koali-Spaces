# Space Definition

**Classe : Contrat + Normatif**

Le schéma local est `contracts/koa/space-definition.schema.json`.

Champs structurants :

- `space_id`, `title`, `version` ;
- `default_module_id` ;
- `module_instances[]` ;
- `global_topbar[]` ;
- `appearance` ;
- `offline_policy` ;
- `authority_boundary`.

Un `module_instance` peut adapter `public_label`, `public_icon_ref`, `home_route_override`, `order`, `enabled`, `required`.

`authority_boundary` doit confirmer que le Space est presentation-only, ne peut accorder de capability, ne transporte pas de business state et ne transporte pas d’extension exécutable.
