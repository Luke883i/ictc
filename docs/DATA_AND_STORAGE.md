# Dati e storage

## Modello della beta

- `data/seed.json`: dati dimostrativi versionati;
- `${ICTC_RUNTIME_DIR:-runtime}/ledger.jsonl`: eventi append-only locali;
- `${ICTC_RUNTIME_DIR:-runtime}/blobs/`: contenuti acquisiti localmente;
- `schemas/`: contratti machine-readable;
- `.ictc/`: PID e log del launcher, non fonte di verità.

## Autorità

Il ledger è la fonte operativa locale degli eventi. La proiezione è derivata e ricostruibile. La UI consuma proiezioni tipizzate, non file raw.

## Isolamento dei test

E2E e runtime audit impostano una directory temporanea con `ICTC_RUNTIME_DIR`. I test non devono scrivere nella SOT dell'utente.

## Dati sensibili

Non usare dati personali reali nella beta. Per sviluppo e test usare contenuti sintetici o anonimizzati.

## Evoluzione prevista

La versione enterprise sostituirà lo storage locale con:

- PostgreSQL per eventi, proiezioni e query;
- object storage immutabile per documenti;
- chiavi di integrità gestite;
- retention e legal hold configurabili;
- backup, restore e disaster recovery verificati.
