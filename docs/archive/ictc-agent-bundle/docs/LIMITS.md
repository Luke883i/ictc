# Limiti

- Il bundle non contiene il repository ICTC e richiede accesso a un checkout o a GitHub per osservare lo stato corrente.
- Il refresh locale non vede automaticamente status GitHub Actions, review o branch remoti non presenti nel checkout.
- Il catalogo test descrive comandi osservati, ma alcuni richiedono Node.js 22, Python, Playwright e Chromium.
- Il pre-commit prova blob, tree, scope e test; non prova correttezza legale o accettazione umana.
- Il successore materializzato e derivato e non diventa release ufficiale senza review e commit nel repository.
- L'algoritmo tree supporta repository Git SHA-1; i repository SHA-256 vengono bloccati esplicitamente.
- Nessun output del bundle autorizza esposizione multiutente o produzione enterprise.
