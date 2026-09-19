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
