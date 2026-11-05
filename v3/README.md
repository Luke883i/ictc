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

### Rischi di falsa eliminabilità nel runtime

`v3/public/` è servita anche attraverso URI HTTP: un asset non importato nel grafo JavaScript può avere consumer esterni non osservati. Altre dipendenze nascono da stringhe costruite a runtime, workflow, caricamento di fixture e input di configurazione. Prima del ritiro seguire la [policy di conservazione](../docs/DOCUMENTATION_STANDARD.md) e il [metodo di testing](../docs/TESTING.md); gli import ESM sono un sottoinsieme delle relazioni rilevanti.

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

## Confine fisico fra runtime e verificatori (C1-3d, primo gruppo)

I sei verificatori di governance TRAMA ora hanno **un'unica implementazione** sotto `v3/tests/`: `trama-causal-qualification-{check,saturation-1m}.mjs`, `trama-engineering-{check,saturation}.mjs`, `trama-reconcile-{check,saturation}.mjs`. I sei omonimi in `v3/` sono **soli adapter ESM**: conservano invocazioni, argomenti e path storici usati da workflow, registro e consumer non osservati. Non sono due test indipendenti e non possiedono autorità di prodotto.

- Comando esistente: `node v3/trama-causal-qualification-check.mjs`
- Implementazione diretta: `node v3/tests/trama-causal-qualification-check.mjs`
- Prova di parità e rollback: `node scripts/test-boundary-migration-check.mjs --falsify` (ricevuta derivata `artifacts/c1-3d-test-boundary.json`).

La migrazione è intenzionalmente circoscritta a sei file (63.079 byte originari). Tutti gli altri verificatori restano nei percorsi correnti: nessuna riorganizzazione generalizzata o certificazione di cancellabilità degli adapter. Il [Documentation Standard](../docs/DOCUMENTATION_STANDARD.md) resta il riferimento per consumer esterni, URL e conservazione.

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

### Legacy island root-first (verificatori storici, non runtime)

La precedente isola root `v1/`, `app/`, `lib/`, `data/` è ricollocata senza adapter in `v3/tests/legacy/{v1,app,lib,data}/`: 13 file storici, nove immutati byte-per-byte e quattro con sola correzione di path relativi e seed. I vecchi strumenti sotto `scripts/` sono riconnessi alla nuova collocazione senza diventare gate di runtime corrente. Il prodotto attivo continua ad avviarsi tramite `v3/bootstrap.mjs` e a usare `v3/public/`, `v3/domain.mjs` e SQLite. L'intero gruppo resta HOLD_CONSUMERS, non autorizzato alla rimozione.

### Post-#256 · Seconda tranche di verificatori isolati

Sedici ulteriori check/saturation/fault oracle — sette GOV intent, cinque DEMO pubblica, due epistemic-lattice, due DEMO Suite 3.0 — si trovano in `v3/tests/` con percorsi `v3/*.mjs` ancora invocabili come adapter. La prova di continuità è estesa nel **medesimo** `scripts/test-boundary-migration-check.mjs`; non nasce un secondo test registry né una seconda authority.

Il primo feedback riproducibile per la tranche è:

```bash
node scripts/test-boundary-migration-check.mjs --falsify
node v3/gov-intent-assurance-a-check.mjs
node v3/tests/gov-intent-assurance-a-check.mjs
node v3/public-demo-boundary-check.mjs
node v3/tests/public-demo-boundary-check.mjs
```

Il doppio ingresso è intenzionale e temporaneamente necessario: **due comandi, una sola implementazione**. Un output coincidente per queste coppie non prova l'equivalenza di tutti i journey; il witness conserva le altre controprove e i check CI devono essere osservati sulla stessa HEAD. La migrazione non comprende gli altri test a risoluzione dinamica da qualificare singolarmente. Il vecchio percorso rimane un'interfaccia compatibile: non rimuoverlo senza prova su workflow, import, URL esterni e retention.
