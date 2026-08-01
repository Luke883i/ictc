# ICTC — Integrated Compliance Tower Control

ICTC v1 è una webapp proof-oriented per osservare fonti, qualificare differenze, registrare decisioni e gestire eventi mantenendo distinta ogni fase della catena epistemica.

ICTC attesta operazioni locali, persistenza, readback, decisioni registrate e integrità tecnica. Non determina automaticamente completezza del perimetro, applicabilità legale, conformità, efficacia dei controlli o obblighi di notifica.

## Versione corrente: ICTC 1.0.0

La v1 è **stabile nello scope locale e single-user dichiarato**. L'attestazione è ingegneristica interna: non è una certificazione di terza parte e non rende il prodotto enterprise-ready.

## Avvio rapido

```bash
npm ci --ignore-scripts
./ictc.sh start
./ictc.sh status
```

Anche `npm start` avvia il runtime canonico v1 in foreground.

```bash
./ictc.sh logs
./ictc.sh audit
./ictc.sh stop
```

Il runtime storico v2 resta disponibile soltanto con `./ictc.sh start --profile v2`; `--profile all` avvia v1 e v2 con porte, PID, log e SOT separati. L'alias `--profile v3` resta per compatibilità e indica la generazione tecnica del runtime corrente.

## Scope stabile

- loopback locale o Codespace con porta privata;
- singolo operatore;
- intake di fonti tramite link;
- review di fonti e finding;
- decisione di impatto e mapping astratto;
- segnalazioni, owner, RACI e transizioni;
- ledger append-only, receipt, readback e ricostruzione;
- AI locale read-only e senza write authority;
- `OutcomeEnvelope → ActionFrame → DecisionCheckpoint → azione wired → Receipt`.

## Guardrail v1

- un bind non-loopback privo di autenticazione viene rifiutato per default;
- gli upload binari sono disabilitati finché non esiste quarantena e scansione;
- `/api/release` espone scope, esclusioni, readiness e hash del manifest;
- `/api/health` espone versione e classe di stabilità;
- la vista **Sistema** mostra readiness, deployment e limiti.

Gli override `ICTC_ALLOW_UNAUTHENTICATED_BIND=1` e `ICTC_ENABLE_UNSCANNED_UPLOADS=1` portano il runtime fuori dallo scope stabile e richiedono accettazione esplicita del rischio.

## Differenziazione

ICTC non produce un compliance score. La differenza è la possibilità di ricostruire:

```text
osservazione → proposta → review → decisione → persistenza → receipt
```

Ogni superficie dichiara input, produttore, limiti e ciò che l'esito non prova. L'AI usa una capsula locale e non può scrivere o decidere.

## Verifica della release

```bash
npm run release:check
```

Il gate verifica suite storica, accessibilità, wiring, fixture blob, journey E2E, restart, safe bind, binary-upload policy, simulazioni buyer e saturazione `M=36 → M+100=136` senza nuova primitiva dopo M.

Artefatti principali:

- `artifacts/v1-stability-attestation.json`;
- `artifacts/v1-buyer-simulation.json`;
- `artifacts/v1-saturation.json`.

## Documentazione v1

- [Audit buyer e differenziazione](docs/V1_BUYER_AUDIT.md)
- [Definition of Done e checklist](docs/V1_STABILITY_DOD.md)
- [Modello UX object-focused](docs/OBJECT_FOCUSED_ACTION_MODEL.md)
- [Registro dei gap](docs/GAP_REGISTER.md)
- [Profili di esecuzione](docs/RUN_PROFILES.md)
- [GitHub Codespaces](docs/CODESPACES.md)

## Fuori scope

Non sono implementati OIDC/RBAC, multi-tenancy, malware scanning, scouting istituzionale reale, scheduler persistente, storage distribuito, alta disponibilità o telemetria centralizzata. Non esporre ICTC come servizio aziendale multiutente senza completare questi controlli.
