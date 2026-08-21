# ICTC — Integrated Compliance Tower Control

ICTC è un **sistema locale di governance della conoscenza di compliance**. Registra oggetti di lavoro, trasformazioni, decisioni umane, evidenze e relazioni attraverso sette Processi di Compliance bounded, preservando la differenza tra ciò che ICTC ha osservato, ciò che l'AI propone, ciò che una persona decide e ciò che richiederebbe autorità o assurance esterna.

La navigazione canonica è **Home / Processi di Compliance / Evidenze ICTC**.

ICTC non è una certificazione, un parere legale, un auditor autonomo, un motore di verdetti di conformità né un security perimeter. Un mapping non prova conformità o efficacia; un hash non prova autenticità esterna; un rating di rischio non è una probabilità oggettiva; un'approvazione interna non è assurance indipendente.

## Modello logico

La regola costituzionale è: **registrare non significa concludere**. Il prodotto mantiene esplicitamente queste non-equivalenze:

```text
osservato ≠ vero nel mondo
proposto ≠ deciso
mapping ≠ conformità / efficacia
completato ≠ chiuso e verificato
evidenza ≠ conclusione
rating ≠ probabilità oggettiva
approvazione interna ≠ assurance indipendente
integrità software ≠ autenticità esterna
CI verde ≠ deployment assurance
```

Il flusso cognitivo comune è:

```text
oggetto governato
  → trasformazione registrata
  → checkpoint umano quando richiesto
  → decisione version-bound
  → evidenza / receipt / limite
  → ReviewNeed se cambia la base
  → nuova decisione, senza riscrivere retroattivamente la precedente
```

ICTC mantiene tre reticoli distinti e correlati, che non devono collassare in un unico grafo onnisciente:

1. **reticolo business** — handoff tra i sette processi; crea draft nativi, non trasferisce decisioni;
2. **reticolo epistemico/versionale** — SubjectVersion, EpistemicStep, basis, producer e causalità;
3. **reticolo evidenza/claim** — dossier, receipt, claim bounded e limitation.

## I sette Processi di Compliance

| Codice | Processo | Oggetto governato |
|---|---|---|
| RN-01 | Monitoraggio normativo e fonti | fonti, cambiamenti e candidati da verificare |
| EC-01 | Incidenti e quasi incidenti | fatti, formulazioni/versioni e decisioni su un evento |
| AO-01 | Inventario di sistemi e oggetti | identità governate di sistemi, servizi, dati, fornitori, processi, policy e controlli |
| MC-01 | Standard e Controlli | standard, requisiti, uso organizzativo, applicabilità e mapping |
| AP-01 | Azioni correttive | impegni di remediation fino alla chiusura verificata |
| RC-01 | Rischi di compliance | scenari, assessment inerenti/residui, trattamento e review |
| AR-01 | Questionari e verifiche | richieste, response-set versionati, evidenze e limiti |

**EP-01 · Reticolo epistemico** è cross-cutting e non diventa un ottavo processo business. Osserva la storia semantica registrata e le derivazioni bounded; non crea autorità business da inferenza.

## Infrastruttura tecnologica AS-IS

ICTC è intenzionalmente minimale e locale:

```text
browser
  v3/public · HTML/CSS/JavaScript vanilla
        ↓ HTTP JSON
v3/server.mjs
        ↓
v3/runtime/* · domain · enterprise · ai
        ↓
v3/store.mjs
        ↓
v3/sqlite-state-persistence.mjs
        ↓
state.sqlite
  snapshot          stato corrente per revisione + cache replay recente
  audit             ledger hash-linked
  subject_payload   payload content-addressed
  subject_version   storia semantica append-oriented
  epistemic_step    causalità/autorità append-oriented
  command_result    autorità durevole di replay/idempotenza comando
        ↓
canonical projections + write OutcomeEnvelope/receipt
        ↓
Home · Processi di Compliance · Evidenze ICTC · EP-01
```

Richiede Node.js `>=22.16.0`; il runtime canonico è ESM e usa `node:sqlite`. SQLite opera in WAL con `synchronous=FULL`. ICTC **non è un event store completo**: il current snapshot non viene ricostruito esclusivamente dall'audit ledger. `transactionAsOf` e `validAsOf` sono distinti nel ProjectionContext, ma la selezione storica transaction-time non è ancora implementata e fallisce chiusa.

