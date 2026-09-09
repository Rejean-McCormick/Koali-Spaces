# Thèmes et assets

**Classe : Contrat + Normatif**

Le theme contract est presentation-only. Le design system courant utilise `koali.ant5`.

## Autorité d'apparence

L'apparence effective est résolue dans cet ordre :

1. defaults explicites de `appearance_policy` du Space ;
2. champs de compatibilité encore présents dans `appearance` ;
3. defaults sémantiques de l'`InterfaceTheme` actif ;
4. defaults Koali internes.

`appearance.density` est un champ de compatibilité : il reste accepté, mais une nouvelle définition de Space peut l'omettre afin d'hériter de `InterfaceTheme.tokens.density`.

Les couleurs d'accent sélectionnables sont définies une seule fois dans `interface/appearance/accent-palette.json`. Les schemas de Space et de préférences valident leur forme ; la validation runtime vérifie ensuite que chaque identifiant appartient au registre canonique. Un `InterfaceTheme` peut déclarer `tokens.primary_accent_id`; lorsqu'il est présent, sa couleur doit correspondre à la couleur canonique du registre.

Les préférences personnelles ne font jamais partie de l'activation du Space, de son receipt, des capabilities ou des manifests propriétaires.

## Tokens sémantiques

Après résolution light/dark et accent, Ant Design reste la source des couleurs sémantiques effectives. Koali ne maintient que des aliases CSS (`--koali-color-*`) alimentés à partir des tokens Ant pour les composants shell non-Ant. Les couleurs CSS statiques restantes servent uniquement de fallback de bootstrap avant hydratation.

Les bundles offline-capable doivent être locaux. Les manifests d’assets servent à établir l’inventaire de runtime local et la fermeture offline.

Cette documentation ne prescrit pas de mécanisme de checksum documentaire. Les digests présents dans les artifact contracts restent des mécanismes runtime d’intégrité d’artifacts et sont indépendants de l’organisation de cette documentation.
