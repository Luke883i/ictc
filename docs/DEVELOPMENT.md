# Sviluppo ICTC

## Setup

```bash
git clone https://github.com/Luke883i/ictc.git
cd ictc
nvm use
npm ci
./ictc.sh start --no-open
```

Node `>=22.16.0`; entrypoint `src/bootstrap.mjs` (HTTP in `src/server.mjs`); launcher `ictc.sh`.

## Primo giorno, percorso standard senza AI

1. **Leggi e verifica:** [README](../README.md) → [PRODUCT](PRODUCT.md) → [ARCHITECTURE AS-IS](11_ARCHITECTURE.md); le descrizioni devono corrispondere agli owner eseguibili.
2. **Installa e avvia:** Node >=22.16.0, `nvm use`, `npm ci --ignore-scripts`, `./ictc.sh start --no-open`. La [configurazione](CONFIGURATION.md) identifica il percorso SQLite. Se la registry npm è inaccessibile, il setup è **non verificato**, non un PASS.
3. **Falsifica:** `npm run check`, `npm run docs:check`, poi il falsificatore specifico in [START_HERE](START_HERE.md); `npm test` non dimostra E3-HUMAN né E4-DEPLOY.
4. **Proponi:** risolvi l'owner nella [authority matrix](authority-matrix.yaml), confronta contratti e handler, documenta diff, test e rollback nella PR seguendo [CONTRIBUTING](../CONTRIBUTING.md). L'uso di TRAMA o AGENTS non è condizione per comprenderne il comportamento.

Questo è il percorso con strumenti standard del software. Le istruzioni AI possono assisterlo ma non trasferiscono autorità o bypassano i gate.

## Cold-start pratico: prova ripetibile senza storia AI

Questa è una **procedura per un ingegnere nuovo**, non un'attestazione di validazione E3-HUMAN. Eseguire in un checkout isolato su una SHA annotata, senza leggere prompt o chat pregresse:

1. Partire da [README](../README.md), identificare **Prodotto / Software / Repository**, quindi trovare i relativi owner con [START_HERE](START_HERE.md) e [Repository Atlas](REPOSITORY_ATLAS.md).
2. Preparare Node >=22.16.0, eseguire `npm ci --ignore-scripts`, poi `npm run check` e `npm run docs:check`. Se npm o una dipendenza sono irraggiungibili, segnare **BLOCKED**, non PASS.
3. In un terminale avviare `npm start`; in un secondo interrogare `curl -fsS http://127.0.0.1:4173/api/health` e registrare SHA, profilo, risposta ed exit code. Fermare il processo con Ctrl-C. Non esporre il server su una rete pubblica.
4. Scegliere una richiesta di manutenzione concreta: trovare l'owner, il test negativo più vicino e il comando di rollback. Non introdurre nuove authority, non cancellare file per assenza di import e non trasformare fixture in attestazioni di prodotto.
5. Su branch dedicato eseguire `git diff --check`, il falsificatore pertinente, `npm test` e, prima di proporre il rilascio, `npm run release:check`. Registrare la **exact HEAD**, i risultati negativi e gli eventuali skip; non chiamare questi check prova E3/E4.
6. Restituire una scheda minima: tre oggetti identificati; owner scelto; comando di avvio/health; mutazione/negativo rilevato; prova positiva; rollback; limiti, blocchi e domande residue. Un revisore indipendente deve valutare tempi, errori di interpretazione e assistenza necessaria secondo criteri fissati *prima* della sessione.

**Condizione di chiusura:** documenti e oracoli automatici possono dimostrare la *percorribilità tecnica* entro i test eseguiti; l'assenza di guida durante un cold-start e l'effettiva comprensione devono essere osservate su persone, non dedotte dalla presenza di questa checklist.


## Esercizio O1 — prima modifica reversibile su clone vergine

