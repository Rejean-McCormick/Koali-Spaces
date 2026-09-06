# Restauration d’état de navigation

**Classe : Normatif**

Koali peut mémoriser : dernier module, dernière route sûre par module, expansion de sidebar, mode framed/immersive lorsque la décision de persistance est prise, langue et préférences de présentation.

Une restauration est conditionnelle : si la route n’est plus admise, disponible ou compatible, Koali choisit le safe fallback et explique l’écart.

Ne jamais restaurer une action en cours comme si elle avait réussi.