Il default bind è `127.0.0.1:4173`. TLS, IdP, secret management, backup/restore, malware scanning, monitoring, HA e hardening host restano responsabilità del deployment.

## Semantic Closure 2.8

La slice di consolidamento 2.8 chiude finding di secondo ordine senza introdurre nuovi owner:

- **RC-01 multi-cycle**: una nuova review inerente apre un nuovo ciclo e non resta oscurata da un residual precedente; i nuovi trattamenti sono legati alla review corrente tramite digest. I trattamenti legacy privi di digest restano compatibili soltanto se temporalmente successivi alla review effettiva corrente.
- **Evidenza esterna**: un URL solamente osservato resta registrabile ma non è `usable` come evidenza decisionale; per essere utilizzabile deve conservare `observedVersion` oppure un digest. ICTC non monitora autonomamente il contenuto remoto.
- **RN-01 contract parity**: l'attivazione del piano resta un checkpoint umano esplicito ma non richiede una motivazione testuale inesistente nel runtime/UI.
- **Causalità AI**: le action legacy note che producono output AI sono pin-nate a semantica `proposed`/producer AI; il forward contract resta `epistemicEffects` esplicito. In assenza di effect esplicito, una proposta legacy conserva una basis tecnica registrata tramite predecessor SubjectVersion o digest dell'input del comando.
- **Handoff cross-process**: i 24 archi hanno predicate intent-specifici; la lineage è bounded (`maxDepth=8`) e blocca il ritorno verso un processo già visitato. Il draft target non eredita decisioni, rating, applicabilità, efficacia o sufficienza probatoria.
- **UI C0.1**: `ictc:rendered`, `ictc:surface-changed`, `ictc:context-changed` e `ictc:projection-committed` convergono nel lifecycle costituzionale. Gli enhancer 2.7 restano compatibilità non-finale; C0.1 è l'ultimo converger semantico.
- **OutcomeEnvelope**: il principio corrente è “nessuna entità raw di persistenza in UI”. Le letture usano canonical projections con authority/limits; le write restituiscono OutcomeEnvelope/receipt. Non ogni oggetto letto è letteralmente un envelope schema.

Il record di closure accettata è in `docs/SEMANTIC_CLOSURE_2_8_DOD.md`.

## Runtime Stabilization 2.9

La stabilizzazione 2.9 consuma debito runtime reso misurabile dalla costituzione senza introdurre un nuovo owner:

- **Replay durevole**: `commandResults` resta una cache snapshot bounded a 500 entry, mentre `command_result` in SQLite conserva l'autorità di replay/idempotenza oltre l'eviction della cache e attraverso il riavvio del runtime.
- **Authority conservation**: il nome di una action sconosciuta non può più produrre `decided` o `attested`; le compatibilità decisive sono enumerate solo quando preservano il comportamento pre-2.9. Nuova autorità semantica richiede `metadata.epistemicEffects` esplicito.
- **AI fail-safe**: output AI noti privi di token `.ai.` — inclusi monitoring job, workbench planning/run e contribution enrichment — sono classificati `proposed` con producer `ai-provider`; un nome AI sconosciuto può solo degradare a `proposed`, mai a human authority.
- **Gate provenance**: i gate versionati 2.3–2.9 sono membri diretti della current release suite, così il fallimento è attribuito al falsificatore reale e non a un wrapper con side effect.

Il DoD, il vocabolario di mutazione e i limiti della slice sono in `docs/RUNTIME_STABILIZATION_2_9_DOD.md`.

## Autorità e temporalità

Una mutazione serializzata dal `Store` può produrre SubjectVersion, semantic manifest, EpistemicStep, evento audit e receipt, poi persiste e verifica il readback. I binding servono a sapere **su quale versione** una decisione è stata presa. Se la base interna cambia, `ReviewNeed` apre nuovo lavoro di riesame; la decisione precedente resta nella storia invece di essere trasformata automaticamente in falsa o vera.

