# Configurazione

| Variabile | Default | Descrizione |
|---|---:|---|
| `ICTC_PORT` / `PORT` | `4173` | Porta HTTP locale |
| `ICTC_HOST` | `127.0.0.1` | Indirizzo di bind |
| `ICTC_RUNTIME_DIR` | `./runtime` | SOT locale: ledger e blob |
| `ICTC_STATE_DIR` | `./.ictc` | PID, log e stato del launcher |
| `ICTC_NO_OPEN` | `0` | Con `1` non apre il browser |
| `BROWSER` | non impostato | Comando browser preferito |

Esempi:

```bash
ICTC_PORT=4300 ./ictc.sh start
ICTC_RUNTIME_DIR=/tmp/ictc-isolated ./ictc.sh start --no-open
```

Il server ascolta su `127.0.0.1` per impostazione progettuale. Cambiare `ICTC_HOST` espone la beta a un perimetro diverso e richiede una review di sicurezza.

## Segreti

La beta non richiede chiavi esterne. Nelle fasi successive:

- i segreti devono essere conservati in KMS/Vault;
- la UI può solo impostarli o sostituirli, non rileggerli;
- nessun segreto deve comparire in ledger, log, receipt o risposta AI.