**Scopo:** dimostrare che un nuovo contributor sa orientarsi, produrre un controesempio, correggerlo e consegnare un diff senza leggere la genealogia delle PR o istruzioni AI. **Prerequisiti:** una clone di ICTC, Node >=22.16.0, Git e accesso alle dipendenze npm; usare esclusivamente un branch isolato con stato applicativo sintetico. L'esempio e **documentale e non tocca il runtime o dati aziendali**.

1. Segna `git rev-parse HEAD`, verifica `git status --short` vuoto, leggi il README e individua l'authority prodotto (`docs/PRODUCT.md`), software (`docs/11_ARCHITECTURE.md`), repo (`docs/START_HERE.md`).
2. Crea il branch `docs/onboarding-exercise` e avvia `npm ci --ignore-scripts`; esegui `npm run check` e `npm run docs:check`. Annota exit code o blocco reale, non un PASS inferito.
3. Esegui `npm run demo` in un terminale e `curl -fsS http://127.0.0.1:4173/api/health` nell'altro; arresta con Ctrl-C. HTTP 200 non attesta persistenza al riavvio.
4. **Falsificatore fisico:** aggiungi temporaneamente in fondo a `docs/DEVELOPMENT.md` un collegamento Markdown a `DOCUMENTO_ONBOARDING_INESISTENTE.md` (testo del link: "link deliberatamente inesistente"). `npm run docs:check` deve fallire per `broken local link`; conserva l'output. Se non fallisce, l'esercizio e NO-GO.
5. Rimuovi il link errato. Introduci un piccolo chiarimento vero e circoscritto in `docs/DEVELOPMENT.md`, senza cambiare gli owner; verifica il collegamento all'authority con `docs/START_HERE.md`. Riesegui `npm run docs:check` e `git diff --check`.
6. **Prima di attribuire test a uno SHA:** rigenera la Bussola dall'owner eseguendo `node --input-type=module -e 'import {repositoryCompass} from "./src/lib/trama-engineering.mjs"; import {writeFileSync} from "node:fs"; writeFileSync("docs/ENGINEERING_COMPASS.md",repositoryCompass())'`. Poi esegui `git add docs/DEVELOPMENT.md docs/ENGINEERING_COMPASS.md`, `git diff --cached --check`, `git commit -m "docs: first bounded onboarding edit"` e verifica che `git status --porcelain` sia vuoto. La HEAD ora rappresenta i byte realmente candidati, inclusa ogni proiezione generata.
7. Registra `git rev-parse HEAD`, esegui `npm run docs:check` e `npm test` **dopo il commit sulla stessa HEAD**, registra exit code, eventuali skip e il tree `git rev-parse HEAD^{tree}`. Se i test modificano file tracciati, arrestati: serve una nuova HEAD e ripetere i gate.
8. Produci la scheda per il reviewer: **intento, owner, preimage, postimage, predicato positivo, mutante respinto, differenza, rollback, evidenza e gap**. Per annullare il commit dell'esercizio usa `git revert <sha-del-commit>` e ricontrolla il tree; `git restore -- docs/DEVELOPMENT.md` si applica soltanto alle modifiche **non committate** e non e un rollback di commit.

**Criterio automatico:** le route e i comandi devono esistere; il mutante deve essere respinto e la correzione accettata. **Criterio umano E3-HUMAN:** un ingegnere che non ha partecipato al progetto deve svolgere il compito senza suggerimenti, con tempi, errori e richieste di aiuto registrati da un osservatore indipendente. Fino a quel momento: `BLOCKED_EXTERNAL`, anche con tutti i controlli automatici verdi.

## Prima di modificare

### Prima di rimuovere file o «semplificare» una documentazione

Leggere la [policy di preservazione](DOCUMENTATION_STANDARD.md) e l'[Atlas](REPOSITORY_ATLAS.md). Verificare i consumer attraverso import, manifest, `package.json`, workflow, caricamenti dinamici, URI HTTP pubbliche, fixture e storia delle PR; registrare il tipo di arco, non soltanto la sua presenza. Le PR possono segnalare co-change o supersessione, ma una PR merged non prova che un file corrente sia inutilizzato. Per il ritiro: prova lossless dei claim, rimozione materiale in checkout isolato, mutation/functional oracles, esito e rollback. In mancanza di qualunque veto verificato, lo stato resta `HOLD_UNKNOWN`, non `DELETE`.

