# Operazioni locali

## Avvio raccomandato

```bash
./ictc.sh start
```

Il launcher verifica Node.js, npm, `curl`, lockfile, porta, directory runtime e health check. Se è presente un ambiente desktop tenta di aprire il browser; altrimenti stampa l'URL.

```bash
./ictc.sh start --no-open
./ictc.sh start --foreground
```

## Lifecycle

```bash
./ictc.sh status
./ictc.sh logs
./ictc.sh stop
./ictc.sh restart
./ictc.sh open
./ictc.sh doctor
```

Stato operativo corrente in modalità single-tenant:

- `.ictc/run/server.pid`: PID gestito dal launcher;
- `.ictc/logs/server.log`: log standard output/error;
- `${ICTC_RUNTIME_DIR:-runtime}/state.sqlite`: database SQLite canonico del runtime;
- `${ICTC_RUNTIME_DIR:-runtime}/state.sqlite-wal` e `state.sqlite-shm`: file SQLite transitori;
- `${ICTC_RUNTIME_DIR:-runtime}/quarantine/`: byte appena acquisiti, non servibili finché il trust state non è ammesso;
- `${ICTC_RUNTIME_DIR:-runtime}/attachments/`: byte promossi dopo un'attestazione scanner valida o altra policy esplicitamente ammessa.

Con `ICTC_MULTI_TENANT=1`, ogni tenant usa `${ICTC_RUNTIME_DIR}/tenants/<tenant-id>/` con database, quarantine e attachment fisicamente distinti. La membership tenant deriva dalla directory server-side; `x-ictc-tenant` può soltanto selezionare fra membership già autorizzate e non conferisce accesso.

`state.json` è soltanto un formato legacy importabile una volta; `ledger.jsonl` non è storage canonico della release corrente. `.ictc/` e lo stato runtime non devono essere committati.

## Health, tenancy e osservabilità

```bash
curl http://127.0.0.1:4173/api/health
curl http://127.0.0.1:4173/api/runtime/info
curl http://127.0.0.1:4173/api/runtime/integrity
curl http://127.0.0.1:4173/api/runtime/tenancy
```

`health.ok=true` dimostra che il processo risponde. `integrity.ok=true` dimostra che lo snapshot corrente è coerente con la catena audit e con il binding semantico verificato dal runtime; non dimostra correttezza legale, completezza dei dati o autenticità esterna. L'endpoint amministrativo `/api/runtime/observability` espone telemetria process-local bounded e il posture dell'abuse budget; non equivale a collector, alerting o drill di deployment.

Ogni risposta HTTP riceve `x-request-id`. Il server applica budget espliciti per header timeout, request timeout, keep-alive, numero richieste/socket, header count e un token bucket process-local. Un deployment orizzontale deve sostituire l'abuse budget locale con un backend distribuito conservando la stessa semantica fail-closed.

## Audit completo

```bash
./ictc.sh audit
```

Gli artefatti di audit sono evidenza ingegneristica bounded e non sostituiscono restore drill esterno, review indipendente o evidenza del deployment.

## Configurazione

```bash
ICTC_PORT=4300 ./ictc.sh start
ICTC_RUNTIME_DIR=/var/tmp/ictc-demo ./ictc.sh start
ICTC_NO_OPEN=1 ./ictc.sh start
```

Il server ascolta su `127.0.0.1` per default. Un bind non-loopback è rifiutato salvo convergenza delle condizioni trusted-header, opt-in esplicito e proxy secret previste dal runtime.

### Multi-tenancy

La modalità multi-tenant richiede una directory esplicita, per esempio:

```bash
export ICTC_MULTI_TENANT=1
export ICTC_TENANT_DIRECTORY_JSON='{"defaultTenantId":"acme","tenants":[{"id":"acme","groups":["ictc-acme"]},{"id":"beta","groups":["ictc-beta"]}]}'
```

In trusted-header mode la risoluzione tenant avviene soltanto dopo verifica del proxy secret. Il local tenant switch è una funzione di sviluppo separata e richiede loopback più `ICTC_ALLOW_LOCAL_TENANT_SWITCH=1`.

### Scanner allegati

```bash
export ICTC_ATTACHMENT_SCANNER_MODE=external-attested
export ICTC_ATTACHMENT_SCANNER_ID=scanner-prod-01
export ICTC_ATTACHMENT_SCANNER_SECRET='<secret di almeno 32 caratteri>'
```

ICTC non implementa il motore anti-malware: verifica un'attestazione HMAC legata a attachment id/digest, scanner/versione, signature database, timestamp e verdict. Un file non clean resta fisicamente in quarantine e il download fallisce chiuso. L'efficacia del motore scanner è evidence di deployment, non claim del repository.

## Recovery point cifrati

Il runtime include un primitive di recovery verificabile. Richiede una recovery key di 32 byte in base64 e un key id; l'env provider è adatto a test/operazioni controllate, mentre un deployment enterprise deve sostituirne la custody con KMS/HSM e attestazione esterna.

```bash
export ICTC_RECOVERY_KEY_BASE64='<32 byte base64>'
export ICTC_RECOVERY_KEY_ID='recovery-key-2026-08'
node v3/recovery-cli.mjs backup --tenant local-default --destination /secure/ictc-recovery
node v3/recovery-cli.mjs restore --source /secure/ictc-recovery/<recovery-point> --target /var/tmp/ictc-restored
```

Il backup usa la SQLite backup API per produrre una snapshot consistente, cifra database e object bytes con AES-256-GCM e autentica il manifest. Il restore è accettato soltanto su target assente, in staging, dopo verifica di manifest, ciphertext/plaintext digest, revision, audit HEAD, canonical state digest e integrity binding; solo allora viene promosso atomicamente.

`rtoMs` e `rpoSecondsAtRestore` sono misure del singolo restore repository. **Non sono RTO/RPO approvati** e non dimostrano off-host durability, replica geografica o disaster recovery finché un drill di deployment E4 non li attesta.

## Privacy lifecycle

Gli amministratori possono configurare retention/legal hold e avviare erasure tramite gli endpoint `/api/admin/privacy`. Una legal hold attiva blocca la cancellazione. Per contribution/incident supportati l'erasure elimina i byte degli allegati, svuota il payload business e rende null i payload semantici storici mantenendo digest, occurrence e receipt di cancellazione. La catena audit resta append-only e conserva metadata necessari all'integrità.

## Arresto anomalo e PID stale

`./ictc.sh start` elimina un PID file non associato a un processo attivo. Se un processo risponde sulla porta ma non è gestito dal launcher, usare `./ictc.sh doctor`, identificare il processo e non cancellare il database per risolvere il conflitto. SIGINT/SIGTERM arrestano scheduler, HTTP server e tutti gli store tenant aperti; è previsto un fallback bounded se il drain non termina.

## Limiti operativi

La release implementa boundary repository per tenant isolation, quarantine, scanner attestation, encrypted recovery point, privacy lifecycle, request observability e abuse budget locale. Restano **non dimostrati dal repository**: alta disponibilità, rate limiting distribuito, KMS/HSM custody, efficacia dello scanner di produzione, off-host/geo durability, RTO/RPO approvati, alert drill esterno e identità enterprise del deployment. La modalità locale con role header è una boundary di sviluppo loopback, non un'identità enterprise.
