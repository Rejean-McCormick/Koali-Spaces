# 17. Lifecycle et activation

La surface présentée doit provenir d'un état activé compatible.

Cycle conceptuel :

```text
manifest received
  -> schema validate
  -> module identity resolve
  -> route namespace validate
  -> capabilities resolve
  -> local surface registration resolve
  -> offline declaration validate
  -> stage
  -> activate atomically
  -> receipt
```

En cas d'échec :

```text
candidate remains inactive
previous compatible presentation remains active
or module becomes explicitly unavailable
```

`LOCK-KS-SURF-063` — **Pas d'activation partielle d'une configuration de Space ou d'interface.**

`LOCK-KS-SURF-064` — **Un manifest incompatible n'est pas “best-effort patched” au runtime.** Il est rejeté ou reste inactif.

`LOCK-KS-SURF-065` — **Le retrait de Koali Spaces n'efface ni ne réécrit l'état métier des applications propriétaires.**

`LOCK-KS-SURF-066` — **La désactivation d'une surface est un événement de présentation ; elle ne désactive pas automatiquement l'autorité ou les données du système propriétaire.**

---
