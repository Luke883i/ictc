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
| adaptive engineering / trajectory intake | `node v3/trama-engineering-check.mjs` | `node v3/trama-engineering-saturation.mjs`, poi `npm test` |
| C5 owner/freshness | `node v3/c5-semantic-owner-check.mjs` | `node v3/c5-semantic-owner-saturation.mjs`, `node v3/c5-needs-audit-saturation.mjs`, poi `npm test` |
| enterprise runtime/PostgreSQL orizzontale | `node v3/c3-enterprise-bench-dod-check.mjs` | `npm test` + exact-head `c3-enterprise-runtime-closure` |

Se una modifica locale richiede di leggere o cambiare molte authority non correlate, fermati e verifica prima il routing in `docs/START_HERE.md` e `v3/semantic-owner-contract.json`: la soluzione preferita resta nel proprietario esistente.

## Diagnosi dei failure di contribuibilità

Quando un check rosso è già classificato, riproduci prima il falsificatore locale del suo owner; non allentare il gate insieme al prodotto.

| Failure/check | Route | Riproduzione locale |
|---|---|---|
| `docs-command-contract` | `docs` | `node v3/docs-command-contract-check.mjs` |
| `c5-semantic-owner` | `governance` | `node v3/c5-semantic-owner-check.mjs` |
| `c3-enterprise-runtime` | `enterprise-runtime` | `node v3/c3-enterprise-bench-dod-check.mjs` |
| `enterprise-candidate` | `runtime` | `npm run release:check` |

Il workflow PostgreSQL C3 resta exact-head evidence separata: una riproduzione locale senza PostgreSQL non equivale al canary a due repliche.

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

## TRAMA adaptive falsification

`v3/trama-engineering-check.mjs` verifica authority zero, gerarchia/astrazione/composizione di ogni nodo, no-novelty tail N+100, import controllato da iKant/iKant_LE, separazione Enterprise Candidate/E3/E4 e wiring nella rail current. `v3/trama-engineering-saturation.mjs` esegue **1.000.000** casi antagonisti sul kernel, copre le coppie di failure family e applica un deletion oracle. Zero survivor vale solo sul modello dichiarato: non è probabilità di correttezza né evidenza browser, umana, deployment, legale o di minimalità globale.

Se al ceiling 1M emerge una nuova root failure family o novelty, il risultato è `BLOCKED_REMODEL_TAXONOMY`: si amplia il modello prima di proseguire, non il numero di seed per nascondere il finding.

## Topologia GitHub Actions e verdetto same-SHA

La presenza di molti workflow non implica molti verdetti concorrenti. ICTC separa **leaf evidence**, rail specializzate, diagnostica e aggregazione:

- i job/rail required falsificano failure family o ambienti distinti sulla HEAD candidata;
- i check con prefisso `diagnostic /` sono osservazionali e non gating;
- `ictc/actions-census` osserva i check-run della **exact HEAD SHA** e pubblica il singolo aggregate acceptance status, preferendo la provenance del leaf al failure aggregato;
- `GOV-01F` è un controllo compensativo di provenance + required exact-SHA gate, non branch protection;
- il post-merge su `main` valuta il merge SHA separatamente dalla PR head.

Un workflow con un nome storico può restare regression evidence sul codice corrente; il nome non promuove una vecchia release o slice a current authority. Non tutti i workflow hanno gli stessi trigger e non tutti girano a ogni evento.

L'orchestrazione utente/agente è esterna: una correzione crea una nuova HEAD e invalida l'accettazione precedente. L'agente può osservare, materializzare una nuova candidate e diagnosticare; non può trasformare un check in successo né sostituire la decisione di merge.

## Freshness vs coerenza semantica

C5 freshness e documentation freshness sono controlli di **immutabilità relativa**: rilevano che un input/receipt è cambiato o è rimasto uguale. Non dimostrano, da soli, coerenza semantica cross-owner.

Il debito noto è registrato come `D-RSC` in `v3/semantic-owner-contract.json`. Il documentation runtime esercita ora anche le failure family note: legacy authority classificata come current, UI prose che diverge da Home/Process Hub executable owners, OpenAPI che nomina la Suite DEMO sbagliata, PR governance declaration senza corrispondenza nel diff, laundering di GAP-022/CodeQL/legacy residue e confusione fra freshness e consistency.

Questo non è un solver globale di equivalenza semantica. Se emerge un nuovo drift, va aggiunto al vocabolario D-RSC e al falsificatore pertinente. Method/path parity di un'API non implica semantic freshness della descrizione.

CodeQL resta supplemental/conditional: se l'exact-head check è `skipped`, l'evidenza CodeQL è **non eseguita**, non verde. I rail first-party required mantengono il proprio verdetto indipendente.

## Exact-head e freshness

Il colore appartiene allo SHA eseguito. Dopo una correzione, il verde del commit precedente è genealogia. PR acceptance richiede gli artifact/check della exact PR HEAD corrente; `skipped` significa non eseguito, non passed.

Un `SemanticClosureReceipt` aggiunge un secondo vincolo più selettivo: se cambia il digest di un input semantico dichiarato o di una dependency receipt, la closure è stale e deve essere rieseguita. Un cambiamento non dipendente può non invalidare quel receipt, ma non elimina mai l'obbligo exact-head per l'accettazione della PR.

## Browser / accessibilità

I journey automatizzati sono E2 repository evidence e non sostituiscono review umana di usabilità, VoiceOver/NVDA, zoom/reflow/contrast/focus o verifica fisica degli export.

## Evidence / security

I test verificano identity/version binding, authorization, checksum, XML/PDF/ZIP shape e limitation. Non attestano autenticità esterna, applicabilità legale, effectiveness, security del deployment, configurazione server-side di GitHub o assurance indipendente.

## GOV-TRAMA-COMPASS-1 — governance falsification

`node v3/trama-engineering-check.mjs` verifica target enterprise 16 assi / 64 requisiti, profilo a 8 meccanismi / 56 controlli, Bussola generated e separazione delle authority. `node v3/trama-engineering-saturation.mjs` esegue **1.000.000** mutazioni deterministiche, pair coverage, deletion oracle e un tail no-novelty di almeno **100.000** casi.

La qualificazione non trasforma mutation in prova fisica, umana, deployment o GitHub server-side. `docs/ENGINEERING_COMPASS.md` deve essere byte-identica alla projection rigenerata dagli owner correnti; qualunque nuovo SHA riapre l'accettazione.

## GOV-TRAMA-RECONCILE-1

La rail current esegue:

```bash
node v3/trama-reconcile-check.mjs
node v3/trama-reconcile-saturation.mjs
```

Il check confronta authority, owner correnti, remediation registry, legacy census, Compass e critical path. La saturation attraversa 8 campagne L0→L7 (ferro, persistence, runtime, semantic, governance, product, experience, enterprise), **3.000.000** casi, 64 failure family, tutte le 2.016 coppie e una coda no-novelty da **100.000** casi. Questi numeri qualificano il modello semantico: non sono browser session, human study, deployment evidence o prova formale di minimalità globale.

Un candidate path legacy non è un failure per nome. Il failure è una classificazione assente o una responsabilità blocking ancora corrente.
