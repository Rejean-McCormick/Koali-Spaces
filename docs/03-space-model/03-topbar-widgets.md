# Widgets de top bar

**Classe : Contrat + Normatif**

Kinds : `action`, `status`, `counter`, `search`, `menu`, `resume`.

Slots : `primary`, `secondary`, `status`, `overflow`.

## La donnée projetée et l’activation sont séparées

Un widget peut obtenir sa donnée de présentation via un `projection_ref` optionnel et définir indépendamment ce qui se produit lorsque l’utilisateur l’active.

```text
projection_ref -> source de la donnée de présentation
activation     -> route / command / none
```

Exemple :

```json
{
  "kind": "counter",
  "projection_ref": "orgo.attention",
  "activation": {
    "kind": "route",
    "route_id": "orgo.tasks"
  }
}
```

`status_provider` n’est plus un type d’activation. L’ownership du provider ne doit jamais être encodé comme un comportement de clic.

Les activations sont :

- `route` — navigation vers une route Koali/owner admise ;
- `command` — référence vers une frontière de commande owner admise ;
- `none` — widget d’affichage uniquement.

`counter` et `resume` exigent un `projection_ref` explicite. `status` peut rester statique lorsqu’il est réellement statique ; un status fourni par un provider utilise `projection_ref`.

Un widget reste compact. Il ne doit pas contenir une application complète. Un command widget ne signifie pas que Koali exécute directement une action privilégiée : la référence pointe vers une interface propriétaire admise.

Tant que le `GlobalProjectionRuntime` ne fournit pas la donnée typée, un widget lié à une projection reste absent plutôt que d’afficher une valeur inventée ou trompeuse.
