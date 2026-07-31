# ICTC — Integrated Compliance Tower Control

ICTC è una web application locale, proof-oriented e anti-overclaim per due attività aziendali:

1. mantenere sotto osservazione il quadro normativo cogente rilevante per sicurezza delle informazioni e privacy;
2. gestire segnalazioni, quasi incidenti e incidenti con owner, RACI, decisioni umane e ricevute verificabili.

Questa repository contiene la **v2 epistemic beta**: una vertical slice eseguibile con Node.js, senza dipendenze runtime esterne.

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
- Git per il workflow di sviluppo.

```bash
npm ci
npm test
npm start
```

Aprire `http://127.0.0.1:4173`.

Per usare una porta diversa:

```bash
PORT=4300 npm start
```

## Comandi principali

| Comando | Scopo |
|---|---|
| `npm start` | Avvia applicazione e API locali |
| `npm test` | Esegue l'intera suite contrattuale ed E2E |
| `npm run contract` | Verifica la struttura minima della repository |
| `npm run schema:check` | Valida gli schemi JSON |
| `npm run labels:check` | Individua label end-user epistemicamente scorrette |
| `npm run epistemic:check` | Verifica gli invarianti degli `OutcomeEnvelope` |
| `npm run wiring:check` | Verifica che i controlli UI dichiarati siano collegati al runtime |
| `npm run e2e` | Esegue i percorsi HTTP end-to-end |
| `npm run visual` | Produce l'attestazione visuale |
| `npm run ascii:export` | Genera le tracce ASCII dal runtime |
| `npm run git:handshake` | Verifica il set di file trasferibile |
| `npm run release:manifest` | Genera il manifest SHA-256 della release |

## Architettura essenziale

```text
Browser UI
   ↓ API HTTP
Node.js service
   ↓ domain functions
append-only ledger + local blobs + derived projection
```

La UI non legge direttamente lo storage. Tutte le viste consumano oggetti derivati e tipizzati. L'assistente AI è session-scoped, read-only e non possiede capacità autonome di scrittura.

Vedere [Architettura](docs/11_ARCHITECTURE.md), [Contratto epistemico](docs/02_EPISTEMIC_CONTRACT.md) e [Dati e storage](docs/DATA_AND_STORAGE.md).

## Mappa della repository

| Percorso | Contenuto |
|---|---|
| `app/` | UI web statica e design system |
| `lib/` | Modello di dominio e proiezioni |
| `server.mjs` | API e server applicativo |
| `schemas/` | Contratti JSON Schema |
| `data/` | Seed dimostrativi versionati |
| `runtime/` | Stato locale non versionato |
| `scripts/` | Validator, E2E, manifest e controlli |
| `docs/` | Documentazione di prodotto e ingegneria |
| `.github/` | CI, security, template e ownership |

## Percorso per nuovi contributori

1. [AGENTS.md](AGENTS.md)
2. [Guida allo sviluppo](docs/DEVELOPMENT.md)
3. [Mappa documentale](docs/README.md)
4. [Contratto epistemico](docs/02_EPISTEMIC_CONTRACT.md)
5. [User journey](docs/04_USER_JOURNEYS.md)
6. [Definition of Done](docs/14_ITERATION_DOD.md)
7. [Testing](docs/TESTING.md)

## Stato del progetto

- Stadio: beta tecnica locale;
- deployment supportato: workstation o ambiente di prova isolato;
- autenticazione enterprise, multi-tenancy e persistenza distribuita: non ancora implementate;
- uso in produzione: richiede hardening, threat assessment, identity provider e deployment review.

La roadmap è in [docs/ROADMAP.md](docs/ROADMAP.md).

## Contribuire e sicurezza

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [SUPPORT.md](SUPPORT.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Licenza

Uso proprietario. Vedere [LICENSE.md](LICENSE.md).
