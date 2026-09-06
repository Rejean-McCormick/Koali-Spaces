# 42. Validation de la spécification

La documentation de Surface Layer est elle-même un artifact à qualifier.

Commande :

```text
node tools/validate-surface-spec.mjs
```

Le validateur vérifie au minimum :

```text
JSON parse
LOCK IDs uniques
LOCK range contigu
Markdown lock source == generated lock registry
statement hashes
OPEN decision set
source pins uniqueness
DOC_INDEX coverage
required schemas present
required core documents present
```

`LOCK-KS-SURF-152` — **Dès que la v1.1 est intégrée au repository, `validate:surface-spec` doit faire partie de `QUALIFY ALL` et bloquer une baseline lorsque les locks, sources, index ou hashes divergent.**
