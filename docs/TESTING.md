# Strategia di test, mutation e saturation

## Superficie normativa

```bash
npm run docs:check
npm test
npm run release:check
```

`npm test` esegue `test:current`: il documentation lattice check entra nella semantic current rail prima del runtime current. I rail storici restano regressioni/diagnostica e non ridefiniscono `v3/release-identity.json`.

## Feedback per tipo di modifica

Usa prima il falsificatore più vicino al cambiamento; usa poi la rail di convergenza. La tabella orienta, non crea una seconda authority.

| Modifica | Feedback rapido | Prima della PR |
|---|---|---|
| UI/layout/copy locale | `node v3/uiux-converge-0-check.mjs` + gate surface interessato | `npm test` |
| API/handler | `node v3/semantic-api-contract-check.mjs` | `npm run test:current:runtime` |
| AI/provider/egress | `node v3/ai-network-policy-check.mjs` | `npm test` |
| persistence/readback/receipt | `node v3/s3-runtime-reliability-saturation.mjs` | `npm run test:current:runtime` |
| evidence/provenance | `node v3/evidence-check.mjs` | `npm run test:current:runtime` |
| security boundary | `node v3/security-boundary-check.mjs` | `npm run release:check` |
| docs/routing/authority projection | `npm run docs:check` | `npm run docs:saturation` |
| convergence/workbook planning | `node v3/convergence-authority-check.mjs` | `npm test` |
| C5 owner/freshness | `node v3/c5-semantic-owner-check.mjs` | `node v3/c5-semantic-owner-saturation.mjs && node v3/c5-needs-audit-saturation.mjs && npm test` |

Se una modifica locale richiede di leggere o cambiare molte authority non correlate, fermati e verifica prima il routing in `docs/START_HERE.md` e `v3/semantic-owner-contract.json`: la soluzione preferita resta nel proprietario esistente.

## Rail corrente

La composizione UI corrente è **Native Semantic Lattice 3.2**:

```bash
node v3/current-semantic-3-2.mjs
node v3/native-semantic-lattice-3-2-check.mjs
node v3/native-semantic-lattice-3-2-ui-check.mjs
node v3/native-semantic-lattice-3-2-saturation.mjs
node v3/native-semantic-lattice-3-2-stress.mjs
```

C5 rende owner e freshness osservabili senza sostituire la composition authority:

```bash
node v3/c5-semantic-owner-check.mjs
node v3/c5-semantic-owner-saturation.mjs
node v3/c5-needs-audit-saturation.mjs
```

Il sistema documentale corrente è **Documentation Runtime 1.0**:

```bash
npm run docs:check
npm run docs:saturation
```

`docs:check` verifica authority/lifecycle, raggiungibilità degli owner, product truth, community routing, PR contract e package wiring. `docs:saturation` falsifica il modello degli invarianti documentali; il numero di trial non è un numero di contributor study, browser session o code mutation indipendenti.

## Livelli

| Livello | Cosa falsifica |
|---|---|
| documentation current | authority, lifecycle, link graph, contributor/community routing, npm wiring |
| syntax | parsing e import |
| semantic current | authority, procedure contract, projection/UI, epistemic, static security, saturation |
| runtime current | persistence, RBAC, evidence, readback, E2E runtime |
| browser exact-head | journey reale sul server e DOM |
| release check | stable rail + candidate current |

I gate Closure 2.8 e delle slice precedenti restano lineage/regression evidence quando richiamati dalle suite correnti; non costituiscono la rail current per il solo fatto di avere un alto volume di mutation trial.

## Regola mutation

Una mutazione utile rompe **un invariante indipendente**. Il kill-rate vale soltanto rispetto agli operatori dichiarati. Se emerge una nuova failure family, va aggiunta al vocabolario invece di aumentare il numero di seed per nasconderla.

Compression mutant: rimuovere un owner/guard/binding necessario deve riaprire almeno una signature. Test e prodotto non possono essere allentati nello stesso commit per ottenere verde.

Il rail C5 esegue 10.000 mutazioni deterministiche del contratto owner/freshness e 10.000 audit sintetici multi-layer di routing. Sono evidence E2 sul modello dichiarato: non sono browser session, contributor study, codice mutato/compilato, deployment test o probabilità di correttezza.

## Exact-head e freshness

Il colore appartiene allo SHA eseguito. Dopo una correzione, il verde del commit precedente è genealogia. PR acceptance richiede gli artifact/check della exact PR HEAD corrente; `skipped` significa non eseguito, non passed.

Un `SemanticClosureReceipt` aggiunge un secondo vincolo più selettivo: se cambia il digest di un input semantico dichiarato o di una dependency receipt, la closure è stale e deve essere rieseguita. Un cambiamento non dipendente può non invalidare quel receipt, ma non elimina mai l'obbligo exact-head per l'accettazione della PR.

## Browser / accessibilità

I journey automatizzati sono E2 repository evidence e non sostituiscono review umana di usabilità, VoiceOver/NVDA, zoom/reflow/contrast/focus o verifica fisica degli export.

## Evidence / security

I test verificano identity/version binding, authorization, checksum, XML/PDF/ZIP shape e limitation. Non attestano autenticità esterna, applicabilità legale, effectiveness, security del deployment, configurazione server-side di GitHub o assurance indipendente.