Nessun nuovo registro di file diventa authority: il censimento e i punteggi sono proiezioni derivate dall'albero Git, dall'owner matrix e dalle osservazioni dei test.

1. Parti da `README.md` → `docs/START_HERE.md` e `docs/authority-matrix.yaml`. Se usi un assistente AI consulta anche `AGENTS.md` (opzionale per lo sviluppo umano).
2. Identifica oggetto governato, authority owner e claim boundary.
3. Formula il bug come invariante falsificabile, non come desiderio UI.
4. Cerca la correzione nel proprietario esistente; un nuovo layer richiede prova che nessun owner corrente possa assorbirla.
5. Per temporalità, lega la decisione alla basis/versione e definisci cosa accade quando cambia.
6. Per external evidence, distingui “osservata” da “version-bound/usable”.
7. Per AI, preferisci `metadata.epistemicEffects`; non usare action naming come nuova authority.
8. Per cross-process, conserva draft semantics, typed predicate e bounded lineage.
9. Per UI condivisa, C0.1 deve restare l'ultimo converger semantico.
10. Se cambia documentazione current/policy/operating aggiorna manifest e `docs:check`; se cambia il significato pubblico aggiorna l'authority sostanziale, non soltanto README.

## TRAMA adaptive intake

Prima di fissare una nuova slice, compila l'intento con:

```bash
node src/lib/trama-engineering.mjs --intent "<intento umano>" --phase PLAN
```

TRAMA applica **PLAN → DO → CHECK → ACT** sopra gli owner già canonici. PLAN ricalcola vicinato, dipendenze, owner/writer, evidence/oracle, impatto umano/deployment e distanza dall'Enterprise Candidate; DO modifica il minimo reticolo coerente; CHECK usa invarianti, mutation tier adattivo (1k/100k/1M), deletion oracle ed exact-head evidence; ACT ricalcola la traiettoria dopo ogni risultato PR e merge. La roadmap precedente è un'ipotesi, non un vincolo: se i fatti correnti la falsificano, si rifattorizza la slice invece di forzare il piano.

La proiezione è a authority zero e non persiste un cursor. Enterprise Candidate resta proprietà dell'authority di convergenza e richiede gli oracoli esterni pertinenti; semantic mutation non sostituisce evidenza umana, deployment o governance server-side.

### DoD a tre livelli

- **Globale:** nessuna nuova authority/SOT, reticolo gerarchico completo, target Enterprise Candidate non auto-attestabile, gate TRAMA nella rail current.
- **Intermedia:** IntentCard senza burden tecnico umano, neighborhood completo, tier adattivo, PDCA con ACT globale/locale, one-writer e consolidation-first fail-closed.
- **Locale:** contratto/runtime/check/saturation coerenti, 1M zero-survivor + deletion oracle, exact PR HEAD e GOV-01F prima del merge.

## Metodo ingegneristico canonico

Il ciclo di sviluppo è una sequenza epistemica, non una sequenza di file:

`observe -> bound -> owner -> falsifier -> minimal change -> adversarial mutation -> exact-head evidence -> human merge`

1. **Observe** — ricostruisci il fatto corrente da owner eseguibili e, se serve un live Git fact, da Git/GitHub.
2. **Bound** — dichiara claim boundary, non-goal e proprietà esterne non verificabili dal repository.
3. **Owner** — modifica l'owner esistente; una seconda authority richiede una responsabilità realmente nuova.
4. **Falsifier** — formula il difetto come invariante e identifica il feedback più vicino prima di cambiare codice.
5. **Minimal change** — chiudi la causa con la slice semantica più piccola; "slice" significa responsabilità coerente, non numero minimo di file.
6. **Adversarial mutation** — prova failure family e controesempi; il numero di trial non è probabilità di correttezza.
7. **Exact-head evidence** — riesegui il rail pertinente sulla head finale; verde precedente o output derivato non chiudono la PR.
8. **Human merge** — l'automazione propone e falsifica; l'accettazione resta una decisione di repository governance.

