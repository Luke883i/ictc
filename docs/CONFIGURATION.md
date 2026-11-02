# Configurazione — runtime standard locale

Questa guida descrive i default **osservabili nel launcher e nel bootstrap current**. Per il contratto delle autorità e delle migrazioni consultare [ARCHITECTURE](11_ARCHITECTURE.md), [DATA_AND_STORAGE](DATA_AND_STORAGE.md) e [OPERATIONS](OPERATIONS.md); questo documento non è una seconda authority runtime.

| Variabile | Default effettivo | Uso |
|---|---|---|
| `ICTC_PORT` / `PORT` | `4173` | Porta HTTP (il bootstrap risolve il profilo) |
| `ICTC_HOST` | `127.0.0.1` | Bind su loopback del profilo standard |
| `ICTC_STATE_DIR` | `<repository>/.ictc` nel launcher | Directory di PID, log e runtime predefinito del launcher |
| `ICTC_RUNTIME_DIR` | `<repository>/.ictc/runtime` per il profilo standard, senza override | Directory SQLite e object bytes, non un ledger JSONL |
| `ICTC_NO_OPEN` | `0` nel launcher | `1` impedisce l'apertura automatica del browser |
| `BROWSER` | non impostato | Preferenza browser in contesti che la supportano |

**Distinzione importante:** `./ictc.sh start` risolve la runtime directory sotto `ICTC_STATE_DIR` e la passa a `v3/bootstrap.mjs`. Il processo server lanciato direttamente senza il bootstrap/launcher usa regole di fallback proprie e non costituisce il profilo di avvio raccomandato. Per isolare stati diversi, usare un percorso assoluto esplicito.

```bash
npm ci --ignore-scripts
npm start
# in alternativa: ./ictc.sh start --no-open
ICTC_RUNTIME_DIR=/tmp/ictc-isolated ./ictc.sh start --no-open
```

Con `npm start`, per l'effettivo runtime directory e il profilo risolto usare `v3/bootstrap-contract.mjs`. Il profilo DEMO sintetico (`npm run demo`) risolve una directory separata; non riutilizzare lo stato standard. Per gli endpoint `health`, `runtime/integrity` e recovery vedere [OPERATIONS](OPERATIONS.md).

## Segreti e bind di rete

Il profilo locale standard non richiede chiavi AI esterne. I segreti eventualmente configurati non devono essere riportati in log, receipt, esportazioni o risposte AI. Un bind non-loopback richiede il contratto di proxy, trusted header e opt-in esplicito del runtime; impostare soltanto `ICTC_HOST` non autorizza l'esposizione pubblica. Per chiavi scanner/recovery e custodia KMS/HSM consultare [OPERATIONS](OPERATIONS.md). La loro presenza nel repository non prova l'efficacia del deployment.
