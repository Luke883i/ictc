# ICTC runtime corrente

Il runtime Node.js serve i due flussi core su un kernel tenant-aware.

```bash
./ictc-v3.sh start
./ictc-v3.sh status
./ictc-v3.sh logs
./ictc-v3.sh audit
./ictc-v3.sh stop
```

## Confine della richiesta

```text
header verificato/local directory
→ principal
→ membership
→ tenant
→ ruolo e permessi
→ ledger/blob/sessione del tenant
```

`local-directory` è per loopback e simulazioni. `trusted-header` richiede un identity-aware proxy e `ICTC_TRUSTED_IDENTITY_BOUNDARY=1`.

## Storage

Ogni tenant usa `runtime/tenants/<tenant-id>/ledger.jsonl` e `runtime/tenants/<tenant-id>/blobs/`. Il ledger legacy viene copiato non distruttivamente nel tenant predefinito al primo accesso.

## Test

```bash
npm run audit:access
npm run audit:multi-client
npm run audit:ux:core
npm run release:check
```

La slice è readiness per pilot controllati, non SaaS enterprise.
