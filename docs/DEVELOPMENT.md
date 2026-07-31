# Sviluppo locale

## Setup

```bash
git clone https://github.com/Luke883i/ictc.git
cd ictc
nvm use
./ictc.sh audit
./ictc.sh start
```

Per lavorare con il server in primo piano:

```bash
./ictc.sh start --foreground
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
6. I test devono usare `ICTC_RUNTIME_DIR` isolata e non contaminare `runtime/`.
7. Non modificare manualmente artefatti generati.

## Ciclo minimo

```bash
./ictc.sh audit
npm run visual
npm run git:handshake
```

## Pull request

La PR deve dichiarare:

- problema e obiettivo;
- journey interessata;
- impatto epistemico;
- modifiche allo schema o alle API;
- Definition of Done;
- test e audit eseguiti;
- limiti e non-obiettivi;
- eventuale piano di rollback.
