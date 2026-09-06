# 14. Propriété du routing et synchronisation

Koali possède :

```text
module selection
outer namespace
route contribution admission
initial deep-link mapping
return to Koali
```

L'application enfant possède ensuite son router interne.

MVP :

```text
/apps/konnaxion/<declared-deep-link>
    -> initial path transmis à Konnaxion
    -> navigation interne ultérieure gérée par Konnaxion
```

Une synchronisation plus riche peut exister plus tard uniquement par protocole versionné et opt-in.

`LOCK-KS-SURF-146` — **Après le deep link initial, le router interne de l'application propriétaire reste son autorité de navigation sauf bridge versionné explicitement négocié.**

`LOCK-KS-SURF-147` — **Koali ne synchronise pas silencieusement son URL avec le router enfant par inspection DOM, interception non déclarée ou heuristique de navigation.**
