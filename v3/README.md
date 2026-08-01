# ICTC v3 runtime — Monitoraggio e Incidenti

La generazione tecnica v3 alimenta ICTC v1. La UI attiva espone soltanto due servizi e usa lo stesso backend, ledger, storage blob e proiezione runtime.

```bash
./ictc-v3.sh start
./ictc-v3.sh status
./ictc-v3.sh logs
./ictc-v3.sh audit
./ictc-v3.sh stop
```

## Monitoraggio normativo

### Percorso programmato

```text
configurazione → review fonte → scheduling → acquisizione → digest → studio AI opzionale → finding → review → decisione → controllo
```

- configurazione e prossima esecuzione persistono nel ledger;
- il contenuto osservato viene salvato in `runtime/blobs/`;
- l’AI viene invocata soltanto se endpoint e modello sono configurati;
- un fallimento AI resta `failed` e non produce una proposta fittizia;
- una differenza resta da revisionare da una persona.

### Percorso manuale

```text
URL o testo → fonte candidata → finding → review → decisione → controllo
```

Il reticolo visibile deriva dagli edge `monitors`, `derived-from`, `observed-by`, `review-created` e `covered-by` proiettati dal runtime.

## Incidenti e quasi incidenti

```text
segnalazione → ownership → triage → risposta → recovery → lessons learned
```

Le transizioni sono consentite in sequenza e richiedono campi di evidenza definiti da `core-workspaces.json`. Il modello è una sintesi operativa ispirata a NIST SP 800-61 Rev. 3 e ISO/IEC 27035; non determina automaticamente incident classification legale o notifiche.

## Ciclo di scrittura

```text
controllo visibile → conferma → route API → append → readback → receipt → bootstrap aggiornato
```

Un controllo privo di input o output runtime non deve essere presente nella UI.

## Contratti e gate

```bash
npm run audit:ux:core
```

Il gate runtime usa `v3/mock-monitoring-provider.mjs` per verificare acquisizione, provider AI compatibile, blob, digest, reticolo, tutte le fasi incidente e receipt. Il browser gate produce due screenshot del runtime.

La SOT locale risiede nella directory runtime configurata. Integrità, digest e ricevute non equivalgono a verità, completezza o conformità.

## Contesti operativi

Azienda, ente pubblico e impresa regolamentata sono contesti dei due servizi, non moduli separati. Il contesto viene validato, persistito e proiettato nella UI; non concede autorizzazioni e non determina applicabilità.
