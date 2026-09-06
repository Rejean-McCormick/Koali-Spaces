# Politique de dépendances

**Classe : Normatif**

Les dépendances Koali sont choisies pour sécurité, maintenance et compatibilité du repository, pas pour reproduire aveuglément les versions d’une application intégrée.

Le lockfile est régénéré délibérément lorsque `package.json` change. Installation de qualification : `pnpm install --frozen-lockfile`.

Les applications hébergées gardent leurs propres dependency graphs.
