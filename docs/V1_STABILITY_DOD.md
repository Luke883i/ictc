# ICTC v1 — Definition of Done e checklist stabile

## Significato di stabile

“Stabile” significa che il comportamento dichiarato nello scope locale e single-user è versionato, riproducibile, testato end-to-end e protetto da regressioni. Non significa certificazione di terza parte, completezza normativa o idoneità enterprise.

La fonte machine-readable è `v1/release.json`.

## Definition of Done

- [ ] `npm start` e `./ictc.sh start` avviano lo stesso runtime v1.
- [ ] `/api/health` restituisce `1.0.0` e `stable-local-single-user`.
- [ ] `/api/release` restituisce readiness, scope, esclusioni, guardrail e hash.
- [ ] il bind non-loopback fallisce senza Codespaces o override esplicito.
- [ ] l'upload binario fallisce per default.
- [ ] la journey fonte produce receipt e review.
- [ ] la journey change produce review, decisione e mapping.
- [ ] la journey evento produce owner e transizione.
- [ ] ogni receipt usata dal test ha `readbackVerified=true`.
- [ ] il ledger resta integro e ricostruibile dopo restart.
- [ ] l'assistente resta read-only e rifiuta conclusioni generali di conformità.
- [ ] c-level, auditor e CTO trovano evidenze per le proprie obiezioni.
- [ ] M=36 e gli scenari 37–136 non introducono nuove primitive.
- [ ] la fixture blob mantiene hash e readback deterministici.

## Metriche e soglie

| Metrica | Soglia v1 |
|---|---:|
| Journey core completate | 100% |
| Receipt con readback | 100% |
| Integrità ledger prima/dopo restart | 100% |
| Startup locale | ≤ 10 s |
| Health locale p95 | ≤ 1 s |
| Blocker critici nello scope stabile | 0 |
| Novità dopo M | 0 |

## Release command

```bash
npm ci --ignore-scripts
npm run release:check
```

Il gate produce un'attestazione JSON. La release può essere etichettata v1 soltanto quando l'artefatto ha `result=passed`, `externallyCertified=false` e nessun blocker critico nello scope.

## Rollback

Il runtime storico v2 resta isolato e avviabile tramite profilo esplicito. Non esiste migrazione automatica tra ledger v2 e v1; receipt e conteggi devono sempre indicare il profilo di origine.
