# Origin et URL policy

**Classe : Normatif**

Les routes shell sont locales. Les hrefs de navigation Koali doivent commencer par `/`, ne pas être protocol-relative et ne pas contenir d’URL scheme distante.

Les origines d’applications complètes sont résolues à partir d’un registre runtime admis, jamais directement depuis un manifest utilisateur.

Le choix final de transport par application reste gouverné par la Surface Layer et ses ADRs.
