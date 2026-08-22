# START HERE — presa in carico ICTC

Questa pagina è la mappa canonica per un informatico che entra nel repository. È una mappa, non una nuova autorità.

## Percorso minimo: 15 minuti

1. `README.md` — prodotto, sette processi, stack, limiti e runtime corrente.
2. `docs/authority-matrix.yaml` — chi possiede cosa: runtime, UI, linguaggio, persistenza e test.
3. `docs/11_ARCHITECTURE.md` — architettura AS-IS e flussi browser → runtime → SQLite.
4. `docs/02_EPISTEMIC_CONTRACT.md` — versioni, basis, authority, read/write boundary.
5. `docs/SEMANTIC_COMPOSITION_3_1_DOD.md` — gerarchia UI/UX corrente, coverage di tutte le superfici e falsificazione 3.1.
6. `docs/TESTING.md` — gate canonici, mutation/saturation ed exact-head CI.
7. `docs/DEVELOPMENT.md` — flusso di sviluppo e convenzioni operative.
8. `docs/DOCUMENTATION_STANDARD.md` — classi documentali, navigazione current/lineage e DoD di presa in carico.

Per il linguaggio end-user usa `docs/03_ENDUSER_LANGUAGE.md`; per i sette processi usa il registry eseguibile e non documenti storici di singole PR.

## Mappa degli owner correnti

| Se devi cambiare | Parti da | Non creare |
|---|---|---|
| composizione e gerarchia UI | `semantic-composition-model.js` + `semantic-composition-runtime.js` | un nuovo post-render copy rewriter |
| decision presentation | `procedure-ui-ux-1-6.js` / C0.1 | una seconda presentation authority |
| linguaggio business | `03_ENDUSER_LANGUAGE.md` + Semantic Foundation | label locali divergenti |
| processo | registry/adapter/policy + runtime nativo | un ottavo processo business |
| azione umana | `semantic-foundation-actions.js` + annotation C0.1 | write authority nel browser |
| evidenza | evidence/reference contracts | equivalenza evidenza = conclusione |
| persistenza | Store + SQLite persistence | un secondo business store |
| API | `docs/openapi.yaml` + handler runtime | endpoint UI-only paralleli |
| test/release | current release suite + CI | un gate PR alternativo |

## Semantic Composition 3.1

La regola UI corrente è **work first, explanation on demand**. Le primitive comuni classificano identity, context, attention, decision, action, evidence, consequence, boundary e technical; ogni superficie applica poi un adapter coerente con la propria natura.

Coverage obbligatoria: Home, elenco Processi, RN-01, EC-01, AO-01, MC-01, AP-01, RC-01, AR-01, Evidenze ICTC, EP-01, Admin e Configurazione AI/dialoghi. Una nuova superficie non è completa finché non entra nel census 3.1 e nei mutation gate.

## Ordine delle fonti

1. owner eseguibile + authority matrix;
2. AGENTS/invarianti globali e locali;
3. architecture, epistemic contract, end-user language, testing/development;
4. DoD della slice corrente;
5. documenti storici e audit di lineage.

La data più recente non crea authority da sola. Se per capire l'owner corrente serve ricostruire una vecchia PR, la mappa è incompleta: correggere la mappa invece di aggiungere un secondo owner.

## Verifica minima prima di una modifica

```bash
npm test
npm run release:check
node v3/semantic-composition-3-1-check.mjs
node v3/semantic-composition-3-1-ui-check.mjs
node v3/documentation-composition-3-1-check.mjs
node v3/semantic-composition-3-1-saturation.mjs
```

Per modifiche UI verificare anche il browser journey `v3/browser-information-value.py` e la exact-head CI.
