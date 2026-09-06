# Top-bar widgets

**Classe : Contrat + Normatif**

Kinds : `action`, `status`, `counter`, `search`, `menu`, `resume`.

Slots : `primary`, `secondary`, `status`, `overflow`.

Activations : route, command reference, status provider ou none.

Un widget est compact. Il ne doit pas contenir une application complète. Un command widget ne signifie pas que Koali exécute directement une action privilégiée : le command ref doit pointer vers une interface propriétaire admise.

La version actuelle implémente principalement les activations de route et l’affichage status simple. Les autres kinds sont cibles de développement.
