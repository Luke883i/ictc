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

Stato operativo corrente:

- `.ictc/run/server.pid`: PID gestito dal launcher;
- `.ictc/logs/server.log`: log standard output/error;
- `${ICTC_RUNTIME_DIR:-runtime}/state.sqlite`: database SQLite canonico del runtime;
- `${ICTC_RUNTIME_DIR:-runtime}/state.sqlite-wal` e `state.sqlite-shm`: file SQLite transitori che possono essere presenti mentre il processo è attivo;
- `${ICTC_RUNTIME_DIR:-runtime}/attachments/`: byte degli allegati, separati dal database ma legati allo stato tramite metadati e digest.

`state.json` è soltanto un formato legacy importabile una volta; `ledger.jsonl` non è storage canonico della release corrente. `.ictc/` e lo stato runtime non devono essere committati.

## Health e integrità

```bash
curl http://127.0.0.1:4173/api/health
curl http://127.0.0.1:4173/api/runtime/info
curl http://127.0.0.1:4173/api/runtime/integrity
```

`health.ok=true` dimostra che il processo risponde. `integrity.ok=true` dimostra che lo snapshot corrente è coerente con la catena audit e con il binding semantico verificato dal runtime; non dimostra correttezza legale, completezza dei dati, autenticità esterna o disaster recovery.

## Audit completo

```bash
./ictc.sh audit
```

Gli artefatti di audit sono evidenza ingegneristica bounded e non sostituiscono backup, restore drill, review indipendente o evidenza del deployment.

## Configurazione

```bash
ICTC_PORT=4300 ./ictc.sh start
ICTC_RUNTIME_DIR=/var/tmp/ictc-demo ./ictc.sh start
ICTC_NO_OPEN=1 ./ictc.sh start
```

Il server ascolta su `127.0.0.1` per default. Un bind non-loopback è rifiutato salvo convergenza delle condizioni trusted-header, opt-in esplicito e proxy secret previste dal runtime.

## Arresto anomalo e PID stale

`./ictc.sh start` elimina un PID file non associato a un processo attivo. Se un processo risponde sulla porta ma non è gestito dal launcher, usare `./ictc.sh doctor`, identificare il processo e non cancellare il database per risolvere il conflitto.

## Copia di recovery locale: limite esplicito

Una copia manuale della directory runtime **non è un backup verificato**. Per una copia amministrativa locale:

1. arrestare con `./ictc.sh stop` per chiudere SQLite e il WAL;
2. copiare l'intera `${ICTC_RUNTIME_DIR:-runtime}/`, includendo `state.sqlite` e `attachments/`;
3. conservare la copia in un percorso separato e protetto;
4. avviare una verifica soltanto su una copia isolata;
5. documentare commit applicativo, piattaforma, timestamp e qualsiasi intervento manuale.

Questa procedura non stabilisce RPO/RTO, cifratura del backup, ripristinabilità su host pulito o idoneità enterprise. Tali claim restano blocker finché un restore drill con evidence envelope valido non li dimostra.

## Limiti operativi

La release corrente non include, come capacità verificata del repository, alta disponibilità, backup automatico/restore attestato, rate limiting distribuito, malware scanning, gestione centralizzata dei segreti o cifratura applicativa del database. La modalità locale con role header è una boundary di sviluppo loopback, non un'identità enterprise.
