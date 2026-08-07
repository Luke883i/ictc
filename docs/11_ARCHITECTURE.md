# Architettura

## AS-IS eseguibile

```text
v3/public/*
  ↓ HTTP JSON
v3/server.mjs
  ↓
v3/domain.mjs + v3/enterprise.mjs + v3/ai.mjs + v3/runtime/*
  ↓
v3/store.mjs
  ↓
state.json mutabile + attachments/ + audit hash-linked nello stato
  ↓
proiezioni / OutcomeEnvelope
  ↓
UI e superfici di assurance
```

`package.json` (`scripts.start`) e `ictc.sh` convergono su `v3/server.mjs`; `docs/authority-matrix.yaml` dichiara i proprietari canonici e `node v3/authority-contract-check.mjs` ne verifica la coerenza con il runtime.

La SOT locale corrente non è un event store append-only: `v3/store.mjs` persiste l'intero `state.json`. L'array `audit` contiene eventi hash-linked e `verifyChain()` verifica revisioni, `previousHash` e hash degli eventi; non dimostra che l'intero stato canonico sia ricostruibile dagli eventi o legato crittograficamente alla chain. I claim di integrità devono restare entro questo confine.

La beta è zero-dependency a runtime, ascolta normalmente su `127.0.0.1` e lo storage locale è adatto a sviluppo/dimostrazione, non a deployment enterprise multiistanza o HA.

## TO-BE non ancora autoritativo

Un futuro deployment può sostituire lo storage locale con PostgreSQL, object storage immutabile, scheduler persistente, OIDC, KMS/Vault e OpenTelemetry. Questi componenti restano target architetturali finché non sono implementati e verificati; non ridefiniscono l'AS-IS.
