# 7. Séparation control side / render side

La Surface Layer comporte deux plans techniques distincts.

## 7.1 Control side serveur

Le control side peut connaître :

```text
active Space
validated interface manifest
capability projection
runtime registration
artifact/admission reference
health reference
lifecycle profile
transport profile
operator-local topology
```

Il produit un résultat de résolution fermé.

## 7.2 Render side navigateur

Le render side reçoit uniquement ce qui est nécessaire pour afficher la surface :

```text
surface identity
public route identity
public presentation metadata
orthogonal public status
safe embed target
browser sandbox/permissions
optional versioned bridge ref
```

`LOCK-KS-SURF-134` — **La résolution de `runtimeRef`, origine opérateur, endpoint de health, lifecycle ou transport appartient au control side serveur ; le navigateur ne réalise pas cette résolution.**

`LOCK-KS-SURF-135` — **`ApplicationHost` consomme uniquement un `SurfaceDescriptorPublic` déjà résolu et ne consulte jamais directement le registre runtime opérateur.**

`LOCK-KS-SURF-136` — **Le descriptor navigateur ne doit contenir ni secret, ni credential, ni chemin opérateur privé, ni endpoint privilégié, ni information de contrôle inutile au rendu.**
