# Dati e storage

## Modello corrente

- `data/seed.json`: dati dimostrativi versionati, non stato runtime;
- `${ICTC_RUNTIME_DIR:-runtime}/state.sqlite`: autorità persistente locale corrente in single-tenant mode;
- `${ICTC_RUNTIME_DIR:-runtime}/quarantine/`: byte appena acquisiti e non ancora ammessi al serving;
- `${ICTC_RUNTIME_DIR:-runtime}/attachments/`: byte clean/promossi;
- `${ICTC_RUNTIME_DIR:-runtime}/tenants/<tenant-id>/...`: autorità fisicamente separata per tenant quando `ICTC_MULTI_TENANT=1`;
- `schemas/`: contratti machine-readable;
- `.ictc/`: PID e log del launcher, non fonte di verità.

SQLite usa WAL, `synchronous=FULL` e foreign key. Nel database la responsabilità è separata fra snapshot mutabile e strutture append-oriented per audit, payload/versioni semantiche ed EpistemicStep. Il runtime verifica il binding fra stato, audit e storia semantica prima di accettare la materializzazione come coerente.

`state.json` è soltanto un input legacy importabile e archiviato durante la migrazione; `ledger.jsonl` non è una fonte operativa della release corrente. Nessuna guida operativa deve presentare questi formati ritirati come target di backup.

## Autorità

`v3/store.mjs` resta l'autorità delle mutazioni, receipt e readback. `v3/sqlite-state-persistence.mjs` resta la persistence authority di base; `v3/runtime-store.mjs` è l'adattatore runtime che usa `HardenedSqliteStatePersistence` per le capacità backward-compatible di erasure e atomic AI budget e applica la quarantine fisica. Non esiste una seconda business write authority.

Il database locale non è un event store pienamente ricostruibile e non è storage WORM. Audit, snapshot e verificatore restano nello stesso trust domain dell'host locale salvo controlli di deployment esterni.

## Multi-tenancy

Il primo backend multi-tenant usa **SQLite per tenant**, non una colonna `tenant_id` aggiunta ai record esistenti. Questa scelta rende l'isolamento un boundary fisico e impedisce che un filtro dimenticato in un singolo handler allarghi la visibilità. L'authority tenant usa un contesto asincrono server-side e un facade Store; handler, evidence, AI e procedure continuano a vedere la stessa interfaccia di Store ma ogni richiesta esegue contro il database del tenant risolto.

La directory tenant è configurazione di deployment. In trusted-header mode la membership è derivata da subject/group verificati dopo il proxy secret; un header di selezione tenant può soltanto restringere una membership già esistente. Lo scheduler attraversa i tenant esplicitamente e i mission lock sono tenant-scoped.

Il registry degli store mantiene un numero bounded di handle SQLite aperti con eviction degli store inattivi. Questa è una predisposizione scalabile per molti tenant, non la dichiarazione di un database condiviso horizontal-scale. Un backend futuro può implementare lo stesso port con database condiviso/RLS e object storage senza cambiare la business authority.

## Allegati e quarantine

I nuovi allegati entrano sempre in `quarantine/`. I metadata continuano a essere legati allo stato con digest SHA-256. Un download applicativo è fail-closed finché il trust state non è ammesso. In modalità `external-attested`, ICTC verifica un'attestazione HMAC legata a id e digest dell'allegato, scanner id/version, signature-db version, timestamp e verdict; soltanto un verdetto clean verificato promuove atomicamente il byte in `attachments/`.

Il repository verifica il protocollo e la quarantena, non l'efficacia sostanziale del motore antivirus. Quella rimane evidence E4 del deployment.

## Privacy lifecycle e storia semantica

`subject_version` e i digest rimangono append-oriented. Per i tipi business supportati, una erasure autorizzata non cancella occurrence, audit o digest: **marca come erased le versioni semantiche del soggetto**, legandole a `erasure_receipt_sha256`. La materializzazione di quelle versioni restituisce `payloadErased=true` e non espone il payload, distinguendo quindi una cancellazione intenzionale da payload mancante/corrotto.

