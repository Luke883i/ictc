# START HERE — presa in carico ICTC

Questa pagina è l'**entrypoint canonico del sistema documentale**. È una mappa di routing: non sostituisce le authority sostanziali registrate in `authority-matrix.yaml` e `documentation-manifest.json`.

## Router per tipo di modifica

Parti dal problema concreto, poi risali all'authority soltanto quanto serve. Il contratto eseguibile `v3/semantic-owner-contract.json` rende questa proiezione verificabile senza creare una seconda authority.

| Route | Se stai cambiando… | Parti da | Feedback più vicino | Prima della PR |
|---|---|---|---|---|
| `ui` | layout, label, componenti, responsive, interazioni locali | owner della surface in `v3/semantic-owner-contract.json` + `authority-matrix.yaml` | `node v3/uiux-converge-0-check.mjs` | `npm test` |
| `api` | route HTTP, request/response, permessi | `docs/openapi.yaml` + handler runtime | `node v3/semantic-api-contract-check.mjs` | `npm run test:current:runtime` |
| `ai` | provider, schema, budget, prompt transport, proposta AI | `v3/ai.mjs` + runtime provider/network policy | `node v3/ai-network-policy-check.mjs` | `npm test` |
| `persistence` | Store, replay, versioni, receipt, SQLite | `v3/store.mjs` + `v3/sqlite-state-persistence.mjs` | `node v3/s3-runtime-reliability-saturation.mjs` | `npm run test:current:runtime` |
| `docs` | guida current, lifecycle, routing, projection | `docs/START_HERE.md` + manifest | `npm run docs:check` | `npm run docs:saturation` |
| `governance` | traiettoria, slice, workbook, convergence | `docs/convergence/convergence-authority.json` | `node v3/convergence-authority-check.mjs` | `npm test` |
| `security` | trust boundary, identity, egress, path, abuse control | owner runtime + `SECURITY.md` | `node v3/security-boundary-check.mjs` | `npm run release:check` |
| `evidence` | evidenza, reference, digest, export, provenance/claim | `02_EPISTEMIC_CONTRACT.md` + owner runtime | `node v3/evidence-check.mjs` | `npm run test:current:runtime` |
| `runtime` | server wiring, handler, bootstrap projection | `v3/server.mjs` + `11_ARCHITECTURE.md` | `npm run check` | `npm run test:current:runtime` |

Per una correzione locale non serve leggere l'intera genealogia. Se la modifica altera significato, authority, persistence, epistemic state o una surface condivisa, approfondisci i documenti proprietari indicati sotto. Se il problema richiede un nuovo layer, prima dimostra che nessun owner corrente possa assorbirlo.

## Percorso di approfondimento

1. [README](../README.md) — identità sintetica, sette processi, stack e runtime corrente.
2. [PRODUCT](PRODUCT.md) — scopo e confini di prodotto correnti.
3. [AGENTS](../AGENTS.md) — invarianti epistemici e vincoli globali di sviluppo.
4. [Authority matrix](authority-matrix.yaml) — owner eseguibili e documentali; path canonico `docs/authority-matrix.yaml`.
5. [Convergence authority](convergence/convergence-authority.json) — sequenza di sviluppo e binding dell'active workbook; non ridefinisce product/runtime truth o Git facts.
6. [Architecture](11_ARCHITECTURE.md) — architettura AS-IS e flussi browser → runtime → SQLite; path canonico `docs/11_ARCHITECTURE.md`.
7. [Epistemic contract](02_EPISTEMIC_CONTRACT.md) — versioni, basis, authority e read/write boundary.
8. [End-user language](03_ENDUSER_LANGUAGE.md) e [User journeys](04_USER_JOURNEYS.md) — policy linguistica e journey correnti.
9. [Native Semantic Lattice 3.2](NATIVE_SEMANTIC_LATTICE_3_2_DOD.md) — composizione UI/UX corrente; path canonico `docs/NATIVE_SEMANTIC_LATTICE_3_2_DOD.md`.
10. [Semantic Workspace Closure 3.2.1](SEMANTIC_WORKSPACE_CLOSURE_3_2_1_DOD.md) — owner corrente di Processi/Evidence presentation oltre alla closure copy/layout.
11. [Workspace Chrome Design System 3.3](21_DESIGN_SYSTEM.md) — token e owner bounded di header/footer.
12. [UI Fine-Tuning 3.4](UI_FINE_TUNING_3_4_DOD.md) — lineage della closure ritirata; non è current authority.
13. [Testing](TESTING.md) e [Development](DEVELOPMENT.md) — gate e flusso operativo.
14. [Documentation Standard](DOCUMENTATION_STANDARD.md) e [Documentation Runtime 1.0](DOCUMENTATION_RUNTIME_1_0_DOD.md) — policy e gate del reticolo documentale; path canonico `docs/DOCUMENTATION_STANDARD.md`.

