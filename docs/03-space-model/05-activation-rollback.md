# Activation, rollback et deactivation

**Classe : Normatif**

L’activation suit : validate -> resolve refs -> vérifier capabilities -> vérifier assets/offline -> produire état candidat -> bascule atomique -> receipt.

Le control server actuel implémente :

- `POST /space/activate` ;
- `POST /space/rollback` ;
- `POST /space/deactivate`.

Le state conserve une seule previous state pour rollback immédiat. Une stratégie plus riche peut être ajoutée côté owner sans transformer le shell en historique métier.

L’activation d’un Space ne démarre pas automatiquement les applications propriétaires sauf décision explicite via le lifecycle owner/broker.
