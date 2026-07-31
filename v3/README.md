# ICTC v3 — Living Evidence Atlas

Runtime locale autonomo introdotto dalla PR #3.

```bash
./ictc-v3.sh start
```

La v3 espone Home a balloon, Atlante semantico, percorsi guidati, fonti, change story, controlli astratti, eventi, audit trail e assistente locale read-only.

La SOT è locale in `v3/runtime/`. Le scritture generano eventi append-only, readback e receipt SHA-256.

```bash
./ictc-v3.sh status
./ictc-v3.sh audit
./ictc-v3.sh stop
```

Il runtime è una beta tecnica e non fornisce certificazioni automatiche di conformità.
