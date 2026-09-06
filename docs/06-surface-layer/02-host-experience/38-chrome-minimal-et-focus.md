# 38. Chrome framed minimal et focus

Le framed mode doit rappeler visuellement que l’utilisateur est dans Koali sans créer un second shell lourd autour d’une application qui possède déjà sa navigation.

Profil recommandé :

```text
Koali module selector / shell global
+ accent de contexte
+ label accessible de l'application
+ contrôle Immersif
+ surface propriétaire
```

Éviter :

```text
Koali topbar
+ deuxième barre de titre Koali
+ navigation Koali dupliquée
+ topbar propriétaire
+ sidebar propriétaire
```

`LOCK-KS-SURF-148` — **Le chrome ajouté par Koali autour d'une application propriétaire en framed mode reste minimal et ne duplique pas sa navigation interne.**

Le contrôle parent de sortie immersive doit rester accessible même si le contenu enfant a des overlays ou un z-index élevé.

`LOCK-KS-SURF-149` — **L'entrée/sortie immersive doit préserver un focus clavier cohérent ; à la sortie, le focus revient au contrôle parent qui a initié le mode, et le contrôle de retour Koali reste opérable au-dessus de la surface enfant.**
