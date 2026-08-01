# ICTC v3 runtime — Journey-first workspace

La generazione tecnica v3 alimenta la release ICTC v1. Il backend, il ledger e gli OutcomeEnvelope restano invariati; la UI corrente organizza gli stessi oggetti per incarico utente.

```bash
./ictc-v3.sh start
./ictc-v3.sh status
./ictc-v3.sh logs
./ictc-v3.sh audit
./ictc-v3.sh stop
```

## UI attiva

La prima scelta è una lente di lavoro, non un modulo:

- Analista normativo;
- Responsabile evento;
- Auditor;
- Direzione;
- Operatore piattaforma.

Ogni workspace mostra una sola attività primaria e usa progressive disclosure per percorso, limiti e coda. Tutte le attività derivano dal bootstrap runtime o da un intento umano esplicito. Le scritture passano da checkpoint, route, readback e receipt.

## Contratti e gate

```bash
npm run audit:ux:journey
```

Con server attivo:

```bash
ICTC_BASE_URL=http://127.0.0.1:4807 node v3/journey-runtime-check.mjs
ICTC_BASE_URL=http://127.0.0.1:4807 python3 v3/journey-browser-check.py
```

La SOT è locale in `v3/runtime/`. Integrità tecnica, receipt e hash non equivalgono a verità, completezza o conformità.
