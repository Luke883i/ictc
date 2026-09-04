# Registro dei gap ICTC

La fonte canonica è `v3/gaps.json`. La UI pubblica soltanto i gap con stato `open` da `v3/public/gap-registry.json`. `v3/capability-truth.json` separa ciò che il repository dimostra da ciò che richiede evidence di deployment o indipendente.

## Baseline corrente

La baseline corrente è `main@9f56b4444b212b36e5957f00df6cac0be381a9b1`, successivo al merge della PR #121. **S0 Capability Truth Closure**, **S1 Procedure Worklist + RC Reference Closure**, **S2 AR Temporal + Epistemic Effects Closure** e **S3 Runtime Reliability Contract 1.0** sono repository-proven e riconciliate nelle authority correnti. La release resta **candidate / truth-current**: questa riconciliazione non autorizza le label `enterprise-candidate` o `enterprise-ready`.

Restano valide le capability già provate dopo S0: presentation distribuita fra owner locali, SQLite come persistence authority corrente, tenant isolation fisica opzionale, attachment quarantine/trust protocol, trusted-header identity bridge, privacy lifecycle, recovery point cifrati e verificabili, request correlation e observability process-local. S1 aggiunge la worklist condivisa 7/7 e la reference closure RC. S2 rende nativa la causalità AR `review-needed` e gli epistemic effects espliciti sui current material writes. S3 formalizza persistence capability, migration/version policy, durable scheduler lease/fencing, API reliability bounds e SLI/SLO interni.

Queste capability repository non provano automaticamente l'efficacia del deployment. In particolare S3 non implica HA, exactly-once globale, backend migration readiness, production capacity/SLO/alerting o approved RTO/RPO.

## Slice interne chiuse

- **S1 — GAP-015 / GAP-016 — closed:** worklist condivisa 7/7 e default actionable RC corretto, con `v3/procedure-worklist-s1-check.mjs` e `v3/procedure-worklist-s1-saturation.mjs` come evidence repository.
- **S2 — GAP-017 / GAP-018 — closed:** AR stale basis/expiry produce causa nativa `review-needed` senza riscrivere la prior approval; i current material writes dichiarano `metadata.epistemicEffects`, mentre il fallback action-name resta compatibility-only per legacy/non-current.
- **S3 — GAP-010 / GAP-019 — closed:** reliability contract repository-bounded con persistence capability, upgrade/rollback/version refusal, durable lease/fencing, API method/path + size/pagination bounds e internal SLI/SLO/error budget, verificati da `v3/s3-runtime-reliability-check.mjs` e `v3/s3-runtime-reliability-saturation.mjs`.

## Gap aperti interni: chain minima

- **S4 — GAP-020:** contraction proof del compatibility rail e secure-delivery/accessibility core.
- **S5 — GAP-021:** evidence seal necessario prima di qualsiasi promozione a enterprise-candidate.

## Evidence esterna che il repository non può auto-chiudere

- **GAP-007:** efficacia del motore antimalware realmente deployato.
- **GAP-009:** IdP/proxy/MFA/deprovisioning e forza dell'identità del deployment.
- **GAP-012:** validazione con utenti reali e tecnologie assistive.
- **GAP-014:** collector, tracing, retention, alert routing e drill operativi.
- **GAP-022:** branch protection/ruleset e review enforcement osservati nelle impostazioni GitHub. `main@9f56b4444b212b36e5957f00df6cac0be381a9b1` resta osservato `protected=false` e questa evidenza non è auto-chiudibile dal repository.

La quarantena, il protocollo scanner, il bridge trusted-header e la telemetria process-local **non sono gap di assenza della capability repository**. Restano aperti solo i loro residui di efficacia/operatività esterna.

## Stato storico

I gap chiusi o mitigati GAP-001..GAP-006, GAP-008, GAP-010, GAP-011, GAP-013 e GAP-015..GAP-019 restano nel registro canonico come storia verificabile. Le slice successive non li riaprono e non riutilizzano i loro ID per nuovi problemi.

## Regola di chiusura

Un gap repository-internal può diventare `closed` soltanto con path di modifica e test esistenti, evidenza riproducibile e limitazione residua esplicita. Un gap con `closureClass = external-evidence` o `independent-evidence` non può essere chiuso da un file o da un test sintetico del repository: richiede l'evidence indicata dalla propria authority esterna.

Il gate `v3/capability-truth-check.mjs` fallisce chiuso su drift fra release identity, presentation authority, capability census, gap canonici/pubblici, closure S1-S3, blocker lattice S4-S5 ed E4 boundary.
