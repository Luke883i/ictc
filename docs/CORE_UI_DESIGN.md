# Core UI design — multi-client

La UI mantiene due sole aree: **Monitoraggio** e **Incidenti**. Cliente e ruolo sono scelti una volta nella testata e diventano contesto di tutte le letture e scritture.

## Monitoraggio

```text
URL o contenuto → fonte → review → differenza → decisione → controllo → receipt
```

La testata offre soltanto **Monitora URL** e **Aggiungi contenuto**. La pagina mostra tre conteggi, una prossima azione, una lista di monitoraggi e una catena decisionale a tre colonne. Blob, digest, AI e provenienza restano nel dettaglio.

## Incidenti

```text
Segnala → Assegna → Triage → Risposta → Ripristino → Lezioni → receipt
```

La testata offre soltanto **Segnala**. La pagina mostra quattro conteggi, le fasi, una prossima azione e la lista dei casi. Le evidenze complete restano nel dettaglio.

## Permission-aware UI

Il task è derivato dallo stato prima del ruolo. Se il ruolo non possiede il permesso, il task resta visibile come **Solo lettura**: l'utente comprende cosa manca senza poter aggirare l'API.

## Audit trail progressivo

La superficie primaria espone azione, stato e conseguenza. Il dettaglio espone significato, provenienza, relazioni, identificativo e receipt. La receipt include tenant, attore, ruolo, hash, hash precedente e readback.
