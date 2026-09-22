## Scope

Descrivi la slice semantica o tecnica e l'oggetto governato.

Una PR ICTC è una **unità di esecuzione semantica**: una responsabilità falsificabile, anche se tocca più file o non modifica il runtime applicativo. La HEAD corrente è la candidate state; un nuovo commit crea un nuovo SHA e invalida il verde precedente.

## Affected authority

Indica l'owner corrente da `docs/authority-matrix.yaml` e spiega perché la modifica appartiene a quell'owner. Dichiarare esplicitamente se non cambia alcuna authority.

## Claim boundary

Cosa dimostra questa PR e cosa **non** dimostra? Se cambia AI, evidenza, mapping, rischio, applicabilità o decisione umana, esplicita il confine epistemico.

## Non-goals

Elenca ciò che resta intenzionalmente fuori scope e le dipendenze da PR/setting esterni.

## Current semantic/runtime rail

Indica la rail corrente toccata e gli eventuali prerequisite/stacked PR. Evita di promuovere test o DoD storici a current authority.

## Convergence authority

- Trajectory impact: `<planned|intentional-deviation|neutral|reconciliation>`
- Convergence slice: `<slice-id|NONE>`
- Authority: `docs/convergence/convergence-authority.json`

Una modifica user-directed fuori dal piano corrente usa `intentional-deviation`: preserva la storia e aggiorna authority + workbook. Una PR realmente neutra usa `Convergence slice: NONE` e non riscrive il workbook.

- [ ] Se il body dichiara `planned` / `intentional-deviation` o afferma che convergence authority + workbook cambiano insieme, i file dichiarati sono realmente presenti nel diff; altrimenti la dichiarazione è stata corretta prima del merge.
- [ ] Se la PR crea, mitiga o chiude un finding `D-RSC`, `v3/semantic-owner-contract.json#repositoryCoherenceDebt` e il relativo falsificatore restano coerenti.

## TRAMA adaptive intake / exit

- Intent / IntentCard digest: `<value>`
- Global DoD: `<pass|blocked + residual>`
- Intermediate DoD: `<pass|blocked + residual>`
- Local DoD: `<pass|blocked + residual>`
- Mutation tier: `<1k|100k|1M>` e failure family coperte: `<value>`
- Previous roadmap assumption challenged: `<value|none>`
- Enterprise Candidate distance: `<repository blockers + E3/E4 blockers>`
- [ ] ACT recomputed sulla exact PR HEAD; la prossima slice è stata ricalcolata senza promuovere la proiezione TRAMA ad authority.

## Tests and falsification

```text
npm run docs:check
node v3/convergence-authority-check.mjs
npm test
npm run release:check
```

Elenca i test realmente eseguiti sulla exact head. `skipped`, verde di un commit precedente e model saturation non equivalgono a runtime/browser/deployment evidence.

## Documentation

- [ ] product/architecture/epistemic authority aggiornata se il significato pubblico cambia
- [ ] `docs/documentation-manifest.json` aggiornato se cambia il reticolo documentale
- [ ] convergence authority + workbook aggiornati insieme quando richiesto dal trajectory impact
- [ ] nessun documento lineage/source-input è stato promosso implicitamente a current

## Compatibility, residual risk and rollback

Descrivi compatibilità, migrazioni, rischio residuo e rollback. Le impostazioni server-side di GitHub o deployment non vanno dichiarate verificate senza osservazione esterna.

## GOV-01F — Free/private compensating governance

- [ ] exact PR HEAD SHA osservato prima del merge
- [ ] tutti i `requiredPreMergeChecks` da `.github/gov-01f-policy.json` verdi sullo stesso HEAD
- [ ] merge via PR; nessun direct push a `main`
- [ ] post-merge `main` e `requiredPostMergeChecks` saranno osservati

> GOV-01F resta compensating governance: non rende `main` server-side protected.

## GOV-TRAMA-COMPASS-1 closure

- Documentation Delta: `<owner docs changed + why; generated Compass always regenerated>`
- Bussola ACT: `<single next slice|STOP|BLOCKED + local/intermediate/global deltas>`
- Rollback contract: `<semantic rollback or irreversible migration boundary>`
- Failure owner / nearest falsifier: `<owner + local reproducer>`
- [ ] Global DoD compiled from current target/owners.
- [ ] Intermediate DoD compiled from current semantic neighborhood.
- [ ] Local DoD compiled and satisfied on exact PR HEAD.
- [ ] ACT recomputed after the latest tool/CI fact; prior roadmap was challenged rather than assumed.


## GOV-TRAMA-RECONCILE-1

- Interaction mode: `<GLOBAL_ACT|INTENT_SCOPED>`
- Reconciliation observation / exact head: `<sha>`
- Coherence debt: `<0 | findings>`
- Legacy census: `<classified / blocking / unclassified>`
- Reconciled states: `<serial + C1..C5>`
- Critical path: `<ordered unresolved slices>`
- One next action: `<slice|STOP>`
- [ ] `node v3/trama-reconcile-check.mjs` passa.
- [ ] Per cambi cross-layer, `node v3/trama-reconcile-saturation.mjs` passa.
- [ ] `blocking-unclassified = 0`.
- [ ] Workbook, convergence authority e Bussola sono semanticamente co-transizionali.
