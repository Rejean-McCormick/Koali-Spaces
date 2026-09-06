# Annexe A — Registre des locks

La v1.1 contient exactement :

```text
LOCK-KS-SURF-001 ... LOCK-KS-SURF-154
```

Les déclarations Markdown sont la source normative.

Projection machine-readable :

```text
locks/koali-surface-layer.lock.json
```

Le registre contient pour chaque lock :

```text
id
rule
lock_class
tier
source_document
source_line
statement_sha256
change_requires_adr
```

Ne pas maintenir une liste parallèle manuelle dans cette annexe.

Validation :

```text
node tools/validate-surface-spec.mjs
```
