# Configurazione

La beta usa configurazione minima tramite variabili di ambiente.

| Variabile | Default | Descrizione |
|---|---:|---|
| `PORT` | `4173` | Porta HTTP locale |

Il server ascolta su `127.0.0.1` per impostazione progettuale della beta locale.

`.env.example` documenta i valori ammessi. I file `.env*` sono ignorati, con l'eccezione del file di esempio.

## Segreti

La beta non richiede chiavi esterne. Nelle fasi successive:

- i segreti devono essere conservati in KMS/Vault;
- la UI può solo impostarli o sostituirli, non rileggerli;
- nessun segreto deve comparire in ledger, log, receipt o risposta AI.
