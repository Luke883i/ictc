# Registro dei gap ICTC

La fonte canonica è `v3/gaps.json`. La UI pubblica soltanto i gap con stato `open` da `v3/public/gap-registry.json`.

## Risolti in questa iterazione

- **GAP-004:** ogni scrittura passa da un `DecisionCheckpoint`; ogni vista espone `ActionFrame` con conseguenza e receipt attesa.
- **GAP-011:** la vista Sistema genera un support bundle sanitizzato con correlation ID, integrità, conteggi e capacità.
- **GAP-013:** la navigazione non parte più dal nome del processo, ma da “che cosa deve fare qui l'utente?”.

## Mitigati

- **GAP-006:** v2 e v3 restano separate ma hanno profili, porte, PID e SOT espliciti.
- **GAP-008:** il metodo di attestazione visuale è dichiarato; resta necessario un browser reale per la release candidate.

## Aperti

- **GAP-007 — critico:** quarantena e scansione malware server-side non implementate.
- **GAP-009 — critico:** autenticazione e autorizzazione enterprise assenti.
- **GAP-010 — alto:** scouting istituzionale reale e scheduler persistente assenti.
- **GAP-012 — alto:** validazione con utenti reali non eseguita.
- **GAP-014 — medio:** telemetria centralizzata e tracing distribuito assenti.

## Regola di chiusura

Un gap può diventare `closed` soltanto se contiene:

- path di modifica esistenti;
- path di test esistenti;
- evidenza riproducibile;
- limitazione residua esplicita.

Un supporto parziale viene classificato `mitigated`, non `closed`.
