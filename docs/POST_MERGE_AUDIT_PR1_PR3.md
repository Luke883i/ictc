# Audit post-merge delle PR 1, 2 e 3

## Scopo

Questo audit distingue ciò che il repository implementa, ciò che dimostra con test e ciò che resta progettato o simulato. Non costituisce attestazione di conformità, sicurezza o idoneità produttiva.

## PR 1 — Foundation epistemica

La PR 1 ha trasformato il repository vuoto in una vertical slice locale: dominio, API, UI, `OutcomeEnvelope`, ledger append-only, receipt, schemi, OpenAPI, authority matrix, wiring manifest e governance GitHub.

**Valore:** confine di verità unico per la UI; separazione tra proposta AI, osservazione tecnica e decisione umana; test contrattuali; limiti enterprise dichiarati.

**Debito:** dashboard ancora organizzata per moduli; visual audit con possibile fallback statico; runtime locale single-user; scouting, parsing e notifiche reali simulati o assenti.

## PR 2 — Runtime audit e launcher

La PR 2 ha provato persistenza, readback, receipt, restart, accessibilità automatica e percorso di avvio. Ha corretto controlli UI visibili ma non completamente wired.

**Valore:** distinzione tra test verde e percorso utilizzabile; `start`, `stop`, `status`, `logs`, `doctor`, `audit`; SOT test isolata; focus, ricerca, link/file e reduced motion operativi.

**Debito:** il launcher è rimasto associato alla v2 dopo l'arrivo della v3; i controlli automatici non misurano comprensione; accessibilità automatica non sostituisce screen reader e browser reali.

## PR 3 — Living Evidence Atlas

La PR 3 ha aggiunto balloon, Atlante semantico, percorsi guidati, change story, incident room, supply chain e drill-down progressivo, mantenendo v2 come rollback separato.

**Valore:** ingresso orientato a domande; grafo, lista, scene e trail dalla stessa proiezione; relazioni nominate; assistente limitato all'oggetto e ai vicini deterministici; saturazione M+100 bounded.

**Debito:** due launcher; nessuna lente persistente per orientamento, decisione e verifica; gap distribuiti in più documenti; Codespaces assente; upload senza quarantena/scansione; nessuna validazione con utenti reali.

## Che cosa vede l'utente

**Home / Oggi:** balloon che traducono oggetti runtime in domande. Non sono semafori di conformità.

**Atlante:** fonti, finding, change story, controlli, job ed eventi collegati da relazioni nominate, con lista alternativa.

**Percorsi guidati:** scene con stato corrente, input, limite e prossima azione.

**Dettaglio:** effetto locale; poi origine, produttore, input e limiti; infine receipt, hash e identificativi.

**Audit trail:** raccolta, regola applicata, decisione e receipt. Integrità della catena distinta da verità del contenuto.

## Audit infrastrutturale

```text
browser -> asset v3 -> API Node.js -> dominio -> ledger/blobs -> proiezione -> OutcomeEnvelope -> UI e assistente
```

Verificabile: eventi append-only, readback, receipt, hash-chain, runtime test isolato, proiezioni al posto dello storage raw, profili v2/v3 separati.

Non enterprise: identità e autorizzazione, persistenza distribuita, scansione malware, scheduler e fetcher reali, telemetria centralizzata, load/recovery test.

## Giudizio

ICTC funziona come beta locale proof-oriented. Il confine epistemico è più maturo dell'infrastruttura. Il rischio principale è che il limite non compaia nel momento esatto della scelta: questa iterazione introduce launcher canonico, guida epistemica locale e registro gap eseguibile.