### Stop condition

Fermati quando la causa è chiusa nell'owner corretto, il falsificatore discrimina la regressione, le authority non si sono allargate, il boundary è documentato e l'exact-head evidence richiesta è convergente. Non continuare ad aggiungere layer, test o copy solo per aumentare il volume di evidenza.

Per software archaeology assistita da AI, usa [Repository Atlas](REPOSITORY_ATLAS.md): distingue checkout inference da live Git facts e definisce il minimo GitHub connector read-only utile alla presa in carico.

### PR = unità di esecuzione semantica

Una PR raccoglie **una responsabilità falsificabile**, non necessariamente un solo file o una modifica al runtime. La sua HEAD è la candidate state eseguita. I check GitHub applicabili devono convergere sulla stessa HEAD; se un agente o una persona aggiunge un commit, nasce una nuova candidate state e il verde precedente resta solo genealogia.

Il loop operativo è esterno al runtime applicativo: utente/agente osserva → modifica → pubblica HEAD → GitHub esegue → utente/agente legge il failure → corregge → ripubblica. L'orchestratore non diventa test authority né merge authority. Il merge avviene solo sull'exact head accettata secondo la governance applicabile; il nuovo commit di `main` riceve poi evidenza post-merge separata.

Il branch è trasporto e segnalibro, non current truth. Può restare dopo il merge per archeologia oppure essere eliminato senza cancellare commit/PR history. Per confrontare due momenti usare gli SHA, non il conteggio o il nome dei branch.

### Freshness non basta

Una receipt fresca dice che i suoi input non sono cambiati; **non** dimostra che README, START_HERE, OpenAPI, authority map ed executable owner dicano la stessa cosa. Per una modifica current confronta quindi la frase/proiezione con il proprietario eseguibile e aggiungi o aggiorna il falsificatore della failure family.

Il debito noto di questo tipo è `D-RSC` nel `repositoryCoherenceDebt` di `tests/contracts/semantic-owner-contract.json`. Un finding interno si chiude solo quando causa/proiezione sono riallineate e il relativo falsificatore non riproduce più il drift. Un finding E3/E4 non si chiude con CI repository.

Per PR trajectory-sensitive vale un controllo ulteriore: se il body dichiara `planned` / `intentional-deviation` o afferma che convergence authority e workbook “si muovono insieme”, il **diff reale deve contenerli**. Altrimenti va corretta la dichiarazione prima del merge; il testo della PR non è evidenza del file change.

## Ciclo canonico

```bash
npm run check
npm run docs:check
node tests/verification/authority-contract-check.mjs
node tests/verification/docs-command-contract-check.mjs
node tests/verification/documentation-authority-check.mjs
npm test
npm run release:check
```

Per modifiche alla composizione UI 3.2 usa i gate `native-semantic-lattice-3-2-*` elencati in `docs/TESTING.md`. Per modifiche al reticolo documentale usa anche `npm run docs:saturation`.

## Commit

Branch breve, mai push diretto su `main`. Commit semanticamente atomici: runtime, causalità, UI constitution, falsificazione, documentazione. Non mischiare fix con l'allentamento del test che lo rileva.

## Pull request

Usa `.github/PULL_REQUEST_TEMPLATE.md`. La PR deve dichiarare affected authority, scope/non-goal, claim boundary, rail corrente, test realmente eseguiti, compatibility, residual risk e rollback. Una campagna di simulazioni va descritta con operatori/failure family/holdout, non come “milioni di prove = corretto”.

Le vulnerabilità non entrano nel bug form pubblico: seguono `SECURITY.md`.

## Persistenza

Usa runtime directory isolate nei test. `state.sqlite` è la SOT locale; `state.json` è solo legacy import input. Non editare lo storage reale dell'utente per costruire fixture.

