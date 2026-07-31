# Architettura

```text
Browser UI
  ↓ HTTP JSON
Node.js API
  ↓ funzioni di dominio
ledger JSONL append-only + blob locali
  ↓ proiezione ricostruibile
OutcomeEnvelope
  ↓
UI, tracce ASCII e assistente locale
```

La beta è zero-dependency a runtime, ascolta su `127.0.0.1` e usa la SOT locale. Lo storage locale è adatto alla dimostrazione, non al deployment enterprise.

La futura architettura sostituirà file locali con PostgreSQL, object storage immutabile, scheduler persistente, OIDC, KMS/Vault e OpenTelemetry mantenendo invariati i confini epistemici.
