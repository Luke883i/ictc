# Dati e storage

## Modello della beta

- `data/seed.json`: dati dimostrativi versionati;
- `runtime/ledger.jsonl`: eventi append-only locali, non versionati;
- `runtime/state.json`: proiezione derivata, ricostruibile;
- `runtime/blobs/`: contenuti acquisiti localmente, non versionati;
- `schemas/`: contratti machine-readable.

## Autorità

Il ledger è la fonte operativa locale degli eventi. La proiezione è derivata e può essere ricostruita. La UI consuma proiezioni tipizzate, non file raw.

## Dati sensibili

Non usare dati personali reali nella beta. Per sviluppo e test usare contenuti sintetici o anonimizzati.

## Evoluzione prevista

La versione enterprise sostituirà lo storage locale con:

- PostgreSQL per eventi, proiezioni e query;
- object storage immutabile per documenti;
- chiavi di integrità gestite;
- retention e legal hold configurabili;
- backup, restore e disaster recovery verificati.
