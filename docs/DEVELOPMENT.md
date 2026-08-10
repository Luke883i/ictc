# Sviluppo locale

## Setup

Richiede Node.js 22 o successivo. Il launcher canonico è `ictc.sh`; l'entrypoint applicativo resta `v3/server.mjs`.

```bash
git clone https://github.com/Luke883i/ictc.git
cd ictc
nvm use
npm ci
./ictc.sh start --no-open
```

Per fermare o diagnosticare il runtime: `./ictc.sh stop`, `./ictc.sh status`, `./ictc.sh doctor`.

## Prima di modificare

1. Leggere `AGENTS.md`.
2. Identificare l'owner in `docs/authority-matrix.yaml`.
3. Separare runtime authority, projection, presentation e documentazione derivata.
4. Preferire estensione di un owner esistente a un nuovo layer parallelo.
5. Per una write, definire persistence/readback/receipt e il refresh delle proiezioni dipendenti.
6. Per AI, mantenere `proposed` fino a una azione umana autorizzata.
7. Per export, mantenere `same-as-read` e claim boundary.
8. Per UI, riusare primitive, un solo primary action e progressive disclosure.

## Persistenza di sviluppo

La SOT locale usa `state.sqlite` sotto `ICTC_RUNTIME_DIR` (o runtime directory predefinita). I test runtime devono usare directory isolate. Non modificare il database dell'utente per preparare fixture. Un `state.json` è legacy import input, non lo storage corrente da editare.

## Ciclo locale canonico

```bash
npm run check
node v3/authority-contract-check.mjs
node v3/docs-command-contract-check.mjs
node v3/documentation-authority-check.mjs
npm test
```

Per una candidate usare anche:

```bash
npm run release:check
```

I browser journey completi girano in GitHub Actions e devono essere letti sull'exact PR HEAD.

## Branch e commit

Usare branch brevi (`agent/`, `feat/`, `fix/`, `docs/`). I commit dovrebbero avere una responsabilità falsificabile: contratto, runtime, UI, hardening, test, documentazione. Non combinare una correzione del prodotto con un allentamento del test che la rileva.

## Pull request

La PR dichiara problema, journey, impatto epistemico, schema/API, DoD, verifiche, non-obiettivi, residual risk e rollback. Se un check fallisce, correggere la causa sul nuovo commit e rieseguire exact-head; non usare il verde di un SHA precedente.

La governance GOV-01F resta compensativa finché GitHub non riporta branch protection server-side attiva.