`subject_payload` è deduplicato per digest e può essere condiviso da versioni appartenenti a soggetti diversi. Per questo il body fisico `payload_json` viene impostato a `NULL` soltanto quando non esiste più alcuna `subject_version` non-erased che referenzia quel digest. L'erasure di un soggetto non può quindi cancellare la materializzazione ancora lecita di un altro soggetto con payload identico.

La legal hold precede la retention/erasure. L'oggetto business viene tombstoned, gli attachment bytes vengono rimossi da clean e quarantine e una receipt di cancellazione viene conservata nello snapshot. Questa semantica evita che il diritto alla cancellazione venga implementato rompendo silenziosamente il verificatore.

Un deployment che ripristina recovery point vecchi deve conservare una policy di anti-resurrezione/erasure watermark esterna al singolo backup se retention e restore sono gestiti su sistemi separati. Il repository non dichiara risolto quel problema di deployment soltanto perché sa creare e verificare recovery point.

## Cifratura e recovery

Lo SQLite **attivo** non è cifrato applicativamente da ICTC: un deployment sensibile deve usare cifratura del volume/database attestata. I recovery point creati da `v3/runtime/recovery.mjs` sono invece cifrati per oggetto con AES-256-GCM e manifest autenticato HMAC-SHA256; la recovery key non viene persistita nel recovery point.

Il provider env (`ICTC_RECOVERY_KEY_BASE64`, `ICTC_RECOVERY_KEY_ID`) è un adapter locale. Custody, rotation, envelope encryption con KMS/HSM e access-policy della chiave sono responsabilità del deployment e devono produrre evidence esterna.

Il backup usa la SQLite backup API anziché una copia raw del file WAL-live. **Lo snapshot SQLite copiato è l'inventory authority del recovery point**: vengono inclusi soltanto gli attachment ID referenziati da quello snapshot, e ogni byte viene accettato soltanto se digest (e size dichiarata) coincidono con i metadata snapshot. Byte orfani o non ancora committati non entrano nel recovery point; un oggetto referenziato assente o incoerente fa fallire il backup chiuso.

Il restore avviene su staging vuoto e richiede manifest autenticato, entry univoche, `state.sqlite`, digest ciphertext/plaintext, revision, audit HEAD, canonical state digest e integrity binding prima della promotion. `rtoMs` e `rpoSecondsAtRestore` sono misure osservate, non obiettivi approvati.

## Isolamento dei test

E2E e runtime check devono impostare una directory temporanea con `ICTC_RUNTIME_DIR`, chiudere ogni Store/database handle e arrestare i child process prima della rimozione. I path derivati da `import.meta.url` devono usare `fileURLToPath()` per essere validi anche su Windows. I test multi-tenant devono usare root fisicamente distinti e verificare sia deny cross-tenant sia accesso legittimo.

## Evoluzione scalabile

Il boundary attuale prepara una migrazione senza duplicare la business authority:

- `TenantStore`/facade: oggi SQLite per tenant; domani backend shared con `tenant_id` nelle chiavi e RLS defence-in-depth;
- object bytes: oggi filesystem clean/quarantine; domani object storage con namespace/ACL tenant e immutable recovery class;
- abuse budget: oggi token bucket process-local; domani backend distribuito mantenendo la stessa semantica;
- scheduler: oggi traversal tenant in-process; domani queue/lease durevole idempotente per tenant;
- recovery key: oggi env adapter; domani KMS/HSM adapter;
- observability: oggi telemetry process-local; domani collector/tracing/alerting esterno.

Queste sostituzioni diventano capacità enterprise soltanto quando sono implementate nel deployment e accompagnate da evidence envelope valida. Il repository non auto-attesta alta disponibilità, capacità, durability geografica, KMS custody, scanner efficacy o RTO/RPO approvati.
