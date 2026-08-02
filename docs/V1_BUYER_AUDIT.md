# Buyer audit — multi-client readiness

## Valore dimostrato

- un cliente non vede oggetti, ledger, blob o sessioni di un altro;
- ogni scrittura è attribuita a tenant, attore e ruolo;
- analyst, reviewer e owner hanno confini operativi distinti;
- l'audit trail resta leggibile senza esporre dettagli tecnici nella superficie primaria;
- i due servizi condividono lo stesso kernel di identità e prova.

## Resistenze residue

- **CTO:** trusted headers non sono un IdP. Mitigazione: proxy amministrato e fail-closed; residuo: OIDC/MFA/SCIM da implementare.
- **Auditor:** hash-chain non equivale a non ripudio. Mitigazione: identità e ruolo nella receipt; residuo: firme e timestamp qualificati fuori scope.
- **C-level:** readiness non equivale a servizio SaaS. Mitigazione: limiti machine-readable; residuo: HA, supporto e cost model da validare.
