# State store

**Classe : Référence d’implémentation**

State file par défaut : `/var/lib/koa/integrations/koa-spaces/active-state.json`.

Écriture : fichier temporaire puis rename atomique. Permissions visées : state privé local.

Le public state retire les champs internes : capability snapshot complète, asset manifests et previous rollback state.

Koali conserve du state de présentation uniquement. Aucun business state propriétaire ne doit être ajouté dans `active-state.json`.
