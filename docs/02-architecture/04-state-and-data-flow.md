# Flux d’état et de données

**Classe : Normatif**

Flux de shell :

```text
kOA -> control socket -> active-state.json -> /api/shell-state -> ShellProvider
                                                   |
                                                   v
                           registry/capability filters -> shell UI
```

Le state public contient :

- état de présentation ;
- network state ;
- Space actif ;
- thème actif ;
- manifests actifs ;
- module/route actifs ;
- capabilities projetées ;
- raison de dégradation.

Les champs internes précédés de `_` servent aux receipts/rollback et ne sont pas exposés au browser.

Le client actuel rafraîchit le shell state périodiquement. Une stratégie événementielle future peut remplacer le polling sans changer le modèle de propriété.
