# Koali Spaces — Maturity Report
## Surface Layer v1.2.2 — Qualified Beta Baseline

**Report date:** 2026-09-06  
**Product:** Koali Spaces  
**Scope:** Generic Surface Layer and application-hosting foundation  
**Release status:** **BETA**  
**Qualification status:** **QUALIFIED BETA BASELINE**  
**Core maturity:** **M4 / 5**  
**Overall hosting maturity:** **M3 / 5**  
**Recommended Git tag:** `surface-layer-v1.2.2-beta.1`

---

## 1. Executive status

Koali Spaces now has a qualified generic Surface Layer capable of resolving, minimizing, rendering, and hosting admitted application surfaces while preserving the authority and routing ownership of each application owner.

The generic host foundation has passed the real repository validation, production build, runtime packaging, and packaged-runtime smoke gates. The implementation is therefore suitable to freeze as a **qualified beta baseline** and use for the first real owner-application onboarding.

This report intentionally does **not** classify the Surface Layer as stable or production-proven. The generic host has not yet been proven end-to-end with a real owner application such as Konnaxion, and several production integration decisions remain intentionally open.

### 1.1 Release interpretation

`v1.2.2-beta.1` means:

- the generic architecture is implemented and qualified;
- the codebase is build-clean and runtime-smoke-clean;
- the critical generic host boundaries have automated coverage;
- the baseline is suitable for real application pilot integration;
- API/contract adjustments may still be required when the first real application exposes integration requirements not reproducible with the fixture host;
- the release is **not** yet a stable ecosystem-hosting release.

### 1.2 Current maturity classification

| Area | Level | Status |
|---|---:|---|
| Documentation / anti-drift | M4 | Qualified |
| Core architecture | M4 | Qualified |
| Contracts and schemas | M4 | Qualified |
| Surface resolution | M4 | Qualified |
| Browser public projection | M4 | Qualified |
| Surface renderer | M4 | Qualified |
| ApplicationHost | M4 | Qualified |
| Framed / immersive UX | M4 | Qualified |
| Security boundaries | M4 | Qualified |
| Runtime packaging / startup | M4 | Qualified |
| Shell/global surfaces | M3 | Implemented and tested; real providers incomplete |
| Lifecycle broker integration | M2 | Boundary implemented; real broker wiring pending |
| Production transport profile | M2 | Abstraction implemented; final per-app decision pending |
| Real application onboarding | M1 | Generic support exists; first real owner app pending |
| Cross-application providers | M2 | Framework present; real owner-backed providers pending |
| Ecosystem production proof | M1 | Requires real application qualification and operating evidence |

### 1.3 Maturity scale

- **M0 — Absent:** no defined implementation.
- **M1 — Specified:** documented and contractually defined.
- **M2 — Implemented:** implementation exists but lacks complete qualification.
- **M3 — Tested:** implementation has automated and local integration coverage.
- **M4 — Qualified:** passes the real repository validation/build/package/runtime gates for its declared scope.
- **M5 — Production-proven:** exercised with real owner applications and sustained operational evidence across releases.

**Core Surface Layer maturity:** **M4 / 5**  
**Ecosystem integration maturity:** **M2 / 5**  
**Overall Koali Spaces hosting maturity:** **M3 / 5**

The release label remains **Beta** because maturity of the generic core and maturity of the real ecosystem integration are separate dimensions.

---

## 2. Real-repository qualification evidence

The following commands were executed successfully on the real Windows repository:

```powershell
pnpm run validate
pnpm run build
pnpm run smoke:runtime
```

### 2.1 Validation gate

`pnpm run validate` passed all chained gates:

- TypeScript typecheck: **PASS**
- Vitest test files: **8 / 8 PASS**
- Vitest assertions: **25 / 25 PASS**
- Node runtime tests: **27 / 27 PASS**
- Bundled contracts parse: **13 PASS**
- Surface Layer specification: **154 locks consistent**
- Public remote runtime assets check: **PASS**

### 2.2 Production build

Next.js 15.5.24 production build:

- compile: **PASS**
- lint/type validity: **PASS**
- page data collection: **PASS**
- static generation: **10 / 10 PASS**
- build trace collection: **PASS**
- page optimization: **PASS**
- shell asset manifest generation: **PASS**
- local runtime packaging: **PASS**
- runtime package closure validation: **PASS**

### 2.3 Packaged runtime smoke

The packaged production runtime successfully started on loopback and answered the runtime smoke check.

**Runtime startup gate:** **PASS**

### 2.4 Qualification conclusion

The generic Surface Layer is not merely specified or unit-tested. Its current implementation has been exercised through the actual repository toolchain through production build and packaged runtime startup.

This evidence justifies **M4 for the generic host core**. It does not, by itself, justify stable or M5 status for real multi-application hosting.

---

## 3. Qualified architectural capabilities

### 3.1 Surface taxonomy

