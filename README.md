# ICTC — Integrated Compliance Tower Control

ICTC è una beta locale proof-oriented per osservare fonti normative, gestire differenze, review, segnalazioni e incidenti mantenendo distinta ogni fase della catena epistemica.

ICTC attesta operazioni locali, persistenza, readback, decisioni registrate e integrità tecnica. Non determina automaticamente completezza del perimetro, applicabilità legale, conformità, efficacia dei controlli o obblighi di notifica.

## Versione corrente proposta: v3 Living Evidence Atlas

## Avvio rapido

```bash
./ictc.sh start
./ictc.sh status
./ictc.sh logs
./ictc.sh audit
./ictc.sh stop
```

`current` usa la v3. La v2 è disponibile solo tramite `./ictc.sh start --profile v2`; `--profile all` avvia entrambi con porte, PID, log e SOT separati.

Per compatibilità restano disponibili i comandi diretti storici:

```bash
./ictc-v3.sh start
./ictc-v3.sh status
./ictc-v3.sh logs
./ictc-v3.sh audit
./ictc-v3.sh stop
```

Il comando canonico per nuovi utenti è `ictc.sh`.

## Cosa si può usare nella v3

- Oggi con balloon runtime;
- Atlante con relazioni deterministiche e lista alternativa;
- percorsi guidati, change story e incident room;
- audit trail e receipt;
- guida epistemica con tre lenti: orientarsi, decidere, verificare;
- `ActionFrame` che rispondono a “che cosa devo fare qui?”;
- `DecisionCheckpoint` prima di ogni scrittura;
- support bundle sanitizzato dalla vista Sistema.

## Modello di interazione

```text
OutcomeEnvelope → ActionFrame → DecisionCheckpoint → azione wired → Receipt
```

L'`ActionFrame` è una guida deterministica e temporanea: non modifica stato o autorità. Il processo sottostante compare nel drill-down “Perché questa azione compare qui”. Il checkpoint mostra stato prima/dopo, conseguenza, limiti ed evidenza attesa.

## Confine epistemico

Ogni `OutcomeEnvelope` espone stato, produttore, input, limiti, prossima azione e receipt. ICTC non determina automaticamente completezza, applicabilità legale, conformità, efficacia dei controlli o obblighi di notifica.

## Verifica

```bash
npm ci --ignore-scripts
./ictc.sh audit
node v3/action-frame-audit.mjs
node v3/support-bundle-audit.mjs
```

Il registro machine-readable è `v3/gaps.json`. I gap critici residui — scansione dei file e identità/autorizzazione — restano visibili e impediscono l'uso enterprise.

## Documentazione v3

- [Modello UX object-focused](docs/OBJECT_FOCUSED_ACTION_MODEL.md)
- [Audit PR 1–3](docs/POST_MERGE_AUDIT_PR1_PR3.md)
- [Journey e audit onto-epistemico](docs/USER_JOURNEY_AUDIT_V4.md)
- [Profili di esecuzione](docs/RUN_PROFILES.md)
- [Registro dei gap](docs/GAP_REGISTER.md)
- [GitHub Codespaces](docs/CODESPACES.md)
- [Runtime e wiring](docs/RUNTIME_AND_WIRING_V3.md)
- [Design system](docs/DESIGN_SYSTEM_V3.md)

## Requisiti e sicurezza

Node.js 22+, `curl`, workstation, Codespace o ambiente di prova isolato. Non sono implementati autenticazione enterprise, multi-tenancy, scheduler persistente, fetcher istituzionali reali, malware scanning, storage distribuito o alta disponibilità.

Per sviluppo consultare [AGENTS.md](AGENTS.md), [CONTRIBUTING.md](CONTRIBUTING.md), [docs/README.md](docs/README.md), [SECURITY.md](SECURITY.md) e [SUPPORT.md](SUPPORT.md).