## Definizione di done

Una slice è done quando: causa chiusa nel proprietario corretto, falsificatore presente, documentazione AS-IS coerente, nessuna authority widening, compatibilità/residui dichiarati e exact PR HEAD verde. “Done slice” non significa production ready.

## GOV-TRAMA-COMPASS-1 — sviluppo AI-guidato

TRAMA applica **PLAN → DO → CHECK → ACT** come operating contract. PLAN osserva lo stato corrente, calcola confini locale/intermedio/globale, confronta il target atomico in `tests/contracts/trama-enterprise-dod.json` e compila le tre DoD. DO modifica il minimo reticolo causalmente chiuso. CHECK parte dal falsificatore più vicino, poi mutation/current rail/exact-head. ACT ricalcola l'intera traiettoria dopo nuovi fatti, PR e merge.

La **Bussola** `docs/ENGINEERING_COMPASS.md` è una projection generated per l'utente non tecnico: mostra COSA VUOI, DOVE SIAMO, una sola prossima slice e DOVE STIAMO ANDANDO. Non è SOT e non promuove status.

### Documentation Delta

Ogni semantic change dichiara il delta documentale: aggiorna solo gli owner current/policy/operating realmente impattati e rigenera la Bussola. Mass rewrite, lineage recente o un generated artifact non diventano authority. Merge non equivale a completion o release; rollback, exact-head e post-merge verification restano distinti.

## GOV-TRAMA-RECONCILE-1 — GLOBAL_ACT e riconciliazione

Quando l'intento è una prosecuzione generica (`ora che si fa`, `prosegui`, `what next`), non si riprende meccanicamente la slice precedente. Si esegue un **GLOBAL_ACT**:

1. osservare exact-head, owner, finding e gate correnti;
2. calcolare confini ontologici locali, intermedi e globali;
3. classificare ogni residuo legacy per ruolo corrente;
4. confrontare lo stato osservato con le 16 dimensioni / 64 DoD atomiche di Enterprise Candidate;
5. riconciliare il planning canonico quando diverge dall'evidenza;
6. scegliere una sola conditional slice minima oppure STOP;
7. aggiornare insieme authority, workbook e Bussola quando cambia la semantica di traiettoria.

Il valore corrente del critical path non viene replicato in questo documento: appartiene a `docs/convergence/convergence-authority.json` e viene ricalcolato a ogni GLOBAL_ACT dagli owner e dai blocker osservati. Una guida operativa descrive il metodo, non congela il cursore vivo.

Lo stato `in-progress` è intenzionale: evita di collassare “capacità sostanzialmente implementata con blocker residuo” in `todo` o `done`. Una closure repository-side non chiude E3-HUMAN, E3-GOV o E4-DEPLOY.


## GOV-ASIS-CONVERGENCE-1 — chiusura AS-IS e strategic entropy

Prima di una modifica cross-cutting, `node src/lib/as-is-convergence.mjs` compila una projection authority-zero di gap, remediation finding, conditional/serial slice, rail esterni, drift documentale e disordine cognitivo UI. Gli owner originali restano autoritativi; la projection serve a non perdere debito, non a chiuderlo.

Le closure già registrate sono un **ratchet**: una ricomparsa silenziosa produce `BLOCKED_REOPEN_WITH_EVIDENCE`. Per campagne strategiche cross-abstraction il tier è 100k / 1M / 10M; i tier TRAMA generici 1k / 100k / 1M restano invariati. Al ceiling, nuova failure family o survivor richiedono remodelling. Saturazione semantica = `M+10k` senza novità; saturazione di compressione = `N+10k` senza ulteriore compressione lossless.

L'ordine cognitivo di prima superficie è `identity -> primary work/decision -> bounded list -> context/evidence -> technical detail`. Il browser può provare DOM, geometry e disclosure E2; comprensione, efficienza, trust calibration e tecnologie assistive restano E3-HUMAN.


## TRAMA E2E — ferro → utente

