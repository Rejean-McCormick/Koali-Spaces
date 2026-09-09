# Restauration d’état de navigation

**Classe : Normatif**

L’état de présentation Koali qui modifie l’intention de restauration doit être adressable sans devenir un état métier owner.

## Sélection de surface produit

Le paramètre réservé Koali est :

```text
ks_surface
```

Exemple :

```text
/apps/orgo/cases/123?ks_surface=my_work
```

Règles :

- `ks_surface` est une métadonnée de présentation possédée par Koali ;
- le chemin owner reste possédé par l’owner ;
- la surface demandée est filtrée par les surface profiles admis et les capabilities ;
- une surface inconnue, invalide ou devenue non admise retombe de façon déterministe vers la surface par défaut admise ;
- lorsque plusieurs surfaces sont admises, Koali canonicalise l’URL vers la surface effectivement résolue ;
- lorsqu’une seule surface est admise, une ancienne métadonnée `ks_surface` est retirée ;
- refresh, back/forward et bookmark restaurent donc l’intention de présentation ;
- cet état n’accorde aucune capability et ne contourne aucun runtime registry ;
- Koali n’invente pas d’état de query owner.

Koali peut séparément mémoriser le dernier module, la dernière route sûre par module, l’expansion de sidebar, le mode d’affichage lorsqu’une policy de persistance est acceptée, la langue et les préférences utilisateur de présentation. Toute restauration reste conditionnelle à l’admission et à la disponibilité présentes.

Ne jamais restaurer une action en cours comme si elle avait réussi.
