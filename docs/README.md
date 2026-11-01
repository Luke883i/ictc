# Documentazione ICTC — indice per esigenza

Questa pagina è un **indice subordinato**. Per decidere quale documento sia corrente usa [START_HERE](START_HERE.md), il [manifest](documentation-manifest.json) e la [matrice delle autorità](authority-matrix.yaml). La presenza di un link non assegna autorità né rende eliminabile una risorsa senza link.

## Tre domande di primo ingresso

Il [README root](../README.md) dà identità e avvio, questa pagina instrada verso gli owner. **Prodotto** = scopo e use case; **Software** = codice, dati, API e operazioni; **Repository** = ownership, test, CI e governance. Si può seguire questo indice **senza leggere AGENTS.md, prompt o genealogia AI**. Il [manifest](documentation-manifest.json) registra il sottoinsieme normato, non l'intero archivio Markdown: non registrato non significa eliminabile.

## Capire il prodotto

- [PRODUCT](PRODUCT.md) — identità, sette processi, placeholder e limiti (autorità corrente).
- [Epistemic contract](02_EPISTEMIC_CONTRACT.md) — differenze fra registrazione, decisione, evidenza e conclusione.
- [User journeys](04_USER_JOURNEYS.md) e [End-user language](03_ENDUSER_LANGUAGE.md) — percorsi e linguaggio user-facing.

## Ricostruire software e infrastruttura

- [REPOSITORY_ATLAS](REPOSITORY_ATLAS.md) — come leggere codice, PR, contratti, prove e storia.
- [ARCHITECTURE AS-IS](11_ARCHITECTURE.md) — componenti, confini, persistenza e runtime.
- [DATA_AND_STORAGE](DATA_AND_STORAGE.md), [CONFIGURATION](CONFIGURATION.md), [RUN_PROFILES](RUN_PROFILES.md) — dati, directory effettive e profili.
- [OpenAPI](openapi.yaml) — contratto delle interfacce; verificare sempre il percorso handler eseguibile.

## Avviare, testare, sviluppare

- [OPERATIONS](OPERATIONS.md) — lifecycle locale, health, recovery e limiti.
- [TESTING](TESTING.md), [DEVELOPMENT](DEVELOPMENT.md) — falsificatori, CI, PR e debito probatorio.
- [DOCUMENTATION_STANDARD](DOCUMENTATION_STANDARD.md) — lifecycle, mode, link e condizione di ritiro lossless.
- [RELEASE](RELEASE.md), [GAP_REGISTER](GAP_REGISTER.md) — criteri di accettazione e prove esterne ancora mancanti.

## Genealogia e input storici (non authority current)

I seguenti documenti restano **fonti storiche, di ricerca o di design precedenti**; leggere il [manifest](documentation-manifest.json) per la classificazione registrata e non inferirla dalla data o dal titolo. Non vanno usati da soli come descrizione dell'AS-IS:

- [Modello object-focused](OBJECT_FOCUSED_ACTION_MODEL.md), [UX TO-BE v3](UX_TO_BE_V3.md), [Design System v3](DESIGN_SYSTEM_V3.md).
- [Audit PR 1–3](POST_MERGE_AUDIT_PR1_PR3.md), [Journey audit v4](USER_JOURNEY_AUDIT_V4.md), [Runtime audit v2](RUNTIME_AUDIT.md).
- [Chiarezza onto-epistemica](ONTO_EPISTEMIC_CLARITY_V3.md), [End-user simulations](ENDUSER_SIMULATIONS_V3.md), [Saturazione M+100](SATURATION_M_PLUS_100.md).
- [Runtime/wiring v3](RUNTIME_AND_WIRING_V3.md), [Object ActionFrame](OBJECT_FOCUSED_ACTION_MODEL.md).

Le pagine storiche **non vengono eliminate** con questa risistemazione: il loro ruolo va verificato attraverso PR, entrypoint eseguibili e prove di non-uso. Un file non registrato nel manifest non è automaticamente obsoleto.

## Altre risorse operative

- [ACCESSIBILITY](ACCESSIBILITY.md), [CODESPACES](CODESPACES.md), [Supporto](../SUPPORT.md), [Security](../SECURITY.md).
- Contratti machine-readable: `v3/public/epistemic-contract.json`, `v3/gaps.json`, `schemas/`, `v3/action-wiring.json`, `docs/ui-wiring-manifest.json`; i path esistenti non garantiscono che tutti rappresentino una current authority.
