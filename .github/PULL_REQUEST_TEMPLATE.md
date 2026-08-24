## Scope

Descrivi la slice semantica o tecnica e l'oggetto governato.

## Affected authority

Indica l'owner corrente da `docs/authority-matrix.yaml` e spiega perché la modifica appartiene a quell'owner. Dichiarare esplicitamente se non cambia alcuna authority.

## Claim boundary

Cosa dimostra questa PR e cosa **non** dimostra? Se cambia AI, evidenza, mapping, rischio, applicabilità o decisione umana, esplicita il confine epistemico.

## Non-goals

Elenca ciò che resta intenzionalmente fuori scope e le dipendenze da PR/setting esterni.

## Current semantic/runtime rail

Indica la rail corrente toccata e gli eventuali prerequisite/stacked PR. Evita di promuovere test o DoD storici a current authority.

## Tests and falsification

```text
npm run docs:check        # quando cambia documentazione/authority/community routing
npm test
npm run release:check
```

Elenca i test realmente eseguiti sulla exact head. `skipped`, verde di un commit precedente e model saturation non equivalgono a runtime/browser/deployment evidence.

## Documentation

- [ ] product/architecture/epistemic authority aggiornata se il significato pubblico cambia
- [ ] `docs/documentation-manifest.json` aggiornato se cambia il reticolo documentale
- [ ] nessun documento lineage/source-input è stato promosso implicitamente a current

## Compatibility, residual risk and rollback

Descrivi compatibilità, migrazioni, rischio residuo e rollback. Le impostazioni server-side di GitHub o deployment non vanno dichiarate verificate senza osservazione esterna.
