# 33. Surface resolution algorithm

Pseudo-code normatif :

```text
resolveSurface(request):
  1. normalize moduleId
  2. reject reserved/invalid moduleId
  3. load active Space
  4. verify module is selected by active Space
  5. load active validated module interface manifest
  6. resolve declared route contribution
  7. resolve capability projection for presentation
  8. if denied -> return internal status access=blocked
  9. resolve surface kind
 10. if local_shell_page -> resolve closed shell page registry
 11. if registered_component_surface -> resolve closed component registry
 12. if local_module_surface:
       a. resolve RuntimeRegistration
       b. verify registration/module identity match
       c. resolve SurfacePresentationPolicy
       d. resolve transport profile server-side
       e. evaluate lifecycle/readiness
       f. evaluate connectivity/offline status
 13. build ResolvedSurfaceInternal
 14. minimize into SurfaceDescriptorPublic
 15. return public descriptor to render side
```

Si le runtime est `inactive` et qu'un lifecycle start est permis, cette opération est un workflow séparé du rendu et doit repasser par résolution/readiness avant montage.

`LOCK-KS-SURF-109` — **L'algorithme fail-closed sur les références inconnues.**

`LOCK-KS-SURF-110` — **Aucun “closest match”, fuzzy matching ou guess de module ID pour exécuter une surface.**

`LOCK-KS-SURF-111` — **Les aliases publics doivent être résolus vers un ID stable avant toute décision de target.**
