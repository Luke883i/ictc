# START HERE — presa in carico ICTC

Questa pagina è l'**entrypoint canonico del sistema documentale**. È una mappa di routing e non sostituisce le authority sostanziali registrate in `authority-matrix.yaml` e `documentation-manifest.json`.

## Percorso minimo corrente

1. [README](../README.md) — identità sintetica, processi, stack e runtime corrente.
2. [PRODUCT](PRODUCT.md) — scopo e confini di prodotto.
3. [AGENTS](../AGENTS.md) — invarianti globali di sviluppo.
4. [Authority matrix](authority-matrix.yaml) — owner eseguibili/documentali e regole di non-competizione.
5. [Architecture](11_ARCHITECTURE.md) — AS-IS browser -> runtime -> SQLite.
6. [Epistemic contract](02_EPISTEMIC_CONTRACT.md) — basis, authority e read/write boundary.
7. [End-user language](03_ENDUSER_LANGUAGE.md) e [User journeys](04_USER_JOURNEYS.md).
8. [Native Semantic Lattice 3.2](NATIVE_SEMANTIC_LATTICE_3_2_DOD.md) — information composition corrente.
9. [Workspace Design System](21_DESIGN_SYSTEM.md) — token e chrome owner 3.3, più mappa dell'effective presentation corrente.
10. [UI Fine-Tuning 3.4](UI_FINE_TUNING_3_4_DOD.md) — **effective transitional presentation closure**, non nuovo business/design-system owner.
11. [Testing](TESTING.md) e [Development](DEVELOPMENT.md).
12. [Documentation Standard](DOCUMENTATION_STANDARD.md), [Documentation Runtime 1.0](DOCUMENTATION_RUNTIME_1_0_DOD.md) e [documentation-manifest.json](documentation-manifest.json).

La data più recente non crea authority. `uiComposition=3.2`, `workspaceChrome=3.3` e `uiPresentation=3.4` sono assi distinti: il terzo registra l'effetto finale corrente e non canonizza la closure 3.4 come owner permanente.

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
| product intent/confini | `docs/PRODUCT.md` | product truth in prompt/PR/DoD |
| composition root UI | `v3/public/ui/active-experience.js` | seconda root |
| information composition | owner locali 3.2/3.2.1 | global post-render business rewriter |
| chrome globale | `design-tokens.css` + `workspace-chrome-3-3.css` | palette/header/footer owner paralleli |
| presentation closure corrente | `workspace-finetuning-3-4.css` come debito transitorio | `workspace-finetuning-3-5.css` |
| annotazione globale | `semantic-composition-runtime.js` | business copy/reorder nel kernel globale |
| decision presentation | `procedure-ui-ux-1-6.js` / C0.1 | seconda decision-presentation authority |
| processo | registry/adapter/policy + runtime nativo | ottavo processo business |
| evidenza | evidence/reference contracts | evidenza = conclusione |
| persistenza | Store + SQLite persistence | secondo business store |
| API | `docs/openapi.yaml` + handler runtime | endpoint UI-only paralleli |
| documentazione | standard + manifest + runtime check | authority implicita per data/nome file |
| test/release | current release suite + CI | gate PR alternativo |

## Regola di convergenza visuale

La closure 3.4 è oggi caricata dopo 3.3 e modifica l'output finale. È quindi registrata come **effective** ma resta un target di sottrazione. I test devono proteggere gli invarianti osservabili; **non devono richiedere che una causa legacy rimanga presente soltanto per dimostrare che la closure la sovrascrive**.

Il target naturale è:

`pochi owner chiari + pochi layer fisici`

senza perdita degli invarianti visivi introdotti da 3.4/3.4.1.

## Classi documentali

- **current**: authority AS-IS;
- **operating**: istruzioni operative;
- **policy**: regole repository/community;
- **lineage**: storia, non current truth;
- **source-input**: input originari;
- **roadmap**: futuro intenzionale;
- **generated**: evidenza derivata, mai hand-edited.

## Verifica minima

```bash
npm run docs:check
npm run docs:saturation
npm test
npm run release:check
node v3/ui-finetuning-3-4-check.mjs
```

Trial modellati, source-string mutations, browser runtime, user study e setting GitHub/deployment sono classi di evidenza differenti. Private vulnerability reporting, branch protection/ruleset e deployment controls richiedono osservazione esterna e non possono essere auto-certificati dai file del repository.
