# Sviluppo ICTC

## Setup

```bash
git clone https://github.com/Luke883i/ictc.git
cd ictc
nvm use
npm ci
./ictc.sh start --no-open
```

Node `>=22.16.0`; entrypoint `v3/server.mjs`; launcher `ictc.sh`.

## Prima di modificare

1. Parti da `docs/START_HERE.md`, quindi leggi `AGENTS.md` e `docs/authority-matrix.yaml`.
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
node v3/trama-engineering.mjs --intent "<intento umano>" --phase PLAN
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

Il debito noto di questo tipo è `D-RSC` nel `repositoryCoherenceDebt` di `v3/semantic-owner-contract.json`. Un finding interno si chiude solo quando causa/proiezione sono riallineate e il relativo falsificatore non riproduce più il drift. Un finding E3/E4 non si chiude con CI repository.

Per PR trajectory-sensitive vale un controllo ulteriore: se il body dichiara `planned` / `intentional-deviation` o afferma che convergence authority e workbook “si muovono insieme”, il **diff reale deve contenerli**. Altrimenti va corretta la dichiarazione prima del merge; il testo della PR non è evidenza del file change.

## Ciclo canonico

```bash
npm run check
npm run docs:check
node v3/authority-contract-check.mjs
node v3/docs-command-contract-check.mjs
node v3/documentation-authority-check.mjs
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

TRAMA applica **PLAN → DO → CHECK → ACT** come operating contract. PLAN osserva lo stato corrente, calcola confini locale/intermedio/globale, confronta il target atomico in `v3/trama-enterprise-dod.json` e compila le tre DoD. DO modifica il minimo reticolo causalmente chiuso. CHECK parte dal falsificatore più vicino, poi mutation/current rail/exact-head. ACT ricalcola l'intera traiettoria dopo nuovi fatti, PR e merge.

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

Prima di una modifica cross-cutting, `node v3/as-is-convergence.mjs` compila una projection authority-zero di gap, remediation finding, conditional/serial slice, rail esterni, drift documentale e disordine cognitivo UI. Gli owner originali restano autoritativi; la projection serve a non perdere debito, non a chiuderlo.

Le closure già registrate sono un **ratchet**: una ricomparsa silenziosa produce `BLOCKED_REOPEN_WITH_EVIDENCE`. Per campagne strategiche cross-abstraction il tier è 100k / 1M / 10M; i tier TRAMA generici 1k / 100k / 1M restano invariati. Al ceiling, nuova failure family o survivor richiedono remodelling. Saturazione semantica = `M+10k` senza novità; saturazione di compressione = `N+10k` senza ulteriore compressione lossless.

L'ordine cognitivo di prima superficie è `identity -> primary work/decision -> bounded list -> context/evidence -> technical detail`. Il browser può provare DOM, geometry e disclosure E2; comprensione, efficienza, trust calibration e tecnologie assistive restano E3-HUMAN.