Il registry machine-readable è [documentation-manifest.json](documentation-manifest.json). La data più recente non crea authority: lifecycle e topic sono espliciti. `uiComposition = 3.2`, `workspaceChrome = 3.3` e `uiPresentation = local-owners` sono assi distinti: la presentation corrente è distribuita tra owner canonici e non esiste più un final cascade resolver globale.

`docs/convergence/convergence-authority.json` è l'owner corrente della **traiettoria di sviluppo**. La proiezione leggibile è `docs/convergence/ICTC_CONVERGENCE_AUTHORITY_ACTIVE.xlsx`; è derivata e non può sostituire Git, product, runtime o claim authority. Ogni PR verso `main` dichiara `Trajectory impact` e `Convergence slice`.

## Contributor e community path

| Esigenza | Route |
|---|---|
| proporre una modifica | [CONTRIBUTING](../CONTRIBUTING.md) + [PR template](../.github/PULL_REQUEST_TEMPLATE.md) |
| capire chi decide | [GOVERNANCE](../GOVERNANCE.md) + [engineering governance](ENGINEERING_GOVERNANCE.md) |
| segnalare un defect non sensibile | [bug template](../.github/ISSUE_TEMPLATE/bug.yml) |
| chiedere supporto | [SUPPORT](../SUPPORT.md) |
| segnalare una vulnerabilità | [SECURITY](../SECURITY.md), mai issue pubblica |
| regole di collaborazione | [CODE OF CONDUCT](../CODE_OF_CONDUCT.md) |

## Mappa degli owner correnti

| Se devi cambiare | Parti da | Non creare |
|---|---|---|
| product intent/confini | `docs/PRODUCT.md` | una product truth in prompt/PR/DoD |
| traiettoria / sequenza PR / workbook | `docs/convergence/convergence-authority.json` + active workbook derivato | roadmap implicite, workbook-only authority o auto-commit CI a `main` |
| composition root UI | `v3/public/ui/active-experience.js` | una seconda root |
| contratto/copy 3.2 | `native-semantic-lattice-3-2.js` | copy locale divergente |
| Home presentation | `enterprise-workspace-3-2.css` | un final resolver globale |
| Processi/Evidence presentation | `semantic-workspace-closure-3-2-1.css` | duplicazione in 3.2 o in un nuovo layer |
| chrome globale | `design-tokens.css` + `workspace-chrome-3-3.css` + `21_DESIGN_SYSTEM.md` | palette/header/footer authority parallele |
| annotazione globale | `semantic-composition-runtime.js` | business copy/reorder nel kernel globale |
| decision presentation | `procedure-ui-ux-1-6.js` / C0.1 | una seconda presentation authority |
| linguaggio business | `03_ENDUSER_LANGUAGE.md` + Semantic Foundation | label locali divergenti |
| processo | registry/adapter/policy + runtime nativo | un ottavo processo business |
| azione umana | `semantic-foundation-actions.js` + annotation C0.1 | write authority nel browser |
| evidenza | evidence/reference contracts | equivalenza evidenza = conclusione |
| persistenza | Store + SQLite persistence | un secondo business store |
| API | `docs/openapi.yaml` + handler runtime | endpoint UI-only paralleli |
| documentazione | `DOCUMENTATION_STANDARD.md` + manifest | authority implicita per data/nome file |
| test/release | current release suite + CI | un gate PR alternativo |

