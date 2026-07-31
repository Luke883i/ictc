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

Stato operativo:

- `.ictc/run/server.pid`: PID gestito dal launcher;
- `.ictc/logs/server.log`: log standard output/error;
- `runtime/ledger.jsonl`: ledger append-only;
- `runtime/blobs/`: allegati locali;
- `runtime/state.json`: eventuale proiezione derivata.

`.ictc/` e lo stato runtime non devono essere committati.

## Health e integrità

```bash
curl http://127.0.0.1:4173/api/health
curl http://127.0.0.1:4173/api/runtime/info
curl http://127.0.0.1:4173/api/runtime/integrity
```

`health.ok=true` dimostra che il processo risponde. `integrity.ok=true` dimostra che la hash-chain locale è coerente; non dimostra correttezza legale o completezza dei dati.

## Audit completo

```bash
./ictc.sh audit
```

Produce in `artifacts/`:

- `runtime-audit.json`;
- `accessibility-audit.json`;
- `documentation-audit.json`;
- tracce ASCII e artefatti visuali quando richiesti.

## Configurazione

```bash
ICTC_PORT=4300 ./ictc.sh start
ICTC_RUNTIME_DIR=/var/tmp/ictc-demo ./ictc.sh start
ICTC_NO_OPEN=1 ./ictc.sh start
```

Il server ascolta su `127.0.0.1` per default. L'uso di `ICTC_HOST` diverso richiede una review di sicurezza.

## Arresto anomalo e PID stale

`./ictc.sh start` elimina un PID file non associato a un processo attivo. Se un processo risponde sulla porta ma non è gestito dal launcher, usare `./ictc.sh doctor`, identificare il processo e non cancellare il ledger per risolvere il conflitto.

## Recovery locale

1. arrestare con `./ictc.sh stop`;
2. copiare l'intera directory `runtime/`;
3. eseguire `./ictc.sh audit` su una copia o con `ICTC_RUNTIME_DIR` isolata;
4. verificare la hash-chain;
5. documentare qualsiasi intervento manuale.

## Limiti operativi

La beta non include alta disponibilità, backup automatico, SSO, multi-tenancy, rate limiting distribuito, malware scanning o gestione centralizzata dei segreti.