**TRAMA E2E** è il nome canonico semplice del controllo multi-astrazione. Non introduce una nuova authority: riusa gli otto campaign layer di `tests/contracts/trama-reconcile-contract.json` da `L0-FERRO` a `L7-ENTERPRISE` e le 24 famiglie metodo di `tests/contracts/trama-engineering-contract.json`, compresse nei cluster `UNDERSTAND / EXECUTE / PROTECT / EXPERIENCE / CONTROL / FALSIFY`.

Ogni PR dichiara i layer toccati e un witness di allineamento con i layer adiacenti. Il gate TRAMA gira su **ogni pull request**, lega base/head Git, valida il body concreto, verifica purpose admission dei nuovi file e impedisce `NO_SEMANTIC_DELTA` quando cambia un input semanticamente tracciato. Il repository-purpose census resta globale: si elimina solo ciò che è qualificato per il ritiro e coperto da deletion oracle; non si cancella per età o naming.


## LEVEL-ICTC/1 — minimal contract for transferable evidence-driven development

**Status: method-transfer candidate (SOURCE), not an ICTC implementation, CORA
installation or runtime/product endorsement.** This paragraph consumes the
existing ICTC owners. No new authority, CI workflow, service, procedure, source
registry, state machine or decision maker is introduced.

1. **Human intention (A0):** a bounded product requirement specifies actors,
   object, expected outcome, exclusions, effects and permissions. Its
   classification cannot change because an AI proposal sounds credible.
   Use the existing [intent-convergence DoD](PROCEDURE_INTENT_CONVERGENCE_DOD_2026-08-18.md)
   and [authority matrix](authority-matrix.yaml), not a new owner.
2. **Backward acceptance graph:** a top-level outcome requires all named
   leaves: correct owner/classification, authorized state transition,
   persistence/readback, negative oracle and independent human decision
   where applicable. Missing leaves remain BLOCKED, never compensated by
   model coverage or a favorable semantic score.
3. **One change unit:** observe actual original Git BASE/TREE, enumerate
   consumers and propose a reversible slice with real source change,
   tests, rollback and PR. Do not alter a protected workflow merely to
   obtain a convenient new gate. Reuse existing Node/CI owners.
4. **Counterexamples:** distinguish `tests/verification/saturation.mjs` (136 finite
   scenarios / 12 *preassigned* novelty primitives) from
   `tests/verification/release-readiness-e2-product-mutants.mjs` (real file changes in
   an isolated copy and a real E2 oracle). A survivor reopens the
   relevant leaf. The models cannot substitute for runtime results.
5. **Adaptive continuation:** a coding agent proposes the next unresolved
   leaf; CORA's existing portable ZIP can carry a read-only source
   dossier. Total N is unknown until the actual rounds occur. A changed
   contract requires review; repeated source/evidence-identical rounds
   call for replanning. A conversational "done" is not an execution receipt.
6. **Exact-revision delivery:** bind final candidate and test claims to
   the same real PR HEAD SHA and known build/test environment. New
   commits invalidate prior final-HEAD conclusions; postmerge requires
   new-main readback. E3-HUMAN/E4-DEPLOY remain separate.

**Adversarial conditions:** forged `sourceClass`, skipped RN-01
classification, second owner, forged reviewer, wrong-SHA CI receipt,
surviving physical mutant or changed protected original must refuse
its dependent conclusion. Product/review remain `BLOCKED_EXTERNAL`
without original witnesses.

**Why the separate game demo matters:** CORA's proposed LEVEL experiment
applies contract→slice→test→evidence→PR to an original web platform game
in a new repo. ICTC contributes *documented methodological analogies*;
it does not install CORA, adopt the game or prove shared execution.

[Cross-project method](https://github.com/Luke883i/cora/blob/docs/readme-product-multichannel-pr47/docs/CONTINUOUS_DEVELOPMENT.md)
is subordinate to [the original ICTC agent contract](../AGENTS.md).
This is **documentation only**, not a migration, release or product gate.
