# Ajouter une application hébergée

**Classe : Procédure**

1. lire docs owner + boundary kOA ;
2. créer Application Conformance Profile ;
3. décider SurfaceKind = `local_module_surface` ;
4. enregistrer runtime/transport côté control side ;
5. déclarer presentation policy ;
6. définir entry route et route ownership ;
7. tester framing, CSP, auth, storage, popups, downloads, permissions ;
8. tester framed -> immersive -> framed sans remount destructif ;
9. tester unavailable/degraded ;
10. vérifier que Koali n’a pas copié de business logic.
