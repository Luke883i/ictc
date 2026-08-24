# START HERE — presa in carico ICTC

Questa pagina è la mappa canonica per un informatico che entra nel repository. È una mappa, non una nuova autorità.

## Percorso minimo: 15 minuti

1. `README.md` — prodotto, sette processi, stack, limiti e runtime corrente.
2. `AGENTS.md` — invarianti epistemici e vincoli globali di sviluppo.
3. `docs/authority-matrix.yaml` — chi possiede runtime, UI, linguaggio, persistenza e test.
4. `docs/11_ARCHITECTURE.md` — architettura AS-IS e flussi browser → runtime → SQLite.
5. `docs/02_EPISTEMIC_CONTRACT.md` — versioni, basis, authority, read/write boundary.
6. `docs/NATIVE_SEMANTIC_LATTICE_3_2_DOD.md` — composizione UI/UX corrente e DoD 3.2.
7. `docs/TESTING.md` — gate canonici, falsificazione ed exact-head CI.
8. `docs/DEVELOPMENT.md` — flusso di sviluppo e convenzioni operative.
9. `docs/DOCUMENTATION_STANDARD.md` — classi documentali, current/lineage e DoD di presa in carico.

Per il linguaggio end-user usa `docs/03_ENDUSER_LANGUAGE.md`; per i sette processi usa il registry eseguibile e non documenti storici di singole PR.

## Mappa degli owner correnti

| Se devi cambiare | Parti da | Non creare |
|---|---|---|
| composition root UI | `v3/public/ui/active-experience.js` | una seconda root |
| contratto/copy 3.2 | `native-semantic-lattice-3-2.js` | copy locale divergente |
| composizione locale | owner locale + `native-workspace-3-2.js` bootstrap | un nuovo global post-render rewriter |
| annotazione globale | `semantic-composition-runtime.js` | business copy/reorder nel kernel globale |
| decision presentation | `procedure-ui-ux-1-6.js` / C0.1 | una seconda presentation authority |
| linguaggio business | `03_ENDUSER_LANGUAGE.md` + Semantic Foundation | label locali divergenti |
| processo | registry/adapter/policy + runtime nativo | un ottavo processo business |
| azione umana | `semantic-foundation-actions.js` + annotation C0.1 | write authority nel browser |
| evidenza | evidence/reference contracts | equivalenza evidenza = conclusione |
| persistenza | Store + SQLite persistence | un secondo business store |
| API | `docs/openapi.yaml` + handler runtime | endpoint UI-only paralleli |
| test/release | current release suite + CI | un gate PR alternativo |

## Native Semantic Lattice 3.2

La regola UI corrente è **work first, explanation on demand**. `active-experience.js` installa gli owner locali 3.2 e solo dopo il kernel globale di annotazione. Il kernel non possiede la gerarchia locale e non deve introdurre copy business o riordini DOM.

Coverage obbligatoria: Home, elenco Processi, RN-01, EC-01, AO-01, MC-01, AP-01, RC-01, AR-01, Evidenze ICTC, EP-01, Admin e Configurazione AI/dialoghi. Una nuova superficie non è completa finché non entra nel census corrente e nei gate 3.2.

## Ordine delle fonti

1. owner eseguibile + `docs/authority-matrix.yaml`;
2. AGENTS/invarianti globali e locali;
3. architecture, epistemic contract, end-user language, testing/development;
4. DoD della slice corrente;
5. documenti storici e audit di lineage.

I documenti storici conservano lineage ma non sono autorità corrente. La data più recente non crea authority da sola. Se per capire l'owner corrente serve ricostruire una vecchia PR, la mappa è incompleta e va corretta invece di aggiungere un secondo owner.

## Verifica minima prima di una modifica

```bash
npm test
npm run release:check
node v3/current-semantic-3-2.mjs
node v3/native-semantic-lattice-3-2-check.mjs
node v3/native-semantic-lattice-3-2-ui-check.mjs
node v3/native-semantic-lattice-3-2-saturation.mjs
node v3/native-semantic-lattice-3-2-stress.mjs
```

Per modifiche UI verificare anche `v3/browser-information-value.py` e la exact PR HEAD CI. I trial modellati sono bounded model evidence; non sostituiscono browser runtime, branch protection server-side o assurance indipendente.
