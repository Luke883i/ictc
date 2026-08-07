# Sviluppo locale

## Setup

Richiede Node.js 22 o successivo. Il launcher canonico è `ictc.sh`; l'entrypoint applicativo resta `v3/server.mjs` come dichiarato in `docs/authority-matrix.yaml`.

```bash
git clone https://github.com/Luke883i/ictc.git
cd ictc
nvm use
npm ci
./ictc.sh start --no-open
```

Per fermare o verificare il runtime usare rispettivamente `./ictc.sh stop` e `./ictc.sh status`.

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
6. I test runtime devono usare `ICTC_RUNTIME_DIR` isolata e non contaminare la SOT dell'utente.
7. Non modificare manualmente artefatti generati.
8. Un comando normativo documentato deve essere eseguibile: `node v3/docs-command-contract-check.mjs` è il falsificatore del contratto comandi.

## Ciclo locale canonico

Per una modifica ordinaria:

```bash
npm run check
node v3/authority-contract-check.mjs
node v3/docs-command-contract-check.mjs
npm test
```

`./ictc.sh audit` è il launcher equivalente per l'audit completo e delega allo script npm `audit`. Per una candidata di release usare anche `npm run release:check`.

I check browser/visuali completi sono eseguiti dai workflow GitHub e devono essere letti sullo stesso HEAD della PR; non esiste oggi uno script npm locale canonico per la visual validation finché non viene materializzato in `package.json`.

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

La promozione segue inoltre GOV-01F: exact PR HEAD, required pre-merge checks sul medesimo SHA, merge via PR e readback post-merge del nuovo SHA di `main`.
