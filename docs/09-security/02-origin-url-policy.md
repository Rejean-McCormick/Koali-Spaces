# Origin et URL policy

**Classe : Normatif**

Les routes shell sont locales. Les hrefs de navigation Koali doivent commencer par `/`, ne pas être protocol-relative, ne pas contenir d’userinfo et ne pas introduire de schéma distant.

Les origines d’applications complètes sont résolues à partir d’un registre runtime admis, jamais directement depuis un manifest utilisateur ou une URL fournie par le navigateur.

## Politique d’embed actuellement implémentée

La couche d’exécution accepte uniquement :

- une cible relative same-origin commençant par `/` ;
- `http://` ou `https://` sur `localhost` / `*.localhost` ;
- `http://` ou `https://` sur l’espace loopback IPv4 `127.0.0.0/8` ou IPv6 `::1` ;
- `http://` ou `https://` sur `koali.local` / `*.koali.local`.

Une origine Internet arbitraire, un schéma non HTTP(S), une URL avec userinfo, ou une base contenant query/fragment/traversal est rejetée fail-closed.

`KOALI_SPACES_FRAME_SRC` ne contourne pas cette règle. Il étend uniquement le CSP de build avec des origines locales qui passent la même famille de contrôles. Le descriptor public doit en plus provenir d’une résolution runtime serveur admise.

Pour une cible same-origin, la combinaison iframe `allow-scripts` + `allow-same-origin` est rejetée par le registre actuel afin d’éviter d’annuler pratiquement la frontière de sandbox.

Le choix final du profil de transport par application reste gouverné par `OPEN-KS-SURF-001` et un ADR. L’implémentation locale actuelle est une frontière de sécurité minimale ; elle ne transforme pas ce choix ouvert en décision d’architecture définitive.

## CSP/runtime alignment

Une cible absolue admise par `surface-runtime.json` doit aussi appartenir au `frame-src` construit via `KOALI_SPACES_FRAME_SRC`; sinon le navigateur la bloquera. Cette double admission est volontairement fail-closed. La topologie de transport finale reste régie par `OPEN-KS-SURF-001`.
