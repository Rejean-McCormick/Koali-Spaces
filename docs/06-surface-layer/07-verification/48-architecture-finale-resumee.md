# 48. Architecture finale résumée v1.1

```text
                         kOA OWNERS
             authority / identity / lifecycle / policy
                              |
                       verified projections
                              |
              +---------------v----------------+
              | KOALI CONTROL SIDE (server)    |
              |                                |
              | active Space                   |
              | validated interface manifests  |
              | capability projection          |
              | RuntimeRegistration            |
              | SurfacePresentationPolicy      |
              | health/lifecycle/transport ref |
              | SurfaceResolutionService       |
              | ResolvedSurfaceInternal        |
              +---------------+----------------+
                              |
                    minimize / public projection
                              |
                 SurfaceDescriptorPublic
                              |
        ================= browser boundary =================
                              |
              +---------------v----------------+
              | KOALI RENDER SIDE              |
              | SurfaceRenderer                |
              |  |- local_shell_page           |
              |  |- registered_component       |
              |  `- local_module_surface       |
              |       `- ApplicationHost       |
              |          framed / immersive    |
              +---------------+----------------+
                              |
                    admitted embed boundary
                              |
                 +------------+------------+
                 |            |            |
             Konnaxion       Orgo        UCKK ...
             own UI          own UI      own UI
             own auth        own auth    own auth
             own data        own data    own data
             own router      own router  own router
```

Distinctions à préserver :

```text
presentation != authority
health != authorization
admitted != active
active != ready
ready != mounted
offline != unavailable
framed != owner UI rewrite
immersive != Browser Fullscreen
runtime registration != presentation policy
internal resolution != browser descriptor
context pack != hostable runtime
```
