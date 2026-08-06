# Changelog

## [1.6.0] - 2026-08-06

### Standard proof scope

- nuova area read-only **Guida e prova**, role-aware e distinta dai due servizi operativi canonici;
- spiegazione compatta di architettura, journey, ontologia, standard, evidenze e limiti;
- endpoint `/api/standard-proof` derivato da contratto, attore autorizzato, readiness e integrità;
- dodici mapping di benchmark con principio, pratica ICTC, evidence path e limitation;
- glossario canonico di quattordici termini per evitare collisioni semantiche;
- risoluzione finale degli alias visuali sui design token canonici;
- focus outline, target da 44 px, forced colors, reduced motion e reflow mobile/zoom;
- un solo pannello Admin read-only per separare controlli runtime e gap di deployment;
- saturazione di 787.320 scenari con no-novelty a M+100;
- compressione da 153 input a 124 primitive canoniche con no-novelty a N+100;
- gate statici, runtime, browser e security associati alla release 1.6.0.

### Limitations

La release dimostra contratti e journey selezionate del repository. Non certifica WCAG, EN 301 549, EAA, ISO 37301, NIST, AI Act, deployment produttivo o operating effectiveness. Restano necessari test umani e con tecnologie assistive, oltre alle attestazioni di identità, TLS, storage, restore, malware scanning e osservabilità.

## [1.4.0] - 2026-08-05

### Stable scope

- Home compatta con una sola priorità contestuale e otto risposte decisionali;
- profilo di accesso canonico emesso dal server per amministratore, utente e auditor;
- mappa progressiva di identità, azioni consentite, azioni vietate, effetti e tracce;
- mappa di autorità aperta automaticamente per l’auditor e zero controlli di scrittura;
- lessico normalizzato fra Materiale, Fonte ed Evidenza;
- navigazione priva di numerazione decorativa e geometria desktop compressa;
- saturazione 1→N su 23.328 scenari, N=23.392 e no-novelty a N+100;
- gate statici, runtime e browser legati alla release 1.4.0.

### Limitations

La release certifica repository e journey selezionate, non un deployment produttivo. Restano esterni identità attendibile, TLS, storage durevole, restore, malware scanning, osservabilità, audit umano di accessibilità e giudizio legale o di conformità.

## [1.0.0] - 2026-07-31

### Stable scope

- runtime canonico coerente fra `npm start` e `./ictc.sh start`;
- manifest di release e endpoint `/api/release`;
- health v1 con classe `stable-local-single-user`;
- safe-bind fail-closed per esposizioni non autenticate;
- upload binari disabilitati per default finché manca uno scanner;
- attestazione E2E con restart, receipt, hash-chain e journey core;
- simulazioni buyer per c-level, auditor e CTO;
- saturation gate M=36 e M+100 senza novelty;
- vista Sistema con readiness, scope ed esclusioni.

### Limitations

La v1 non include OIDC/RBAC, multi-tenancy, malware scanning, scouting remoto reale, scheduler persistente, HA, storage distribuito o telemetria centralizzata. La stabilità è limitata allo scope locale e single-user.

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
