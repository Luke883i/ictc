# ADR-006 — Lenti epistemiche locali

Status: accepted

## Context

Una singola rappresentazione non serve allo stesso modo chi deve orientarsi, decidere o verificare. Viste indipendenti rischiano però di creare verità divergenti.

## Decision

La guida end-user applica tre lenti allo stesso oggetto runtime: `Orientarmi`, `Decidere`, `Verificare`. La lente modifica soltanto densità e ordine dei campi; non modifica stato, dati o autorità.

## Consequences

La UI comprime l'informazione senza nascondere i limiti. Il contratto è machine-readable in `v3/public/epistemic-contract.json`.

## Verification

`v3/ux-audit.mjs` e `v3/enduser-simulation.mjs`.
