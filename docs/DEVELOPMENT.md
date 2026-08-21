# Sviluppo ICTC

## Setup

```bash
git clone https://github.com/Luke883i/ictc.git
cd ictc
nvm use
npm ci
./ictc.sh start --no-open
```

Node `>=22.16.0`; entrypoint `v3/server.mjs`; launcher `ictc.sh`.

## Prima di modificare

1. Leggi `AGENTS.md` e `docs/authority-matrix.yaml`.
2. Identifica oggetto governato, authority owner e claim boundary.
3. Formula il bug come invariante falsificabile, non come desiderio UI.
4. Cerca la correzione nel proprietario esistente; un nuovo layer richiede prova che nessun owner corrente possa assorbirla.
5. Per temporalità, lega la decisione alla basis/versione e definisci cosa accade quando cambia.
6. Per external evidence, distingui “osservata” da “version-bound/usable”.
7. Per AI, preferisci `metadata.epistemicEffects`; non usare action naming come nuova authority.
8. Per cross-process, conserva draft semantics, typed predicate e bounded lineage.
9. Per UI condivisa, C0.1 deve restare l'ultimo converger semantico.
10. Aggiorna README/architecture/contract se cambia il significato di un concetto pubblico.

## Ciclo canonico

```bash
npm run check
node v3/authority-contract-check.mjs
node v3/docs-command-contract-check.mjs
node v3/documentation-authority-check.mjs
npm test
npm run release:check
```

Per closure 2.8 esegui anche i quattro check `semantic-closure-2-8-*` elencati in `docs/TESTING.md`.

## Commit

Branch breve, mai push diretto su `main`. Commit semanticamente atomici: runtime, causalità, UI constitution, falsificazione, documentazione. Non mischiare fix con l'allentamento del test che lo rileva.

## Pull request

La PR deve dichiarare base/head, problema, invariant, epistemic impact, compatibility, DoD, test, residual risk e rollback. Una campagna di simulazioni va descritta con operatori/failure family/holdout, non come “milioni di prove = corretto”.

## Persistenza

Usa runtime directory isolate nei test. `state.sqlite` è la SOT locale; `state.json` è solo legacy import input. Non editare lo storage reale dell'utente per costruire fixture.

## Definizione di done

Una slice è done quando: causa chiusa nel proprietario corretto, falsificatore presente, documentazione AS-IS coerente, nessuna authority widening, compatibilità/residui dichiarati e exact PR HEAD verde. “Done slice” non significa production ready.
