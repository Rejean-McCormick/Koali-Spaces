# Migration v1.0 → v1.1

La v1.1 est un durcissement compatible avec l’intention de la v1.0, mais plusieurs concepts de code doivent être renommés ou séparés avant implémentation.

## 1. `ResolvedSurface` devient deux objets

Ancien concept :

```text
ResolvedSurface
```

Nouveau modèle :

```text
ResolvedSurfaceInternal   # server-only
        |
        v
SurfaceDescriptorPublic   # navigateur
```

Le navigateur ne reçoit pas `runtimeRef`, endpoint privilégié, secret, path opérateur ou détail de lifecycle inutile.

## 2. `ApplicationHost` perd la résolution runtime

Retirer de sa responsabilité :

```text
résoudre runtimeRef
choisir host/port
découvrir un service
démarrer un service
```

Il reçoit un descriptor public déjà résolu.

## 3. `LocalSurfaceRegistration` est scindé

```text
RuntimeRegistration
SurfacePresentationPolicy
```

Le premier décrit l’intégration technique. Le second décrit uniquement l’expérience Koali.

## 4. `SurfaceRuntimeState` est remplacé

Ancien :

```text
ready | degraded | offline | blocked | ...
```

Nouveau :

```text
access
runtime
connectivity
render
```

Une surface peut donc être simultanément `allowed`, `ready`, `offline` et `ready` côté rendu.

## 5. Lifecycle

Le renderer ne doit pas appeler directement :

```text
spawn
docker
docker compose
systemctl
service manager
privileged agent endpoint arbitraire
```

Toute activation nécessaire passe par le propriétaire/broker lifecycle déclaré.

## 6. Transport

Ne pas coder une hypothèse globale `iframe localhost` ou `same-origin proxy`. Le code doit dépendre d’un transport profile résolu côté serveur.

## 7. Validation documentaire

Avant merge :

```text
node tools/validate-surface-spec.mjs
```

Une divergence entre Markdown, lock registry, source registry, index ou manifest bloque la baseline.
