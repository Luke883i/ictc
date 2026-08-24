# START HERE — presa in carico ICTC

Questa pagina è l'**entrypoint canonico del sistema documentale**. È una mappa di routing: non sostituisce le authority sostanziali registrate in `authority-matrix.yaml` e `documentation-manifest.json`.

## Percorso minimo

1. [README](../README.md) — identità sintetica, sette processi, stack e runtime corrente.
2. [PRODUCT](PRODUCT.md) — scopo e confini di prodotto correnti.
3. [AGENTS](../AGENTS.md) — invarianti epistemici e vincoli globali di sviluppo.
4. [Authority matrix](authority-matrix.yaml) — owner eseguibili e documentali; path canonico `docs/authority-matrix.yaml`.
5. [Architecture](11_ARCHITECTURE.md) — architettura AS-IS e flussi browser → runtime → SQLite; path canonico `docs/11_ARCHITECTURE.md`.
6. [Epistemic contract](02_EPISTEMIC_CONTRACT.md) — versioni, basis, authority e read/write boundary.
7. [End-user language](03_ENDUSER_LANGUAGE.md) e [User journeys](04_USER_JOURNEYS.md) — policy linguistica e journey correnti.
8. [Native Semantic Lattice 3.2](NATIVE_SEMANTIC_LATTICE_3_2_DOD.md) — composizione UI/UX corrente; path canonico `docs/NATIVE_SEMANTIC_LATTICE_3_2_DOD.md`.
9. [Workspace Chrome Design System 3.3](21_DESIGN_SYSTEM.md) — token e presentazione bounded di header/footer; non è business authority.
10. [Testing](TESTING.md) e [Development](DEVELOPMENT.md) — gate e flusso operativo.
11. [Documentation Standard](DOCUMENTATION_STANDARD.md) e [Documentation Runtime 1.0](DOCUMENTATION_RUNTIME_1_0_DOD.md) — policy e gate del reticolo documentale; path canonico `docs/DOCUMENTATION_STANDARD.md`.

Il registry machine-readable è [documentation-manifest.json](documentation-manifest.json). La data più recente non crea authority: lifecycle e topic sono espliciti.

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
| composition root UI | `v3/public/ui/active-experience.js` | una seconda root |
| contratto/copy 3.2 | `native-semantic-lattice-3-2.js` | copy locale divergente |
| composizione locale | owner locale + `native-workspace-3-2.js` bootstrap | un global post-render rewriter |
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

## Workspace Chrome 3.3

`design-tokens.css` possiede i token condivisi del chrome; `workspace-chrome-3-3.css` li applica soltanto a header/footer quando `stable-shell.js` espone il marker 3.3. Il bootstrap resta `native-workspace-3-2.js`: 3.3 non introduce un nuovo participant C0.1, non modifica business copy e non possiede navigation semantics. La falsificazione dedicata è `node v3/workspace-chrome-3-3-saturation.mjs`.

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
```

Per lavoro specifico sulla composizione 3.2 / chrome 3.3:

```bash
node v3/current-semantic-3-2.mjs
node v3/native-semantic-lattice-3-2-check.mjs
node v3/native-semantic-lattice-3-2-ui-check.mjs
node v3/workspace-chrome-3-3-saturation.mjs
node v3/native-semantic-lattice-3-2-saturation.mjs
node v3/native-semantic-lattice-3-2-stress.mjs
```

`npm run docs:saturation` falsifica il modello documentale. Trial modellati, source-string mutation executions, CI e browser runtime sono classi di evidenza diverse. Private vulnerability reporting, branch protection/ruleset e deployment controls richiedono osservazione esterna e non possono essere auto-certificati da questi file.
