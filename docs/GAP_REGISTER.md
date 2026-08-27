# Registro dei gap ICTC

La fonte canonica è `v3/gaps.json`. La UI pubblica soltanto i gap con stato `open` da `v3/public/gap-registry.json`. `v3/capability-truth.json` separa ciò che il repository dimostra da ciò che richiede evidence di deployment o indipendente.

## Baseline corrente

S0 Capability Truth Closure parte dal `main` successivo al merge della PR #116. La release resta **candidate / truth-current**: S0 non introduce nuove capability di business e non autorizza le label `enterprise-candidate` o `enterprise-ready`.

Le authority post-#116 già correnti restano valide: presentation distribuita fra owner locali, SQLite come persistence authority corrente, tenant isolation fisica opzionale, attachment quarantine/trust protocol, trusted-header identity bridge, privacy lifecycle, recovery point cifrati e verificabili, request correlation e observability process-local.

Queste capability repository non provano automaticamente l'efficacia del deployment.

## Gap aperti interni: chain minima

- **S1 — GAP-015 / GAP-016:** worklist condivisa 7/7 e default actionable RC corretto.
- **S2 — GAP-017 / GAP-018:** AR review-needed con causa nativa ed epistemic effects espliciti.
- **S3 — GAP-010 / GAP-019:** reliability contract: restart/lease, persistence port, migration/rollback, API compatibility/capacity e SLI/SLO.
- **S4 — GAP-020:** contraction proof del compatibility rail e secure-delivery/accessibility core.
- **S5 — GAP-021:** evidence seal necessario prima di qualsiasi promozione a enterprise-candidate.

## Evidence esterna che il repository non può auto-chiudere

- **GAP-007:** efficacia del motore antimalware realmente deployato.
- **GAP-009:** IdP/proxy/MFA/deprovisioning e forza dell'identità del deployment.
- **GAP-012:** validazione con utenti reali e tecnologie assistive.
- **GAP-014:** collector, tracing, retention, alert routing e drill operativi.
- **GAP-022:** branch protection/ruleset e review enforcement osservati nelle impostazioni GitHub.

La quarantena, il protocollo scanner, il bridge trusted-header e la telemetria process-local **non sono più gap di assenza della capability repository**. Restano aperti solo i loro residui di efficacia/operatività esterna.

## Stato legacy

I gap chiusi o mitigati GAP-001..GAP-006, GAP-008, GAP-011 e GAP-013 restano nel registro canonico come storia verificabile. S0 non li riapre e non riutilizza i loro ID per nuovi problemi.

## Regola di chiusura

Un gap repository-internal può diventare `closed` soltanto con path di modifica e test esistenti, evidenza riproducibile e limitazione residua esplicita. Un gap con `closureClass = external-evidence` o `independent-evidence` non può essere chiuso da un file o da un test sintetico del repository: richiede l'evidence indicata dalla propria authority esterna.

Il gate `v3/capability-truth-check.mjs` fallisce chiuso su drift fra release identity, presentation authority, capability census, gap canonici/pubblici, slice interne ed E4 boundary.
