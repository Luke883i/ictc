# ICTC — Integrated Compliance Tower Control

ICTC è una web application locale, proof-oriented e anti-overclaim per due attività aziendali:

1. mantenere sotto osservazione il quadro normativo cogente rilevante per sicurezza delle informazioni e privacy;
2. gestire segnalazioni, quasi incidenti e incidenti con owner, RACI, decisioni umane e ricevute verificabili.

La repository contiene una **beta tecnica eseguibile** con Node.js e senza dipendenze runtime esterne.

## Cosa dimostra la beta

ICTC può attestare operazioni locali come acquisizioni, differenze osservate, review registrate, responsabilità confermate e integrità della catena degli eventi. Non dichiara automaticamente:

- completezza del perimetro normativo;
- applicabilità legale;
- conformità dell'organizzazione;
- efficacia di un controllo;
- notificabilità di un incidente.

Ogni elemento visibile deriva da un `OutcomeEnvelope` che espone stato epistemico, produttore, input, limiti, timestamp, prossima azione e receipt quando disponibile.

## Avvio rapido

### Requisiti

- Node.js 22 o successivo;
- npm 10 o successivo;
- Git per il workflow di sviluppo;
- `curl` per health check e launcher.

### Un solo comando

```bash
./ictc.sh start
```

Il comando:

1. verifica ambiente e dipendenze;
2. prepara la SOT locale in `runtime/`;
3. avvia il server in background;
4. attende il superamento dell'health check;
5. apre `http://127.0.0.1:4173` quando l'ambiente desktop lo consente;
6. salva PID e log in `.ictc/`.

In un server o container senza desktop:

```bash
./ictc.sh start --no-open
```

Per arrestare:

```bash
./ictc.sh stop
```

### Avvio tradizionale

```bash
npm ci
npm test
npm start
```

Aprire `http://127.0.0.1:4173`.

## Comandi principali

| Comando | Scopo |
|---|---|
| `./ictc.sh start` | Preflight, avvio, health check e apertura browser |
| `./ictc.sh stop` | Arresta il processo gestito dal launcher |
| `./ictc.sh status` | Mostra processo, health e integrità ledger |
| `./ictc.sh logs` | Segue il log locale |
| `./ictc.sh doctor` | Mostra configurazione e prerequisiti |
| `./ictc.sh test` | Esegue la suite funzionale |
| `./ictc.sh audit` | Esegue test, audit runtime, accessibilità e documentazione |
| `npm start` | Avvia applicazione e API in primo piano |
| `npm test` | Esegue la suite contrattuale ed E2E |
| `npm run audit:runtime` | Dimostra persistenza, readback, receipt e restart |
| `npm run audit:a11y` | Verifica la baseline di accessibilità |
| `npm run audit:docs` | Verifica link, comandi e runbook |
| `npm run visual` | Produce l'attestazione visuale; dichiara il fallback quando il browser non è disponibile |
| `npm run git:handshake` | Verifica il set di file trasferibile |

## Configurazione rapida

```bash
ICTC_PORT=4300 ./ictc.sh start
ICTC_RUNTIME_DIR=/percorso/isolato ./ictc.sh start
ICTC_NO_OPEN=1 ./ictc.sh start
```

Il bind predefinito è `127.0.0.1`. Non esporre la beta direttamente su una rete aziendale.

## Architettura essenziale

```text
Browser UI
   ↓ HTTP JSON
Node.js service
   ↓ funzioni di dominio
append-only ledger + blob locali
   ↓ proiezione ricostruibile
OutcomeEnvelope
   ↓
UI, tracce ASCII e assistente locale read-only
```

La UI non legge direttamente lo storage. Le scritture critiche sono persistite, rilette e collegate a una receipt. L'assistente è session-scoped e non possiede capacità autonome di scrittura.

Vedere [Architettura](docs/11_ARCHITECTURE.md), [Contratto epistemico](docs/02_EPISTEMIC_CONTRACT.md), [Dati e storage](docs/DATA_AND_STORAGE.md) e [Audit runtime](docs/RUNTIME_AUDIT.md).

## Mappa della repository

| Percorso | Contenuto |
|---|---|
| `app/` | UI web e design system |
| `lib/` | Modello di dominio e proiezioni |
| `server.mjs` | API e server applicativo |
| `schemas/` | Contratti JSON Schema |
| `data/` | Seed dimostrativi versionati |
| `runtime/` | SOT locale non versionata |
| `scripts/` | Validator, audit, E2E e manifest |
| `docs/` | Documentazione di prodotto e ingegneria |
| `.github/` | CI, security, template e ownership |
| `.ictc/` | PID, log e stato operativo del launcher; non versionato |

## Percorso per nuovi contributori

1. [AGENTS.md](AGENTS.md)
2. [Guida allo sviluppo](docs/DEVELOPMENT.md)
3. [Mappa documentale](docs/README.md)
4. [Contratto epistemico](docs/02_EPISTEMIC_CONTRACT.md)
5. [User journey](docs/04_USER_JOURNEYS.md)
6. [Definition of Done](docs/14_ITERATION_DOD.md)
7. [Testing](docs/TESTING.md)
8. [Accessibilità](docs/ACCESSIBILITY.md)

## Stato del progetto

- stadio: beta tecnica locale;
- deployment supportato: workstation o ambiente di prova isolato;
- funzionanti: dashboard, fonti, review, scouting simulato, eventi, owner/RACI, assistente locale, ledger e receipt;
- parziali: workflow incidenti oltre l'assegnazione iniziale, gestione documentale, browser visual test in ambienti con policy restrittive;
- non implementati: autenticazione enterprise, autorizzazione granulare, multi-tenancy, scheduler persistente, malware scanning e storage distribuito;
- uso in produzione: non supportato senza hardening, threat assessment e deployment review.

La roadmap è in [docs/ROADMAP.md](docs/ROADMAP.md).

## Contribuire, supporto e sicurezza

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [SUPPORT.md](SUPPORT.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Licenza

Uso proprietario. Vedere [LICENSE.md](LICENSE.md).
