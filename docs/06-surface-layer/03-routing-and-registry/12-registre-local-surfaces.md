# 12. Registre runtime local

Un manifest de présentation ne contient pas une URL arbitraire donnant directement accès à un runtime.

Koali résout `moduleId -> runtime` depuis un **RuntimeRegistration** local et admis, consulté côté serveur.

Concept :

```ts
interface RuntimeRegistration {
  registrationId: string;
  moduleId: string;
  adapter: "web_app" | "registered_component" | "shell_page";
  artifactRef?: string;
  runtimeRef: string;
  healthRef?: string;
  lifecycleProfileRef?: string;
  transportProfileRef?: string;
  offlineClass: "local_required" | "local_optional" | "network_optional";
  embedPolicy: "required" | "supported" | "not_supported";
}
```

`runtimeRef`, `healthRef` et `lifecycleProfileRef` sont des références fermées du control side. Elles ne deviennent pas automatiquement des URL navigateur.

La présentation visuelle est définie séparément dans `SurfacePresentationPolicy`.

Implémentation Koali v1.1 : le registre est lu côté serveur depuis
`<KOALI_SPACES_STATE_ROOT>/surface-runtime.json`, ou depuis le chemin explicite
`KOALI_SPACES_SURFACE_REGISTRY`. Le fichier peut contenir des `resolvedTargets`
pré-résolues par le control side. Une target pré-résolue contient uniquement la base
d'embed et les contraintes navigateur nécessaires ; elle ne transforme pas
`transportProfileRef` en catalogue canonique de transport et ne ferme pas
`OPEN-KS-SURF-001`.

Le navigateur ne lit jamais ce registre directement. Il reçoit uniquement la projection
`SurfaceDescriptorPublic` produite après résolution et minimisation.

`LOCK-KS-SURF-044` — **Un module interface manifest ne peut pas introduire une origine HTTP arbitraire.**

`LOCK-KS-SURF-045` — **Les origines/targets exécutables sont enregistrées côté runtime opérateur.**

`LOCK-KS-SURF-046` — **Aucun secret ne doit être stocké dans une Space definition, un module interface manifest ou un registre de présentation consommable par le navigateur.**

`LOCK-KS-SURF-047` — **Le registre est local et allowlisté.** L'absence d'enregistrement rend la surface indisponible ; Koali ne fait pas de découverte réseau opportuniste.

`LOCK-KS-SURF-048` — **Une surface non enregistrée ne déclenche pas un fallback vers Internet.**
