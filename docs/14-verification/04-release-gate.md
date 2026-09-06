# Release gate

**Classe : Normatif**

Une release Koali Spaces ne passe pas si : typecheck/test/build échoue, assets shell ne sont pas fermés localement, runtime standalone ne démarre pas, docs normatives et code ont une divergence non déclarée, ou Surface Layer security tests échouent.

Un child app non conforme peut rester non admis sans bloquer la release du shell s’il est optionnel.
