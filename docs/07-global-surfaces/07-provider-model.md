# Provider model global

**Classe : Architecture cible**

Providers recommandés :

- SearchProvider ;
- TaskProvider ;
- StatusProvider ;
- CounterProvider ;
- ResumeProvider.

Chaque provider : identité stable, owner, capability requirements, offline behavior, staleness, bounded timeout et target routes déclarées.

Un provider de vue est non autoritatif. Il ne doit ni exécuter une transaction cross-owner ni cacher sa staleness.
