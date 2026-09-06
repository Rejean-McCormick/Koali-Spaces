# 40. Tests minimums obligatoires

## 40.1 Unit tests

- dispatch des trois `SurfaceKind` ;
- module unknown fail-closed ;
- route unknown fail-closed ;
- component registry closed ;
- local registration required ;
- alias -> stable module ID ;
- URL/path traversal rejection ;
- external origin rejection ;
- mode framed default ;
- immersive enter/exit ;
- changing module resets/isolates display state ;
- context accent doesn't affect authorization ;
- missing target renders unavailable ;
- blocked state distinct from unavailable.

## 40.2 Integration tests

- `/apps/[moduleId]/[[...route]]` resolves correct surface ;
- shell visible in framed ;
- shell absent in immersive ;
- return control visible in immersive ;
- no duplicate Koali page shell around module app content ;
- registered component cannot load unregistered code ;
- runtime target not exposed from manifest input ;
- capability denial blocks rendering ;
- health degradation is visible ;
- local assets only.

## 40.3 Security tests

- malicious module ID ;
- encoded traversal ;
- `javascript:` ;
- `data:` ;
- protocol-relative URL ;
- external redirect ;
- target with credentials ;
- iframe permission policy ;
- no secret in shell-state JSON ;
- no arbitrary origin in manifest-derived browser state.

## 40.4 Runtime tests

- validated registration accepted ;
- unknown runtime ref rejected ;
- missing runtime returns unavailable ;
- local service down does not substitute remote ;
- registration/module ID mismatch rejected ;
- activation atomicity preserved ;
- previous valid state retained on failed activation.

## 40.5 Accessibility tests

- iframe/title accessible ;
- immersive control keyboard reachable ;
- Return to Koali keyboard reachable ;
- context not color-only ;
- focus visible ;
- mobile drawer interaction unaffected in framed.

`LOCK-KS-SURF-123` — **La Surface Layer n'est pas acceptée avec seulement des tests de snapshot visuel.** Les invariants de sécurité, authority et resolution doivent être testés.

`LOCK-KS-SURF-124` — **Chaque nouveau type de target ou permission browser exige un test négatif.**

---

## v1.1 hardening additions

- public descriptor excludes runtimeRef/control endpoints;
- `access=blocked` prevents mount even with healthy runtime;
- lifecycle path proves no direct process/container/service-manager execution from renderer;
- transport profile is resolved server-side;
- child navigation is not scraped/synchronized implicitly;
- service-worker/storage/browser-permission policy is covered by onboarding profile;
- spec registry validation passes.
