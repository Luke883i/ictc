# ICTC — Integrated Compliance Tower Control

ICTC v1 registra fonti, differenze, decisioni e casi mantenendo separati osservazione, proposta automatica, review umana e prova tecnica.

ICTC attesta operazioni locali, persistenza e integrità tecnica. Non determina automaticamente completezza del perimetro, applicabilità legale, conformità, efficacia dei controlli o obblighi di notifica.

## Versione corrente: ICTC 1.0.0

La v1 è stabile nello scope locale e single-user dichiarato. L’attestazione è ingegneristica interna, non una certificazione di terza parte.

## Avvio rapido

Per l’uso quotidiano basta:

```bash
./ictc.sh start
```

`./ictc.sh status` verifica lo stato ma non è necessario per l’avvio.

Alla prima installazione, o quando cambia `package-lock.json`, eseguire prima:

```bash
npm ci --ignore-scripts
```

Comandi operativi:

```bash
./ictc.sh status
./ictc.sh logs
./ictc.sh audit
./ictc.sh stop
```

`npm start` avvia lo stesso runtime in foreground. Il runtime storico v2 resta disponibile con `./ictc.sh start --profile v2`.

## Scope stabile

- loopback locale o Codespace con porta privata;
- singolo operatore;
- contenuti tramite link o testo;
- scheduler locale con configurazione persistita nel ledger;
- acquisizione remota e studio AI soltanto quando configurati esplicitamente;
- review umana di fonti e differenze;
- decisione di impatto e collegamento a controlli;
- incidenti e quasi incidenti dalla segnalazione alle lezioni apprese;
- contesti operativi per azienda, ente pubblico e impresa regolamentata;
- ledger append-only, blob testuali, ricevute e ricostruzione;
- assistente locale read-only.

## Interfaccia

La navigazione primaria contiene due sole aree.

### Monitoraggio normativo

Due ingressi producono lo stesso reticolo verificabile:

```text
monitoraggio programmato → fonte → differenza → decisione → controllo
contenuto dell’utente   → fonte → differenza → decisione → controllo
```

Un monitoraggio conserva URL, frequenza, prossima esecuzione e domanda di studio. Quando acquisizione remota e provider AI sono configurati, ICTC salva il contenuto osservato come blob, calcola il digest, confronta la baseline e chiede all’AI una proposta delimitata. Senza provider AI registra il confronto e mostra esplicitamente che lo studio non è disponibile. La rilevanza resta sempre una decisione umana.

### Incidenti e quasi incidenti

```text
segnalazione → responsabilità → triage → risposta → ripristino → lezioni
```

Ogni fase richiede evidenze strutturate, produce una ricevuta e aggiorna la cronologia. Il processo supporta la gestione operativa; non determina automaticamente qualificazione normativa, obblighi di notifica o rischio residuo.

Ogni area mostra una sola prossima azione. Origine, limiti, identificativi e prova tecnica restano nel dettaglio. I contesti operativi non creano nuove aree: qualificano organizzazione, owner e perimetro senza attribuire autorizzazioni o applicabilità.

## Configurazione opzionale del monitoraggio

```bash
ICTC_MONITORING_REMOTE=1
ICTC_AI_ENDPOINT=https://provider.example/v1/chat/completions
ICTC_AI_MODEL=model-name
ICTC_AI_API_KEY=...
./ictc.sh start
```

Il monitoraggio remoto applica vincoli anti-SSRF, timeout, limite dimensionale e rifiuto degli host privati per default. Configurazioni esterne devono essere valutate nel contesto operativo dell’organizzazione.

## Guardrail v1

- bind non-loopback rifiutato per default;
- upload binari disabilitati finché non esiste quarantena e scansione;
- `/api/release` espone scope, esclusioni e readiness;
- `/api/health` espone versione, scheduler, acquisizione remota e disponibilità AI;
- una ricevuta prova una scrittura locale, non la verità del contenuto.

Gli override `ICTC_ALLOW_UNAUTHENTICATED_BIND=1`, `ICTC_ALLOW_PRIVATE_MONITORING=1` e `ICTC_ENABLE_UNSCANNED_UPLOADS=1` richiedono accettazione esplicita del rischio.

## Verifica della release

```bash
npm run release:check
npm run audit:ux:core
```

Con runtime e provider di test attivi:

```bash
ICTC_BASE_URL=http://127.0.0.1:4807 \
ICTC_MOCK_URL=http://127.0.0.1:4899 \
node v3/journey-runtime-check.mjs

ICTC_BASE_URL=http://127.0.0.1:4807 \
python3 v3/journey-browser-check.py
```

La saturazione UI usa `M=40 → M+100=140` senza nuove primitive dopo M nello scope simulato.

## Documentazione v1

- [Audit del testo end-user](docs/CORE_UI_COPY_AUDIT.md)
- [Design delle due aree](docs/CORE_UI_DESIGN.md)
- [Definition of Done UI](docs/CORE_UI_DOD.md)
- [Audit buyer e differenziazione](docs/V1_BUYER_AUDIT.md)
- [Definition of Done v1](docs/V1_STABILITY_DOD.md)
- [Registro dei gap](docs/GAP_REGISTER.md)
- [Profili di esecuzione](docs/RUN_PROFILES.md)
- [GitHub Codespaces](docs/CODESPACES.md)

## Fuori scope

Non sono implementati OIDC/RBAC, multi-tenancy, malware scanning, crawling gestito su larga scala, scheduler ad alta disponibilità, storage distribuito o telemetria centralizzata. Non esporre ICTC come servizio aziendale multiutente senza completare questi controlli.
