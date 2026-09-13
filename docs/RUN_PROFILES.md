# Profili di esecuzione

## Autorità BOOTSTRAP-0

ICTC ha due profili applicativi canonici: `standard` e `demo`. Entrambi eseguono gli stessi byte applicativi tramite `v3/bootstrap.mjs`; cambiano soltanto il runtime state e, per la demo, `ICTC_DEMO_SUITE=2.2`.

| Profilo | Foreground | Supervisor locale | Stato predefinito |
|---|---|---|---|
| standard | `npm start` | `./ictc.sh start` | `.ictc/runtime` |
| demo | `npm run demo` | `./ictc.sh demo` | `.ictc/demo-runtime-2-2` |

`ICTC_RUNTIME_DIR` può sostituire la directory di stato. `ICTC_STATE_DIR` sposta la root mantenendo la separazione standard/demo.

## Installazione e build

L'autorità package-manager è npm e il lock canonico è `package-lock.json`:

```bash
npm ci --ignore-scripts
npm run build
```

`npm run build` non introduce un bundle applicativo separato: esegue il preflight sintattico e il contratto BOOTSTRAP-0 sui byte che saranno poi avviati.

## Foreground e supervisor

`npm start` è l'ingresso foreground per supervisor, CI e PaaS. `ictc.sh` aggiunge soltanto funzioni locali di supervisione: PID, log, readiness polling, apertura browser, stop/restart/status. Il launcher non avvia più `v3/server.mjs` direttamente; converge sullo stesso `v3/bootstrap.mjs` usato da npm.

Il vecchio `./ictc.sh codespace` resta alias compatibile di `./ictc.sh start --no-open`.

## Porta e health

Precedenza porta: `PORT` → `ICTC_PORT` → `4173`. Questo consente a un PaaS di assegnare `PORT` senza creare un terzo bootstrap contract. La readiness authority resta `GET /api/health`.

## Render e PaaS Node

Quando la piattaforma chiede i due campi Build/Start:

```text
Build Command: npm ci --ignore-scripts && npm run build
Start Command: npm start
```

Non usare `yarn`: il repository è npm-authoritative e non contiene `yarn.lock`.

Questi comandi standardizzano build e avvio, ma **non** trasformano un servizio pubblico in un deployment sicuro. Il default host resta `127.0.0.1`; un bind non-loopback continua a richiedere `ICTC_IDENTITY_MODE=trusted-header`, `ICTC_ALLOW_NETWORK_BIND=1` e un `ICTC_TRUSTED_PROXY_SECRET` robusto, oltre a un proxy/IdP che produca gli header autorizzati. BOOTSTRAP-0 non bypassa questa boundary.

## Devcontainer / Codespaces

`.devcontainer/devcontainer.json` usa Node 22 e inoltra privatamente la porta 4173. `postStartCommand` esegue `./ictc.sh start --no-open` senza forzare `0.0.0.0`; il port forward del devcontainer raggiunge il processo loopback.

Il devcontainer è quindi la forma containerizzata locale canonica. Un'immagine runtime genericamente pubblicabile non viene dichiarata da BOOTSTRAP-0 perché richiederebbe una decisione separata sulla boundary identity/network del deployment.

## Verifica

```bash
npm run bootstrap:check
npm run bootstrap:saturation
./ictc.sh doctor
```

La saturation BOOTSTRAP-0 è source/model-level: un milione di composizioni deterministiche su package/toolchain, profili, state authority, command graph, devcontainer, PaaS projection e network boundary. Non sostituisce una prova di deployment E4.
