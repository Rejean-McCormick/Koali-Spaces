# 23. Frontière lifecycle / presentation

Sélectionner une application dans Koali ne donne pas au renderer une autorité de process management.

Si un runtime est installé mais inactif :

```text
user selects module
    |
    v
SurfaceResolutionService
    |
    +-- ready -> descriptor -> render
    |
    `-- inactive
          |
          v
 declared lifecycle capability?
          |
          v
 owner/broker lifecycle request
          |
       receipt/state
          |
       readiness
          |
          v
       descriptor -> render
```

Le broker concret appartient à l'architecture kOA applicable ; la Surface Layer n'invente pas ce propriétaire.

`LOCK-KS-SURF-139` — **La sélection ou navigation vers une surface ne lance jamais directement un processus privilégié depuis le renderer ou `ApplicationHost`.**

`LOCK-KS-SURF-140` — **Toute demande start/stop/restart/activate d'un runtime passe par un owner ou broker lifecycle déclaré ; la Surface Layer n'appelle pas directement Docker, systemd, un shell ou un service manager.**

`LOCK-KS-SURF-141` — **Artifact admis, manifest actif, runtime actif, runtime ready et surface montée sont des états distincts et ne doivent pas être confondus.**