The generic renderer supports the three canonical surface classes:

```text
local_shell_page
registered_component_surface
local_module_surface
```

`local_module_surface` is the full owner-application hosting path.

### 3.2 Surface resolution

Koali resolves a surface from admitted server-side state instead of constructing owner application URLs directly in the browser.

Resolution distinguishes:

```text
Space activation
module admission
route contribution
capability availability
access decision
runtime registration
runtime readiness
connectivity
render state
presentation policy
```

These axes remain orthogonal rather than being collapsed into one ambiguous `available` flag.

### 3.3 Server/browser boundary

Private control information remains server-side.

Browser-visible descriptors are minimized and do not expose unnecessary:

- internal runtime references;
- health-control references;
- lifecycle endpoints;
- credentials;
- secrets;
- arbitrary service-control information.

### 3.4 Namespaced owner routing

Owner applications retain their own internal route namespace beneath Koali's outer application path.

Example:

```text
/apps/konnaxion/ethikos/...
/apps/orgo/...
/apps/uckk/...
```

Multiple owner applications may legitimately own identical internal paths, including `/`, without colliding in Koali.

### 3.5 ApplicationHost

The ApplicationHost is qualified for the generic host path, including:

- browser loading state;
- ready/error transitions;
- iframe stability across framed/immersive transitions;
- semantic accent projection;
- framed mode;
- immersive mode;
- visible parent-owned return control;
- parent focus restoration;
- constrained iframe sandbox tokens;
- constrained browser permissions.

### 3.6 Authority boundary

Koali Spaces does not acquire business authority merely because it renders a route, status, widget, or application.

The generic implementation explicitly prevents or rejects:

- owner modules claiming Koali-owned `local_shell_page` surfaces;
- self-granting capability snapshots;
- renderer-side direct process control;
- implicit transport fallback;
- arbitrary external embed origins.

### 3.7 Runtime and lifecycle

The runtime model differentiates:

```text
artifact admitted
manifest active
runtime registered
runtime active
runtime ready
surface mounted
```

The current lifecycle adapter produces broker requests rather than directly invoking Docker, systemd, shell commands, or a service manager.

---

## 4. Security maturity

The following generic behaviors have automated coverage or qualification evidence:

- local-only embed origin validation;
- unsafe scheme rejection;
- credential-bearing URL rejection;
- encoded/path-traversal rejection;
- unsafe same-origin sandbox combination rejection;
- closed browser-permission token set;
- semantic accent token validation;
- no public remote runtime dependencies;
- public shell-state minimization;
- capability projection without authority grant;
- control/render separation;
- no direct renderer process authority.

### 4.1 Security status

**Generic host boundary:** **M4 — Qualified**  
**Real owner-app security integration:** **M1-M2 — Pending pilot evidence**

The Beta label remains appropriate because origin, cookie, storage, authentication, CSP, navigation, and lifecycle behavior still need to be validated against at least one real owner application.

---

## 5. Open decisions intentionally preserved

The following decisions remain open by design and must not be silently fixed during routine coding:

1. **Production transport profile** — exact strategy per hosted application.
2. **Global SSO** — whether Koali will provide a common authentication experience across owners.
3. **Parent/child bridge** — versioned `postMessage` protocol, if required.
4. **Accent palette** — final visual token catalog.
5. **Browser Fullscreen API** — separate from Koali immersive layout mode.
6. **Display-mode persistence** — whether framed/immersive preference persists across sessions.

These open decisions do not invalidate the **qualified Beta baseline**. They do prevent a claim that the ecosystem-hosting layer is final or production-complete.

---

## 6. Remaining implementation work

### P0 — First real application proof: Konnaxion

Konnaxion onboarding is the next engineering milestone and the principal gate between Beta and a stable Surface Layer release.

Required artifacts and evidence:

- `ApplicationConformanceProfile`;
- `RuntimeRegistration`;
- `SurfacePresentationPolicy`;
- concrete transport profile;
- health/readiness mapping;
- module interface manifest alignment;
- root route and deep-link routing;
- framed mode;
- immersive mode;
- reload/error behavior;
- local/offline behavior where applicable;
- owner authentication boundary;
- owner router preservation;
- CSP/frame compatibility;
- browser storage/cookie behavior where used;
- production build and packaged runtime qualification with Konnaxion configured.

### P1 — Real provider integration

Replace generic/test provider paths with real owner-backed projections for:

- global Search;
- global Tasks;
- status;
- counters;
- resume/continue actions.

Koali must consume declared projections and must not read owner databases directly.

### P1 — Lifecycle broker wiring

Connect the existing lifecycle request boundary to the applicable kOA owner/broker contract without granting direct process authority to the browser renderer.

### P1 — Production transport decision

Select and qualify the real transport profile for the pilot application. Candidate classes remain:

- registered local origin;
- same-origin gateway path;
- dedicated local application origin through a gateway.

