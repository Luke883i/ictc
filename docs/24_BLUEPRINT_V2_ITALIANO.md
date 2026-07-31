# Blueprint ICTC v2

ICTC è un sistema locale di presidio e gestione, non un motore di certificazione legale.

## Scope 1

Fonti ufficiali e candidate, job di scouting, confronti deterministici, proposte AI delimitate, review umane e receipt.

## Scope 2

Segnalazioni, quasi incidenti e incidenti con narrazione originale, fatti, ipotesi, owner, RACI, azioni e audit trail.

## Architettura

```text
Browser → API Node.js → dominio → ledger append-only / blob locali → proiezione → OutcomeEnvelope → UI
```

## AI

L'assistente riceve una capsula evocata dalla UI, conserva memoria per la singola sessione, può leggere documentazione e codice dichiarati nel proprio manifest e non dispone di write authority.

## Evoluzione enterprise

OIDC, PostgreSQL, object storage, scheduler persistente, connettori ufficiali, quarantena file, OpenTelemetry, backup/restore, load test e deployment immutabile.
