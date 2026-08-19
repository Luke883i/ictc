# Architettura ICTC

## AS-IS eseguibile

```text
browser / v3/public/*
        ↓ HTTP JSON
v3/server.mjs
        ↓
v3/runtime/* + v3/domain.mjs + v3/enterprise.mjs + v3/ai.mjs
        ↓
v3/store.mjs
        ↓
v3/sqlite-state-persistence.mjs
        ↓
state.sqlite
  ├─ snapshot            stato corrente mutabile per revisione
  ├─ audit               ledger append-only hash-linked
  ├─ subject_payload     payload content-addressed
  ├─ subject_version     versioni semantiche append-only
  └─ epistemic_step      step epistemici append-only
        ↓
projection context / OutcomeEnvelope / procedure projections
        ↓
Home · Processi · procedure · Postura · EP-01
```

`package.json` e `ictc.sh` convergono su `v3/server.mjs`. `docs/authority-matrix.yaml` dichiara i proprietari canonici; `node v3/authority-contract-check.mjs` ne falsifica il drift.

## Composizione UI costituzionale C0.1

`v3/public/app.js` possiede un solo entrypoint di composizione: `installActiveExperience()`. `v3/public/ui/active-experience.js` installa gli enhancer e registra le responsabilità finali del lifecycle corrente:

```text
base/native enhancers
        ↓
harmonization  procedure-executive-harmonization-1-5
        ↓
presentation   procedure-ui-ux-1-6
        ↓
integrity      procedure-ui-ux-integrity-1-6
        ↓
journey        procedure-sequential-ux-2-2
        ↓
annotation     procedure-control-anchors-1-4
```

Le fasi e le classi di authority sono dichiarate in `v3/public/ui/experience-constitution.js`; `v3/public/ui/experience-lifecycle.js` è l'unico orchestratore della convergenza finale. Un singolo microtask può coalescere eventi sincroni, ma **non determina la precedenza semantica**: la precedenza deriva esclusivamente da `harmonization → presentation → integrity → journey → annotation`.

La reentrancy è esplicita: una richiesta di convergenza generata durante un flush produce un replay nello stesso flush e non un secondo microtask tardivo. Il lifecycle fallisce chiuso dopo 32 replay se i participant non convergono. Il vecchio side channel `ictc:sequential-rendered` non è più necessario: gli anchor sono l'ultima fase costituzionale.

`procedure-executive-harmonization-1-5` normalizza frame e linguaggio senza diventare decision owner. `procedure-ui-ux-1-6` resta l'unico `decision-presentation` esclusivo. `procedure-ui-ux-integrity-1-6` è un `integrity-observer`; `procedure-sequential-ux-2-2` è `journey-overlay`; `procedure-control-anchors-1-4` annota intent, authority ed evidence effect senza creare decisioni o write authority.

Gli stili finali 1.6 sono nel foglio esterno `v3/public/ui-convergence.css`; i vecchi tentativi di `<style>` inline sono rimossi perché incompatibili con la CSP `style-src 'self'` e duplicavano regole già esterne.

C0.1 governa i **final participant**. Alcuni enhancer storici non finali conservano scheduling locale per interaction mechanics; questo non può ridefinire la precedenza finale e resta debito da comprimere nelle rispettive slice. Le successive mutazioni verticali di RN/EC/AO/MC/AP/RC/AR possono proseguire indipendentemente; una nuova responsabilità orizzontale di composizione deve invece entrare nel lifecycle dichiarato.

## Identità di release

`v3/release-identity.json` schema 2.0 è l'autorità cross-documenti della candidate corrente. Separa `productVersion`, `releaseStage`, contratti correnti, maturità delle sette procedure e assurance profile dalla `lineage` informativa. Una generazione storica può restare un rail di regressione senza diventare per concatenazione parte dell'identità corrente.

## Persistenza

`SqliteStatePersistence` apre `state.sqlite`, abilita WAL, `synchronous=FULL` e foreign keys. Il current snapshot è mutabile: una nuova revisione sostituisce il payload della riga snapshot. Audit, SubjectVersion ed EpistemicStep sono invece registrati in strutture append-oriented e verificati durante lettura/persistenza.

La distinzione è intenzionale: **ICTC non è oggi un event store completo**. La audit chain da sola non ricostruisce necessariamente ogni stato storico. Le tabelle semantiche conservano versioni e step per il lineage epistemico, ma non trasformano lo snapshot corrente in una proiezione ricostruita esclusivamente dagli eventi.

Un `state.json` storico è supportato soltanto come sorgente di migrazione: se non esiste ancora uno snapshot SQLite viene importato, salvato in SQLite e rinominato `state.legacy-imported.json`.

## Integrità e receipt

Ogni mutazione serializzata dal `Store` può produrre:

1. risultato business;
2. SubjectVersion del soggetto primario e degli eventuali soggetti semantici secondari;
3. semantic manifest;
4. EpistemicStep;
5. evento audit hash-linked;
6. receipt con revision/hash e digest input/result/state;
7. persistenza SQLite e readback verificato.

Il canonical-state digest esclude il ledger audit e la cache tecnica `commandResults` per evitare dipendenze circolari. Gli allegati sono rappresentati nel binding tramite metadati, digest e trust registrati, non incorporando i byte nel digest dello snapshot.

Questi controlli rilevano categorie di incoerenza software; non equivalgono a firma qualificata, timestamp fiduciario, storage WORM o non-ripudio contro un attore capace di riscrivere storage e catena.

## Procedure e proiezioni

Le sette procedure business condividono registry, policy, procedure adapter, projection context e semantic versioning. Una mutazione aggiorna la revisione server; il client effettua un bootstrap/readback e pubblica `ictc:projection-committed`. Le superfici dipendenti devono convergere sulla revisione più recente senza possedere una copia autoritativa indipendente.

EP-01 legge la storia semantica persistita e ne costruisce una projection revision-bound. `Esplora`, `Flat / raw` e `Proto-grafo` sono renderer della stessa projection/digest. Le derivazioni AI restano `proposed`; la review umana è una mutazione distinta.

## Evidence export

`v3/runtime/evidence-graph.mjs` e `v3/runtime/exports.mjs` sono l'owner del fascicolo. PDF, XML, Markdown e ZIP sono rappresentazioni dello stesso dossier autorizzato. Il formato non modifica RBAC, non amplia il perimetro di lettura e conserva limiti e lineage.

## Runtime security boundary

Il default bind è loopback. Le modalità di identità/network esterne richiedono le condizioni fail-closed definite nel runtime. AI outbound, allegati e identity bridge hanno policy dedicate. TLS, host hardening, secret manager, backup/restore, malware scanning, monitoring e HA restano responsabilità del deployment.

## TO-BE non autoritativo

PostgreSQL, object storage immutabile, scheduler persistente distribuito, OIDC enterprise, KMS/Vault, OpenTelemetry, HA e storage esterno possono essere evoluzioni future. Finché non sono implementati e falsificati non fanno parte dell'AS-IS e non possono essere usati per dichiarare production readiness.
