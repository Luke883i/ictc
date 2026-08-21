# Architettura ICTC — AS-IS

## Sistema

```text
browser / v3/public
   ↓ HTTP JSON
v3/server.mjs
   ↓
runtime handlers + domain + enterprise + ai
   ↓
v3/store.mjs
   ↓
SqliteStatePersistence
   ↓
state.sqlite
   ├─ snapshot
   ├─ audit
   ├─ subject_payload
   ├─ subject_version
   └─ epistemic_step
   ↓
ProjectionContext + canonical projections + write OutcomeEnvelope/receipt
   ↓
Home · Processi di Compliance · Evidenze ICTC · EP-01
```

Node ESM `>=22.16.0`; frontend HTML/CSS/JS vanilla; persistence nativa `node:sqlite`. Il launcher e `package.json` convergono su `v3/server.mjs`. Gli owner canonici sono dichiarati in `docs/authority-matrix.yaml`.

## Modello di autorità

L'architettura conserva separazioni, non un unico “status”: observed/proposed/decided, lifecycle, mapping decision, risk band, assurance lifecycle, criticality ed epistemic disposition sono assi differenti. Una projection può correlare assi, non renderli equivalenti.

I sette processi condividono registry/policy/adapter/projection context, ma mantengono oggetti e checkpoint nativi. EP-01 osserva storia semantica; non crea autorità business.

## Persistenza e temporalità

`snapshot` è current state mutabile per revisione. `audit`, `subject_version` ed `epistemic_step` sono append-oriented. Il ledger audit non basta da solo a ricostruire ogni stato storico: ICTC non è un event store completo.

`ProjectionContext` distingue `transactionAsOf` e `validAsOf`. La selezione storica transaction-time non è implementata; richieste non supportate devono fallire chiuse.

Il `Store` serializza la mutazione, crea versioni/manifest/step/audit/receipt e verifica persistenza/readback. I digest rilevano incoerenze software entro il modello, non equivalgono a firma qualificata o non-ripudio.

## RC-01: ciclo temporale

Una review inerente o residual è una occurrence. La review effettiva è quella temporalmente più recente tra le due famiglie: un residual del ciclo precedente non può oscurare un inherent successivo. I nuovi trattamenti conservano `assessmentSha256`; un trattamento legacy senza digest resta leggibile solo se temporalmente successivo alla review corrente. `ReviewNeed` usa il trattamento del ciclo corrente per `reviewAt`.

## EvidenceRef

Internal EvidenceRef risolve un oggetto/versione ICTC. External EvidenceRef può essere dichiarato o osservato. Un riferimento esterno è `usable` nei checkpoint che richiedono evidenza soltanto se conserva `observedVersion` o digest. `observedAt` da solo dimostra che ICTC ha registrato un'osservazione, non una versione stabile della base.

ICTC non effettua remote change detection generalizzata. Perciò il version binding evita l'ambiguità della base decisionale, ma non attesta lo stato corrente del server remoto.

## ReviewNeed

Quando una base interna version-bound cambia, ICTC apre lavoro di review e preserva la decisione originale. Il cambiamento non riscrive automaticamente verità, applicabilità, efficacia o chiusura. I clock (`reviewAt`, attestation due) sono materializzati come cause esplicite.

## Cross-process reticulum

I 24 handoff ammessi usano predicate source→target specifici. Il target è sempre un draft nativo e riparte dai checkpoint del proprio processo. `crossOrigin` conserva source, revision, predicate e lineage.

La lineage ha depth massima 8 e rifiuta un target già presente tra i processi visitati. Il bound protegge da amplificazione semantica/work explosion; non trasferisce decisioni o autorità.

## EpistemicStep

EpistemicStep separa initiator, executor e producer. `metadata.epistemicEffects` è il forward write contract. Una compatibility registry pin-na le action AI legacy note a `proposed` e producer AI per evitare classificazioni errate durante la migrazione; il fallback da action name resta debito esplicito e non è la destinazione architetturale.

## UI constitution C0.1

`installActiveExperience()` è l'unico composition root. I participant finali restano esattamente cinque:

```text
harmonization  procedure-executive-harmonization-1-5
presentation   procedure-ui-ux-1-6            (decision-presentation exclusive)
integrity      procedure-ui-ux-integrity-1-6
journey        procedure-sequential-ux-2-2
annotation     procedure-control-anchors-1-4
```

Il lifecycle ascolta `ictc:rendered`, `ictc:surface-changed`, `ictc:context-changed`, `ictc:projection-committed` e toggle. Gli enhancer non-finali vengono installati prima; l'initial lifecycle è coalesced, così il participant graph costituzionale resta l'ultimo converger. Un microtask coalesca, non decide authority order. Reentrancy = replay; fail-closed oltre 32 cicli.

`business-surface-convergence-2-7` resta enhancer di compatibilità non-finale: non è un sesto participant e non possiede decision authority.

## Confine UI: read projection / write envelope

L'ADR OutcomeEnvelope va letto così: la UI non legge entità raw dello storage. Le **read** sono canonical projections role/scope/revision-bound che espongono authority e limitation; le **write** restituiscono OutcomeEnvelope/receipt e poi causano un readback/projection commit. Non è richiesto che ogni oggetto di una read projection serializzi letteralmente lo schema OutcomeEnvelope.

## Evidence graph ed export

Evidence graph, human-decision projection, epistemic projection, audit e version node alimentano dossier/claim/limitation. PDF/XML/Markdown/ZIP sono formati dello stesso perimetro autorizzato (`same-as-read`) e non diventano una SOT parallela.

## Security/deployment boundary

Default loopback. AI egress, identity bridge e attachment trust hanno policy dedicate. TLS, IdP, secrets, backup/restore, scanner malware, telemetry, HA e hardening esterno restano deployment evidence e non sono inferiti dal repository.

## TO-BE non autoritativo

PostgreSQL, object storage immutabile, OIDC enterprise, KMS/Vault, OpenTelemetry, HA o transaction-time reconstruction possono essere evoluzioni future. Finché non sono implementati e falsificati non sono AS-IS.
