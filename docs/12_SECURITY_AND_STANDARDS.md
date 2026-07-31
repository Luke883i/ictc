# Sicurezza e standard

## Stato della beta

La beta è destinata a workstation o ambienti di prova isolati. Il bind predefinito è `127.0.0.1`; non è supportata l'esposizione diretta su rete aziendale.

## Controlli implementati

- Content Security Policy e header HTTP di base;
- limiti di payload e controlli sui percorsi locali;
- SOT locale separabile tramite `ICTC_RUNTIME_DIR`;
- ledger append-only con hash-chain;
- assistente session-scoped e privo di write authority;
- test su label anti-overclaim, schemi, wiring, runtime e accessibilità;
- secret scan, dependency audit e workflow di sicurezza portabili.

## Controlli ancora necessari per un uso enterprise

- autenticazione OIDC e autorizzazione server-side;
- isolamento multi-tenant;
- KMS o Vault per i segreti;
- scansione malware degli allegati;
- database transazionale e object storage immutabile;
- osservabilità, retention, backup e disaster recovery;
- threat model e penetration test indipendente.

## Riferimenti di progetto

La baseline applicativa usa principi OWASP ASVS e OWASP per applicazioni LLM. L'esperienza utente mira a WCAG 2.2 AA, senza dichiarare conformità formale finché non vengono completati test manuali con tecnologie assistive.