### P2 — Additional owner applications

After Konnaxion proves the generic host, onboard applications individually rather than modifying the renderer for each one.

Candidate sequence:

1. Konnaxion
2. Orgo
3. UCKK-Moodle
4. SemantiK Architect
5. Kristal-related application surfaces
6. K-Port / XKaliber / EkoH where concrete runtimes exist
7. MediKristal only when a suitable real application/runtime exists

---

## 7. Beta release and Git tag decision

### 7.1 Recommended annotated Git tag

```text
surface-layer-v1.2.2-beta.1
```

### 7.2 Recommended tag message

```text
Koali Spaces Surface Layer v1.2.2 beta.1 — qualified generic application-host baseline
```

### 7.3 What the Beta tag certifies

The tag certifies:

- generic Surface Layer architecture implemented;
- real repository validation green;
- 25/25 frontend/unit assertions green;
- 27/27 runtime tests green;
- 13 contracts validated;
- 154 Surface Layer locks internally consistent;
- production Next.js build green;
- packaged runtime closure green;
- packaged runtime startup smoke green;
- generic Surface Renderer and ApplicationHost ready for a real pilot.

### 7.4 What the Beta tag does not certify

It does **not** certify:

- Konnaxion production onboarding;
- successful hosting of any real owner application;
- all Koali ecosystem applications integrated;
- final production transport choice;
- real lifecycle broker integration;
- global SSO;
- parent/child messaging bridge;
- production operational history;
- M5 production-proven maturity.

### 7.5 Why the stable tag is deferred

The stable tag:

```text
surface-layer-v1.2.2
```

is reserved until the first real application pilot demonstrates that the generic abstractions hold under real routing, authentication, origin, lifecycle, CSP, storage, failure, and recovery conditions.

---

## 8. Stable promotion gate

Promotion from:

```text
surface-layer-v1.2.2-beta.1
```

to:

```text
surface-layer-v1.2.2
```

requires, at minimum:

```text
generic Surface Layer qualification       PASS
real Konnaxion runtime registration       PASS
real transport profile                    PASS
health/readiness mapping                  PASS
root route                                PASS
deep links                                PASS
owner-router preservation                 PASS
framed mode                               PASS
immersive mode                            PASS
reload/recovery                           PASS
security/origin isolation                 PASS
CSP/frame compatibility                   PASS
authentication boundary                   PASS
o owner-authority leakage into Koali      PASS
production build                          PASS
packaged runtime closure                  PASS
packaged runtime smoke                    PASS
end-to-end onboarding tests               PASS
```

A stable tag must not be created merely because the generic fixture tests pass.

---

## 9. Git Beta baseline procedure

The Beta tag should point to a clean commit containing the Surface Layer v1.2.2 implementation and this maturity report.

Recommended sequence:

```powershell
git status

git add .
git commit -m "feat(surface-layer): qualify Koali Spaces generic host v1.2.2 beta"

git tag -a surface-layer-v1.2.2-beta.1 `
  -m "Koali Spaces Surface Layer v1.2.2 beta.1 — qualified generic application-host baseline"

git push origin main
git push origin surface-layer-v1.2.2-beta.1
```

Before tagging, `git status` should confirm that no unintended generated build artifacts such as `.next`, `dist`, or `tsconfig.tsbuildinfo` are staged.

---

## 10. Final maturity verdict

```text
KOALI SPACES
GENERIC SURFACE LAYER
IMPLEMENTATION: v1.2.2
RELEASE: beta.1

Architecture              M4  QUALIFIED
Contracts                 M4  QUALIFIED
Surface Resolution        M4  QUALIFIED
Public Projection         M4  QUALIFIED
Renderer                  M4  QUALIFIED
ApplicationHost           M4  QUALIFIED
Framed / Immersive        M4  QUALIFIED
Security Boundary         M4  QUALIFIED
Runtime Packaging         M4  QUALIFIED
Runtime Startup           M4  QUALIFIED
Global Providers          M2-M3
Lifecycle Integration     M2
Production Transport      M2
Real App Onboarding       M1
Ecosystem Proof           M1

CORE STATUS:              QUALIFIED BETA
RELEASE CHANNEL:          BETA
NEXT GATE:                KONNAXION PILOT
STABLE PROMOTION:         AFTER REAL APP E2E QUALIFICATION
TARGET AFTER PILOT:       M4 ECOSYSTEM HOSTING
TARGET AFTER OPERATIONS:  M5 PRODUCTION-PROVEN
```

## 11. Decision

**Decision:** freeze the generic Surface Layer implementation as **`v1.2.2-beta.1`**.

Do not create another cleanup-only revision. The next engineering milestone is a real Konnaxion onboarding against this Beta baseline.

Do not publish `surface-layer-v1.2.2` as the stable tag until the Konnaxion pilot satisfies the stable promotion gate defined above.
