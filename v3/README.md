# ICTC v3 — runtime corrente

Questa pagina è una **proiezione operativa locale** di `v3/`, non una nuova authority. Per product truth, architettura e ownership usare `docs/START_HERE.md` e `docs/authority-matrix.yaml`.

## Avvio rapido

```bash
npm ci --ignore-scripts
npm start
```

La demo usa gli stessi byte applicativi con stato isolato:

```bash
npm run demo
```

Il launcher `./ictc.sh` resta un supervisor locale; l'entrypoint applicativo canonico è `v3/bootstrap.mjs`, che avvia `v3/server.mjs`.

## Flusso runtime

```text
browser / v3/public
  -> HTTP JSON
v3/server.mjs
  -> v3/runtime/* + domain + enterprise + ai
  -> v3/store.mjs
  -> v3/sqlite-state-persistence.mjs
  -> state.sqlite
```

`state.sqlite` contiene snapshot corrente, audit hash-linked, payload/versioni dei subject, causalità epistemica e risultati idempotenti dei comandi. Lo snapshot corrente non è ricostruito esclusivamente dall'audit ledger.

## Confine della richiesta

Il default bind è loopback. `local-directory` è per uso locale/simulazione; `trusted-header` richiede identity-aware proxy, opt-in esplicito al network bind e trusted identity boundary. Permessi, tenant e write authority restano verificati dal runtime: il browser non acquisisce business authority.

## Se devi cambiare qualcosa in `v3/`

Usa il router task-first in `docs/START_HERE.md`. In sintesi:

- UI/composizione: owner locale dichiarato dal contratto C5, non un final resolver;
- API/runtime: `docs/openapi.yaml`, `v3/server.mjs` e handler esistenti;
- AI: `v3/ai.mjs` + provider adapter/network policy, senza decision authority;
- persistence: `v3/store.mjs` + SQLite persistence, senza secondo business store;
- evidence/epistemic: conserva basis, version, authority e claim boundary.

`v3/semantic-owner-contract.json` è un contratto E2 di **orientamento/ownership/freshness**: proietta owner già esistenti e non sostituisce le authority sostanziali.

## Test

Feedback locale e rail di convergenza per tipo di modifica sono in `docs/TESTING.md`. Il minimo generale resta:

```bash
npm run check
npm run docs:check
npm test
npm run release:check
```

Per C5:

```bash
node v3/c5-semantic-owner-check.mjs
node v3/c5-semantic-owner-saturation.mjs
node v3/c5-needs-audit-saturation.mjs
```

## Claim boundary

Repository/runtime green non equivale a deployment assurance, autenticità esterna, legal compliance, rappresentatività dell'usabilità o enterprise readiness. E3-HUMAN, E3-GOV ed E4-DEPLOY restano rail esterne.
