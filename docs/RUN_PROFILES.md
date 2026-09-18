# Profili di esecuzione

## Autorità BOOTSTRAP-0

ICTC ha due profili applicativi canonici: `standard` e `demo`. Entrambi eseguono gli stessi byte applicativi tramite `v3/bootstrap.mjs`; cambiano soltanto il runtime state. Il profilo DEMO canonico seleziona `ICTC_DEMO_SUITE=3.0`. La Suite 2.2 è deprecata e resta disponibile soltanto come percorso legacy esplicito di regressione/generazione.

| Profilo | Foreground | Supervisor locale | Stato predefinito |
|---|---|---|---|
| standard | `npm start` | `./ictc.sh start` | `.ictc/runtime` |
| demo | `npm run demo` | `./ictc.sh demo` | `.ictc/demo-runtime-3-0` |

`ICTC_RUNTIME_DIR` può sostituire la directory di stato. `ICTC_STATE_DIR` sposta la root mantenendo la separazione standard/demo. Una runtime Suite 2.2 non deve essere riutilizzata come runtime 3.0: il materializzatore 3.0 rifiuta fail-closed marker o dati business legacy già presenti.

## Dataset DEMO 3.0

`npm run demo` materializza esclusivamente il dataset DEMO Suite 3.0: 188 record business sintetici nelle sette procedure native, più il corpus di supporto marcato 3.0. I record business hanno `scenarioId`/`datasetId` 3.0; l'eventuale provenienza dalla costruzione 2.2 è conservata soltanto come lineage `sourceScenarioId`/`legacySource` deprecata.

Evidence Lattice 3.0 è una proiezione derivata read-only dello stesso runtime: non è un ottavo processo e non crea una seconda popolazione business. I 512 stress fixture e le campagne di mutazione non vengono persistiti né mostrati come record operativi.

## Installazione e build

L'autorità package-manager è npm e il lock canonico è `package-lock.json`:

```bash
npm ci --ignore-scripts
npm run build
```

`npm run build` non introduce un bundle applicativo separato: esegue il preflight sintattico e il contratto BOOTSTRAP-0 sui byte che saranno poi avviati.

## Foreground e supervisor

`npm start` è l'ingresso foreground per supervisor, CI e PaaS. `ictc.sh` aggiunge soltanto funzioni locali di supervisione: PID, log, readiness polling, apertura browser, stop/restart/status. Il launcher non avvia `v3/server.mjs` direttamente; converge sullo stesso `v3/bootstrap.mjs` usato da npm.

Il vecchio `./ictc.sh codespace` resta alias compatibile di `./ictc.sh start --no-open`. L'alias `--demo-seed` resta esclusivamente come percorso deprecato Suite 2.2 e non è il comando DEMO canonico.

## Porta e health

Precedenza porta: `PORT` → `ICTC_PORT` → `4173`. Questo consente a un PaaS di assegnare `PORT` senza creare un terzo bootstrap contract. La readiness authority resta `GET /api/health`.

## Render e PaaS Node

Quando la piattaforma chiede i due campi Build/Start:

```text
Build Command: npm ci --ignore-scripts && npm run build
Start Command: npm start
```

Non usare `yarn`: il repository è npm-authoritative e non contiene `yarn.lock`.

Render assegna `PORT` al processo e, per i servizi HTTP inbound (`RENDER=true` con `RENDER_SERVICE_TYPE=web` o `pserv`), richiede che l'applicazione sia raggiungibile su un bind non-loopback. ICTC **non** amplia automaticamente l'esposizione di rete: su Render inbound, lasciare il default `127.0.0.1` produce un fail-fast `paas-network-bind-required` prima dell'import del server. L'operatore deve dichiarare esplicitamente, per esempio, `ICTC_HOST=0.0.0.0`.

Il bind di trasporto non crea fiducia identitaria. Nel profilo standard, un bind non-loopback continua a richiedere la boundary già esistente: `ICTC_IDENTITY_MODE=trusted-header`, `ICTC_ALLOW_NETWORK_BIND=1`, un `ICTC_TRUSTED_PROXY_SECRET` robusto e un vero proxy/IdP upstream che produca gli header autorizzati. Il reverse proxy della piattaforma non viene trattato automaticamente come identity proxy ICTC. La sola eccezione è la Public DEMO sintetica read-only, esplicitamente opt-in e descritta sotto.

Il filesystem Render è effimero per default. Un persistent disk può rendere persistente il path montato per una singola istanza, ma non è una shared durable authority e non va descritto come chiusura della postura enterprise/CEP; in particolare non sostituisce il futuro adapter enterprise condiviso delineato da CEP-0. BOOTSTRAP-0 mantiene soltanto i profili `standard` e `demo`: questa diagnostica PaaS non anticipa `CEP-R1`–`CEP-R8`.

### Render · DEMO pubblica sintetica read-only

Configurazione operatore:

```text
Build Command: npm ci --ignore-scripts && npm run build
Start Command: npm run demo

ICTC_HOST=0.0.0.0
ICTC_ALLOW_NETWORK_BIND=1
ICTC_PUBLIC_DEMO=1
```

`PORT` è fornita da Render. Il bootstrap DEMO imposta Suite 3.0 e la runtime isolata `demo-runtime-3-0`; non serve impostare manualmente `ICTC_RUNTIME_DIR`. In Public DEMO devono essere assenti `ICTC_IDENTITY_MODE`, `ICTC_TRUSTED_PROXY_SECRET`, `ICTC_MULTI_TENANT`, `ICTC_ALLOW_LOCAL_ACTOR_SWITCH` e `ICTC_ALLOW_LOCAL_TENANT_SWITCH`. Il runtime consente di esplorare le persone dimostrative `admin`, `user` e `auditor`; il ruolo è bounded a questa allowlist e l'actor `local-<role>` è derivato server-side, mentre l'actor-id client non è autorevole. Tutti i metodi API diversi da GET/HEAD restano rifiutati. Questa eccezione non trasforma il reverse proxy Render in identity proxy, non abilita il profilo standard pubblico e non anticipa CEP. Il filesystem Render è effimero per default.

## Devcontainer / Codespaces

`.devcontainer/devcontainer.json` usa Node 22 e inoltra privatamente la porta 4173. `postStartCommand` esegue `./ictc.sh start --no-open` senza forzare `0.0.0.0`; il port forward del devcontainer raggiunge il processo loopback.

Il devcontainer è quindi la forma containerizzata locale canonica. Un'immagine runtime genericamente pubblicabile non viene dichiarata da BOOTSTRAP-0 perché richiederebbe una decisione separata sulla boundary identity/network del deployment.

## Verifica

```bash
npm run bootstrap:check
npm run bootstrap:saturation
node v3/demo-suite-3-0-cutover-check.mjs
node v3/demo-suite-3-0-runtime-e2e-check.mjs
node v3/demo-suite-3-0-cutover-mutation-1m.mjs
```

La saturation BOOTSTRAP-0 e il cutover mutation rail sono source/model-level; il gate E2E avvia invece il runtime reale locale e verifica il profilo DEMO 3.0. Nessuna di queste prove sostituisce una prova di deployment E4 o una conclusione di conformità.
