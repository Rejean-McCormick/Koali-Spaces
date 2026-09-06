# 37. Responsive behavior

Mode framed :

- desktop : sidebar fixe selon le shell existant ;
- mobile : drawer selon le shell existant ;
- application host prend l'espace restant ;
- aucune largeur fixe dépendante de Konnaxion ne doit être codée dans le host.

Mode immersive :

- surface prend `100dvw x 100dvh` conceptuellement ;
- utiliser les unités dynamiques viewport lorsque supportées pour réduire les problèmes de browser chrome mobile ;
- respecter safe areas si nécessaire ;
- le contrôle Retour à Koali doit rester accessible.

`LOCK-KS-SURF-118` — **Pas de dimensions codées pour une seule application.**

---