Per RC-01 il ciclo corrente è determinato dalla review più recente tra inherent e residual. Un trattamento nuovo conserva `assessmentSha256`; una review successiva apre un nuovo ciclo e richiede un nuovo trattamento se necessario.

Per evidenze esterne la stabilità minima per un checkpoint probatorio è `observedVersion` o digest. Questo rende esplicita l'identità della base osservata; non prova autenticità, vigenza, completezza o sufficienza sostanziale della fonte.

## UI e costituzione C0.1

`v3/public/ui/active-experience.js` è l'unico composition root. Le responsabilità finali seguono:

```text
harmonization → presentation → integrity → journey → annotation
```

`presentation` possiede in modo esclusivo la decision-presentation. Il microtask è soltanto un confine di coalescing: non decide la precedenza. Il lifecycle gestisce reentrancy come replay e fallisce chiuso dopo 32 cicli non convergenti. Gli enhancer storici possono preparare DOM/meccaniche, ma ogni evento semantico coperto termina con la convergenza costituzionale.

## Evidenze ed export

**Evidenze ICTC** segue la catena **pratica → evidenza → limite**. PDF, XML, Markdown e ZIP sono rappresentazioni dello stesso dossier autorizzato (`same-as-read`): un export non amplia RBAC o scope. Receipt, checksum e audit binding dimostrano proprietà del record software entro il modello ICTC; non equivalgono a firma qualificata, trusted timestamp, WORM o non-ripudio.

## AI

L'AI è opzionale e non possiede autorità di review/decisione. Output di planning, analisi, mining e inferenza restano proposal/derivation bounded finché un checkpoint umano non produce una decisione autorizzata. Validità JSON, provenance e confidence non equivalgono a validità sostanziale.

## Avvio locale

```bash
npm ci
./ictc.sh start
```

Senza apertura browser:

```bash
./ictc.sh start --no-open
```

Demo sintetica Meccanica Selene S.r.l. · DEMO:

```bash
./ictc.sh demo
```

La demo usa gli stessi owner/runtime/projection del prodotto e una runtime separata; i dati sono `synthetic-demo`. Il corpus contiene 700 record primari di stress (100 per processo). `demoAudit.verdict = coherent` significa coerenza degli invarianti del dataset sintetico, non conformità o assurance.

Comandi operativi:

```bash
./ictc.sh status
./ictc.sh logs
./ictc.sh doctor
./ictc.sh stop
./ictc.sh restart
```

## Verifica

Superficie normativa corrente:

```bash
npm test
npm run release:check
```

Diagnosi mirata della closure 2.8:

```bash
node v3/semantic-closure-2-8-runtime-check.mjs
node v3/semantic-closure-2-8-causality-check.mjs
node v3/semantic-closure-2-8-ui-check.mjs
node v3/semantic-closure-2-8-saturation.mjs
```

Diagnosi mirata della stabilizzazione 2.9:

```bash
node v3/runtime-stabilization-semantic-check.mjs
node v3/runtime-stabilization-command-ledger-check.mjs
node v3/runtime-stabilization-2-9-saturation.mjs
```

La saturation 2.9 modella deterministicamente **10.000.000 scenari** e **1.000.000 mutazioni negative** sulle sei famiglie dichiarate, con le ultime 100.000 mutazioni come holdout no-novelty. Il kill-rate del modello è una bounded evidence del vocabolario implementato, non una probabilità di correttezza, una prova di completezza, assurance indipendente o deployment assurance.

## Candidate e maturità

`v3/release-identity.json` resta l'autorità cross-documenti: product `1.8.0`, release stage `candidate`, semantic `1.2-market-candidate`, experience `1.9-experience-candidate`, epistemic `2.0-epistemic-lattice-pre-candidate`, journey `2.2-sequential-onto-epistemic`, constitution `C0.1`.

Il profilo di maturità corrente è **deep fine-tuning RN/EC/AO/MC/AP**; RC/AR restano `regressionCovered`. Le closure 2.8/2.9 rafforzano invarianti trasversali e runtime, ma non fingono una maturità verticale RC/AR non ancora raggiunta.

## Sviluppo e documentazione

**Se è la prima volta nel repository, parti da `docs/START_HERE.md`.** La mappa punta agli owner correnti e ai documenti AS-IS; non crea una nuova autorità.
