# Localisation

**Classe : Normatif**

Locales locales initiales : `fr-CA` et `en`.

Priorité de résolution recommandée :

```text
label_key -> bundle locale module/Koali -> fallback default label
```

Les IDs restent non localisés. Les routes ne sont pas renommées par traduction.

Le code actuel possède déjà des bundles sous `public/localization/` mais ne résout pas encore systématiquement `label_key`; cette intégration est une priorité de développement.
