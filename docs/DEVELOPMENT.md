# Sviluppo locale

## Setup

```bash
git clone <repository-url>
cd ictc
nvm use
npm ci
npm test
npm start
```

## Branch

Usare branch brevi e descrittivi:

```text
agent/<scopo>
feat/<scopo>
fix/<scopo>
docs/<scopo>
```

## Regole di modifica

1. Individuare il file autoritativo in `docs/authority-matrix.yaml`.
2. Non renderizzare entità grezze: usare `OutcomeEnvelope`.
3. Non assegnare a output AI stati riservati alla decisione umana.
4. Ogni controllo UI deve comparire in `docs/ui-wiring-manifest.json`.
5. Ogni scrittura critica deve essere persistita, riletta e collegata a receipt.
6. Non modificare manualmente artefatti generati.

## Ciclo minimo

```bash
npm run contract
npm run schema:check
npm run labels:check
npm run epistemic:check
npm run wiring:check
npm run verify
npm run e2e
npm run visual
```

## Pull request

La PR deve dichiarare:

- problema e obiettivo;
- journey interessata;
- impatto epistemico;
- modifiche allo schema o alle API;
- Definition of Done;
- test eseguiti;
- limiti e non-obiettivi;
- eventuale piano di rollback.
