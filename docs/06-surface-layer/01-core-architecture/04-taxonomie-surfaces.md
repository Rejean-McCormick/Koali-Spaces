# 4. Taxonomie canonique des surfaces

La Surface Layer utilise exactement trois catégories de rendu de premier niveau.

```ts
type SurfaceKind =
  | "local_shell_page"
  | "registered_component_surface"
  | "local_module_surface";
```

## 4.1 `local_shell_page`

Page appartenant réellement à Koali Spaces.

Exemples actuels ou attendus :

- Home ;
- Search ;
- Tasks ;
- Health ;
- Offline ;
- Settings.

Le contenu et l'UI appartiennent à Koali Spaces.

## 4.2 `registered_component_surface`

Surface locale rendue par un composant explicitement enregistré et admis dans le runtime Koali.

Cas typiques :

- lecteur d'artefacts ;
- panneau de statut ;
- explorateur de Runtime Pack ;
- vue de documentation ;
- widget opérateur local ;
- surface de contenu qui ne possède pas une application Web autonome.

Cette surface MUST être identifiée par une clé de composant fermée. Elle MUST NOT charger un composant arbitraire par nom de fichier fourni dans un manifest.

## 4.3 `local_module_surface`

Application complète ou frontend propriétaire rendu dans la surface principale Koali.

Cas typiques :

- Konnaxion ;
- Orgo ;
- UCKK-Moodle ;
- SemantiK Architect ;
- Konnaxion Capsule Manager ;
- Kristal Farms lorsqu'un runtime correspondant est présent.

`LOCK-KS-SURF-012` — **La taxonomie de premier niveau est fermée à ces trois valeurs pour v1.** Ajouter un quatrième type exige un ADR.

`LOCK-KS-SURF-013` — **Un `local_module_surface` représente une application propriétaire, pas un ensemble de composants Koali.**

`LOCK-KS-SURF-014` — **Un `registered_component_surface` ne peut pas devenir un chargeur de code distant ou arbitraire.**

---
