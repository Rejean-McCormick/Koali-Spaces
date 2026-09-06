# 2. Source normative unique et projections générées

La v1.0 contenait un risque classique de dérive : les règles existaient dans les chapitres Markdown et dans un registre JSON incomplet.

La v1.1 fixe une hiérarchie explicite.

## 2.1 Source des règles

La déclaration canonique d’un lock est une ligne de chapitre de cette forme :

```text
`LOCK-KS-SURF-NNN` — **règle normative**
```

Le couple canonique est :

```text
(lock_id, statement)
```

Le chemin du chapitre et la ligne sont des métadonnées de provenance.

`LOCK-KS-SURF-131` — **Les déclarations `LOCK-KS-SURF-*` des chapitres Markdown sont la source normative unique des règles de Surface Layer ; le registre JSON est une projection générée et ne peut pas diverger.**

## 2.2 Context packs pinnés

Les context packs externes qui fondent cette spécification sont enregistrés avec repository, commit source, hash du pack et date de génération.

`LOCK-KS-SURF-132` — **Toute source externe utilisée pour fixer une frontière ou une intégration de Surface Layer doit être pinnée dans `sources/SOURCES.lock.json` avant de devenir une base normative de développement.**

`LOCK-KS-SURF-133` — **Une nouvelle version d’un context pack ne modifie jamais silencieusement un lock existant ; elle déclenche une analyse d’impact et, si la règle change, le change control/ADR applicable.**

## 2.3 Fichiers générés

Les fichiers suivants sont des projections vérifiables :

```text
locks/koali-surface-layer.lock.json
DOC_INDEX.json
MANIFEST.sha256
```

Ils peuvent être reconstruits avec :

```text
node tools/rebuild-spec-indexes.mjs
```

Une modification manuelle de ces projections qui n’est pas reproductible depuis les chapitres et métadonnées de source est invalide.
