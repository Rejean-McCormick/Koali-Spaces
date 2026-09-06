# Tasks

**Classe : Cible produit**

Tasks est une work queue agrégée, pas un moteur de tâches.

Item minimal : `task_id`, owner, title, summary, status, priority, due time optionnel, target route, presentation badge.

L’exécution, l’autorisation et le changement de statut restent chez le propriétaire. Koali peut afficher « pending », « attention », « done » selon une projection ; il ne marque pas une tâche terminée localement sans receipt/owner response.
