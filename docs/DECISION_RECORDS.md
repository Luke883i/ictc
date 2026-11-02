# Decision record

Le ADR vivono in `docs/decisions/`.

Ogni ADR cattura una decisione importante e la sua motivazione, non una nuova authority di runtime. Collegare l'ADR all'[architettura corrente](11_ARCHITECTURE.md), all'[authority matrix](authority-matrix.yaml), agli effetti sulle [user journey](04_USER_JOURNEYS.md) e a una verifica riproducibile; registrare `superseded` quando la decisione è sostituita, senza eliminare retroattivamente l'evidenza storica.

| ADR | Decisione |
|---|---|
| ADR-001 | La UI consuma `OutcomeEnvelope` |
| ADR-002 | L'AI è locale alla sessione e read-only |
| ADR-003 | Le fonti proposte richiedono promozione umana |
| ADR-004 | Nessun punteggio complessivo di conformità |

Usare il formato:

```text
# ADR-NNN — Titolo
Status: proposed | accepted | superseded
Date: YYYY-MM-DD

## Context
## Decision
## Consequences
## Alternatives
## Verification
```
