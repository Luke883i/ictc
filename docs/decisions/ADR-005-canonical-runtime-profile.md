# ADR-005 — Launcher canonico e profili runtime

Status: accepted

## Context

Dopo la PR 3 esistevano `ictc.sh` per v2 e `ictc-v3.sh` per v3. Il nome più semplice avviava quindi la versione legacy.

## Decision

`ictc.sh` diventa il launcher canonico. Il profilo `current` corrisponde a v3. v2 richiede `--profile v2`; il confronto usa `--profile all`. Stato, runtime, PID e porte sono isolati per profilo.

## Consequences

L'ingresso end-user è univoco. Il rollback resta disponibile. La convivenza delle due SOT rimane un debito esplicito fino alla migrazione o rimozione di v2.

## Verification

`v3/launcher-audit.mjs` e il workflow `ictc-post-merge-audit`.
