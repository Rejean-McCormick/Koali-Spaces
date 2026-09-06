# Runtime smoke test

**Classe : Cible de qualification**

Pseudo-flow :

```text
build dist/runtime
spawn pnpm start with test port
wait HTTP ready
GET /
GET /tasks
GET /settings
GET /health
assert expected status/body shell
terminate
assert clean exit
```

Sous Linux, une variante doit aussi vérifier le control socket. Sous Windows, le smoke de présentation reste valide même si le control socket est désactivé.
