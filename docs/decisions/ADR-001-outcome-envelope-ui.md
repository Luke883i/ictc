# ADR-001 — Confine UI: canonical projections + OutcomeEnvelope

Status: accepted, amended 2026-08-21

## Decisione

La UI non renderizza entità raw della persistenza e non costruisce una seconda fonte di verità.

Il termine **OutcomeEnvelope** conserva il suo ruolo per le write e per il principio di autorità, ma l'AS-IS corrente distingue due forme:

1. **read path** — canonical projections role/scope/revision-bound, con producer/authority/limits dove applicabili;
2. **write path** — OutcomeEnvelope + receipt, seguito da readback e `ictc:projection-committed`.

Non è richiesto che ogni record contenuto in una read projection sia letteralmente serializzato secondo `schemas/outcome-envelope.schema.json`. È invece obbligatorio che la UI non promuova raw storage, AI proposal, score, evidence o mapping a un'autorità che la projection canonica non possiede.

## Conseguenze

- nessuna seconda SOT nel browser;
- read e export restano bounded dallo stesso access/scope;
- receipt dimostra l'operazione registrata, non la verità sostanziale;
- documenti storici che dicono “ogni elemento è un OutcomeEnvelope” vanno interpretati secondo questo amendment.
