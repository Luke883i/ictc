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
- journey-first UI con checkpoint prima delle scritture.

## Esperienza journey-first

ICTC non apre più con una tassonomia di moduli o con una dashboard universale. La prima domanda è:

> Che cosa devi completare adesso?

Le lenti disponibili sono Analista normativo, Responsabile evento, Auditor, Direzione e Operatore piattaforma. Ogni lente mostra una sola attività primaria derivata dal bootstrap runtime, con oggetto SOT, scopo nella journey, confine decisionale, conseguenza, limite ed evidenza attesa.

```text
persona → incarico → oggetto SOT → checkpoint → route → readback → receipt
```

La persona è una preferenza di presentazione nel browser: non è identità, autenticazione o autorizzazione.

## Guardrail v1

- un bind non-loopback privo di autenticazione viene rifiutato per default;
- gli upload binari sono disabilitati finché non esiste quarantena e scansione;
- `/api/release` espone scope, esclusioni, readiness e hash del manifest;
- `/api/health` espone versione e classe di stabilità;
- la lente **Operatore piattaforma** mostra readiness, deployment e limiti.

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
npm run audit:ux:journey
```

Con runtime attivo, il gate journey verifica anche tre percorsi API e un browser path con scrittura reale:

```bash
ICTC_BASE_URL=http://127.0.0.1:4807 node v3/journey-runtime-check.mjs
ICTC_BASE_URL=http://127.0.0.1:4807 python3 v3/journey-browser-check.py
```

La saturazione journey-first copre `M=60 → M+100=160` senza nuova primitiva dopo M. È una conclusione bounded e non prova completezza universale o comprensione umana.

## Documentazione v1

- [Audit buyer e differenziazione](docs/V1_BUYER_AUDIT.md)
- [Definition of Done v1](docs/V1_STABILITY_DOD.md)
- [Audit della UI precedente](docs/JOURNEY_FIRST_UI_AUDIT.md)
- [Design journey-first a ritroso](docs/JOURNEY_FIRST_UI_DESIGN.md)
- [DoD e metriche journey-first](docs/JOURNEY_FIRST_UI_DOD.md)
- [Registro dei gap](docs/GAP_REGISTER.md)
- [Profili di esecuzione](docs/RUN_PROFILES.md)
- [GitHub Codespaces](docs/CODESPACES.md)

## Fuori scope

Non sono implementati OIDC/RBAC, multi-tenancy, malware scanning, scouting istituzionale reale, scheduler persistente, storage distribuito, alta disponibilità o telemetria centralizzata. Non esporre ICTC come servizio aziendale multiutente senza completare questi controlli.
