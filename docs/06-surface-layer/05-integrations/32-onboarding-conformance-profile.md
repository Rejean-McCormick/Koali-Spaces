# 32. Application Conformance Profile

Une application complète ne peut pas être onboardée uniquement avec :

```text
moduleId + URL
```

Elle doit fournir un `ApplicationConformanceProfile` validé.

Le profil couvre au minimum :

```text
owner + owner UI boundary
runtime registration reference
transport requirements
embed headers / frame compatibility
authentication boundary
initial deep-link behavior
router ownership
browser permissions
storage/service worker constraints
offline behavior
health/readiness
lifecycle owner/broker
known limitations
conformance evidence
```

Le schéma de base est :

```text
schemas/application-conformance-profile.schema.json
```

`LOCK-KS-SURF-153` — **Toute `local_module_surface` onboardée pour une baseline de production doit posséder un Application Conformance Profile validé ; une URL fonctionnelle seule ne constitue pas une intégration conforme.**