## Native Semantic Lattice 3.2

La regola UI corrente è **work first, explanation on demand**. `active-experience.js` installa gli owner locali 3.2 e solo dopo il kernel globale di annotazione. Il kernel è annotation-only: non possiede la gerarchia locale, non introduce copy business e non riordina il DOM locale.

Processi di Compliance è un catalogo di capability eterogenee e usa una matrice responsive 3 → 2 → 1. I record business ripetuti e comparabili usano invece list/row grammar. Il lifecycle costituzionale resta C0.1: `harmonization → presentation → integrity → journey → annotation`.

## Presentation corrente: owner locali + Workspace Chrome 3.3

`enterprise-workspace-3-2.css` conserva soltanto la presentation bounded di Home e di superfici native non coperte da owner più specifici. Non possiede più cause storiche di stable chrome o catalogo Processi.

`semantic-workspace-closure-3-2-1.css` possiede la presentation corrente di Processi di Compliance ed Evidenze ICTC insieme alla closure copy/layout 3.2.1. `design-tokens.css` e `workspace-chrome-3-3.css` possiedono il chrome globale quando `stable-shell.js` espone il marker 3.3.

`workspace-finetuning-3-4.css` è ritirato e non viene caricato. `UI_FINE_TUNING_3_4_DOD.md` resta lineage: i suoi gate storici sono mantenuti come retirement oracle per impedire che il final resolver o le vecchie cause concorrenti vengano reintrodotti.

## Classi documentali

- **current**: authority AS-IS;
- **operating**: istruzioni per modificare/testare il sistema;
- **policy**: regole repository/community;
- **lineage**: storia e decision evidence, non current truth;
- **source-input**: input originari, non AS-IS;
- **roadmap**: futuro intenzionale, non comportamento corrente;
- **generated**: evidenza derivata, mai hand-edited.

I documenti storici classificati come lineage non sono autorità corrente. `00_PROMPT_CLARIFICATION.md` è source-input. `01_TO_BE_IDEA.md` e `ROADMAP.md` sono roadmap. Il DoD di una slice possiede soltanto il contratto della slice dichiarata e non ridefinisce implicitamente product/architecture authority.

## Verifica minima

```bash
npm run docs:check
npm test
npm run release:check
node v3/convergence-authority-check.mjs
```

Per lavoro specifico sulla composizione/presentation corrente:

```bash
node v3/current-semantic-3-2.mjs
node v3/native-semantic-lattice-3-2-check.mjs
node v3/native-semantic-lattice-3-2-ui-check.mjs
node v3/workspace-chrome-3-3-saturation.mjs
node v3/ui-finetuning-3-4-check.mjs
node v3/ui-finetuning-3-4-saturation.mjs
node v3/native-semantic-lattice-3-2-saturation.mjs
node v3/native-semantic-lattice-3-2-stress.mjs
```

Per il contratto C5 di owner/freshness:

```bash
node v3/c5-semantic-owner-check.mjs
node v3/c5-semantic-owner-saturation.mjs
node v3/c5-needs-audit-saturation.mjs
```

I due file `ui-finetuning-3-4-*` conservano il nome di lineage ma verificano il **ritiro** della 3.4 e la relocation degli invarianti negli owner correnti. `npm run docs:saturation` falsifica il modello documentale. Trial modellati, source-string mutation executions, CI e browser runtime sono classi di evidenza diverse. Private vulnerability reporting, branch protection/ruleset e deployment controls richiedono osservazione esterna e non possono essere auto-certificati da questi file.
