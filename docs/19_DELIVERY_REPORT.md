# Delivery report

La repository contiene una vertical slice locale eseguibile con Node.js 22:

- dashboard normativa;
- fonti manuali e review;
- scouting dimostrativo;
- eventi, owner e RACI;
- assistente session-scoped read-only;
- ledger append-only e receipt;
- schemi, validator, E2E, CI, security e visual workflow.

Validazione locale eseguita: `npm test`, `npm run git:handshake`, `npm run visual`.

Limite noto: il controllo visuale locale può usare fallback statico se Chromium è bloccato; la CI installa Chromium e ripete il gate.
