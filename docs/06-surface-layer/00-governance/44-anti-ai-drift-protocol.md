# 44. Anti-AI drift protocol

Toute IA travaillant sur cette couche MUST commencer par appliquer ce protocole.

## 44.1 Sources à charger

1. ce document ;
2. `koali-surface-layer.lock.json` ;
3. snapshot réel du code Koali ;
5. contrats hôtes kOA-Linux applicables à Koali Spaces ;
6. contrat du sous-système touché ;
7. documentation interne du sous-système si montée/fournie et conforme au pin ;
8. tests actuels.

## 44.2 Questions obligatoires avant génération

L'IA doit déterminer :

```text
- Quelle SurfaceKind est concernée ?
- Qui possède l'autorité métier ?
- Qui possède l'UI interne ?
- Est-ce une route shell, un composant enregistré ou une application complète ?
- La target runtime est-elle enregistrée côté serveur ?
- Le code concerné est-il control side ou render side ?
- Le navigateur reçoit-il seulement un SurfaceDescriptorPublic minimisé ?
- Le lifecycle doit-il être demandé à un owner/broker distinct ?
- Une capability de présentation est-elle requise ?
- La modification touche-t-elle un lock ?
- La modification exige-t-elle un ADR ?
- Le projet possède-t-il réellement un runtime UI, ou seulement de la documentation ?
- Le changement créerait-il une copie de business logic ?
```

## 44.3 Réponses IA interdites

Une IA MUST NOT proposer :

```text
"Rebuild Konnaxion pages directly in Koali"
"Copy Orgo Task/Case models into Koali"
"Use menu visibility as authorization"
"Put http://... arbitrary module URLs in the manifest"
"If local app is missing, fall back to its public website"
"Strip CSP/X-Frame-Options to make embedding work"
"Use one global Koali token inside every child app"
"Make UCKK an internal database/module because it is embedded"
"Merge Moodle and Koali auth automatically"
"Create a generic iframe for any URL"
"Load React components dynamically from manifest strings"
"Treat immersive as browser fullscreen without an ADR"
"Invent a XKaliber/K-Port/MediKristal runtime from documentation"
"Integrate Ame-Artificielle"
 "Integrate VotingMachine / VM Engine"
"Resolve runtimeRef or choose a host/port in ApplicationHost"
"Spawn Docker/systemd/processes from the browser renderer"
"Treat an admitted child app as a trusted Koali origin"
"Synchronize two routers invisibly by scraping child DOM" 
```

`LOCK-KS-SURF-128` — **Une IA doit citer les lock IDs affectés dans tout plan ou patch non trivial de Surface Layer.**

`LOCK-KS-SURF-129` — **Si une demande utilisateur contredit un lock, l'IA doit signaler le conflit avant de modifier le code, sauf si l'utilisateur demande explicitement de changer le lock et l'ADR.**

`LOCK-KS-SURF-130` — **Une IA ne peut pas créer un nouvel enum, surface kind, authority owner, SSO scheme ou transport standard en le présentant comme déjà canonique.**

---
