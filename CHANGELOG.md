# Changelog

## 2.0.0-beta.3

- aggiunto launcher `ictc.sh`;
- aggiunti audit runtime, accessibilità e documentazione;
- isolata la SOT dei test con `ICTC_RUNTIME_DIR`;
- corretto wiring di dettaglio, ricerca, modalità fonte, motion e navigazione accessibile;
- rafforzati path traversal check, header e limiti upload.

Le modifiche rilevanti sono documentate secondo Keep a Changelog. Il progetto usa versionamento semantico quando viene pubblicata una release.

## [Unreleased]

### Planned

- autenticazione OIDC e autorizzazione server-side;
- persistenza PostgreSQL e object storage compatibile S3;
- adapter LLM configurabile;
- scheduler persistente per lo scouting;
- osservabilità OpenTelemetry;
- deployment containerizzato.

## [2.0.0-beta.2] - 2026-07-31

### Added

- UI basata su `OutcomeEnvelope`;
- arricchimento manuale delle fonti;
- scouting schedulato dimostrativo;
- gestione di segnalazioni, quasi incidenti e incidenti;
- ledger locale append-only e receipt;
- assistente locale session-scoped e read-only;
- validator di schema, label, wiring e invarianti epistemiche;
- export ASCII e attestazione visuale.
