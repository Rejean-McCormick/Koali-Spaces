# 23. Modèle d'intégration des technologies fournies

Cette section classe les technologies, mais ne change aucune autorité propriétaire.

## 23.1 Applications Web directement hostables lorsque leur runtime est admis

### Konnaxion

- type cible : `local_module_surface` ;
- possède un frontend Next.js riche et un shell/navigation internes ;
- conserve sa session, ses routes, ses modules, ses APIs et ses permissions ;
- Koali n'importe pas les pages Konnaxion dans son propre code.

### Orgo

- type cible : `local_module_surface` ;
- possède un Web UI Next.js et un backend NestJS ;
- conserve son modèle Case/Task, ses workflows, sa RBAC et ses dashboards.

### SemantiK Architect

- type cible : `local_module_surface` ;
- possède un frontend Next.js séparé et un backend FastAPI ;
- conserve son registry de tools et ses workflows ;
- Koali ne transforme pas le renderer de surface en remote shell générique.

### UCKK-Moodle

- type cible : `local_module_surface` lorsque le campus est installé/accessible localement ;
- reste **self-standing** ;
- reste une plateforme externe à kOA-Linux au sens des contrats actuels ;
- sa présentation dans Koali ne crée pas une base de données, identité, autorité ou synchronisation communes.

### Konnaxion Capsule Manager

- type cible : `local_module_surface` dans un Space opérateur/local ;
- la GUI locale reste le contrôleur utilisateur du Manager ;
- Koali ne devient pas l'Agent privilégié ;
- toutes les actions privilégiées restent sur les routes/services allowlistés du Manager/Agent.

### Kristal Farms

- type cible : `local_module_surface` lorsqu'un runtime Web est disponible ;
- surfaces produit : Showcase, Explorer, Scenario Studio ;
- Koali ne devient pas le store spatial ni l'autorité de données.

## 23.2 Projets contract-first ou sans runtime UI figé dans les sources fournies

### XKaliber

- état documentaire : départ technologiquement agnostique ;
- MUST NOT recevoir un faux frontend inventé par Koali ;
- lorsqu'un runtime officiel existe, il pourra devenir `local_module_surface` ;
- avant cela, des surfaces documentaires ou d'exemple peuvent être `registered_component_surface` si explicitement développées et enregistrées.

### K-Port

- défini comme EkoH evidence gateway/application avec formulaires et workflows conceptuels ;
- la documentation fournie ne suffit pas à fixer un runtime technique complet ;
- MUST NOT être assimilé à un score EkoH ou réimplémenté comme logique de scoring dans Koali ;
- hostable comme `local_module_surface` lorsque son runtime officiel est présent.

### MediKristal

- état : early foundational architecture / research & prototyping ;
- MUST NOT être présenté comme système clinique validé ;
- un futur UI/runtime peut être hosté, mais Koali ne doit pas inventer une application clinique opérationnelle à partir des docs.

## 23.3 Engines, corpus, infrastructure ou assets

### Kristal Framework

- rôle principal : artefacts épistémiques, Exchange, Runtime Packs, validation, query/reader policies ;
- usage Koali typique : `registered_component_surface` pour lecteurs/explorateurs, ou `local_module_surface` seulement si un frontend officiel séparé est fourni ;
- Koali ne devient jamais le compilateur de vérité par le renderer.

### kOA Digital Ecosystem

- architecture et infrastructure contract-driven ;
- ce n'est pas automatiquement une application à iframe ;
- ses informations peuvent alimenter des pages shell ou composants enregistrés.

### UCKK Assets

- contenu/branding/cours/canon ;
- n'est pas un runtime applicatif par sa seule existence ;
- consommé par UCKK ou par des renderers explicitement définis.

### Freeze–Vote–Rebuild Operational Peace Framework

- corpus/framework documentaire ;
- n'est pas assimilé au VotingMachine / VM Engine ;
- peut être exposé via une surface de lecture explicitement développée ;
- Koali ne doit pas inventer un moteur de vote à partir du corpus.

## 23.4 Exclusions verrouillées

`LOCK-KS-SURF-079` — **Ame-Artificielle est hors scope de cette intégration.**

`LOCK-KS-SURF-080` — **VotingMachine / VM Engine est hors scope de cette intégration.**

`LOCK-KS-SURF-081` — **L'existence d'un context pack ne signifie pas automatiquement qu'il existe une application Web hostable.**

`LOCK-KS-SURF-082` — **Koali ne fabrique pas un runtime pour combler un manque documentaire.**

---

## v1.1 onboarding gate

Toute application complète utilise `05-integrations/32-onboarding-conformance-profile.md` avant admission dans une baseline de production. Le fait qu'un context pack décrive une application ne suffit pas à prouver qu'un runtime UI hostable est disponible.
