# Registro dei gap ICTC

La fonte canonica è `v3/gaps.json`. La UI pubblica soltanto i gap con stato `open` da `v3/public/gap-registry.json`. `v3/capability-truth.json` separa ciò che il repository dimostra da ciò che richiede evidence di deployment o indipendente.

## Baseline corrente

La baseline operativa corrente è `main@0b3bb752efb6251aea83857fe3d64b93b9527b50`, merge della PR #128. L'`auditedAnchor` S0-S3 resta intenzionalmente `main@9f56b4444b212b36e5957f00df6cac0be381a9b1` / PR #121 come fondazione storica lossless; la successiva `latestReconciliation` porta la capability truth al post-merge **S4-A5** senza riscrivere quella genealogia.

**S0 Capability Truth Closure**, **S1 Procedure Worklist + RC Reference Closure**, **S2 AR Temporal + Epistemic Effects Closure** e **S3 Runtime Reliability Contract 1.0** restano repository-proven. Dopo S3 sono ora riconciliate anche le sub-slice **S4-A0 Observability**, **S4-A1 Worklist presentation**, **S4-A2 Editorial composition**, **S4-A3 Specialized local grammar**, **S4-A4 Admin fail-partial truth** e **S4-A5 final-DOM browser/accessibility oracles**. La release resta **candidate / truth-current**: A5-MAIN non autorizza le label `enterprise-candidate` o `enterprise-ready`.

Restano valide le capability già provate dopo S0: presentation distribuita fra owner locali, SQLite come persistence authority corrente, tenant isolation fisica opzionale, attachment quarantine/trust protocol, trusted-header identity bridge, privacy lifecycle, recovery point cifrati e verificabili, request correlation e observability process-local. S1 aggiunge la worklist condivisa 7/7 e la reference closure RC. S2 rende nativa la causalità AR `review-needed` e gli epistemic effects espliciti sui current material writes. S3 formalizza persistence capability, migration/version policy, durable scheduler lease/fencing, API reliability bounds e SLI/SLO interni.

Le sub-slice S4-A0..A5 aggiungono, senza chiudere ancora il parent gap S4, exact-head observability, presentation worklist locale, composizione editoriale owner-declared, grammatiche specializzate MC/EP/Proof, Admin fail-partial e oracoli final-DOM browser/accessibility. Queste capability repository non provano automaticamente efficacia del deployment, human usability o tecnologie assistive reali.

## Slice interne chiuse

- **S1 — GAP-015 / GAP-016 — closed:** worklist condivisa 7/7 e default actionable RC corretto, con `v3/procedure-worklist-s1-check.mjs` e `v3/procedure-worklist-s1-saturation.mjs` come evidence repository.
- **S2 — GAP-017 / GAP-018 — closed:** AR stale basis/expiry produce causa nativa `review-needed` senza riscrivere la prior approval; i current material writes dichiarano `metadata.epistemicEffects`, mentre il fallback action-name resta compatibility-only per legacy/non-current.
- **S3 — GAP-010 / GAP-019 — closed:** reliability contract repository-bounded con persistence capability, upgrade/rollback/version refusal, durable lease/fencing, API method/path + size/pagination bounds e internal SLI/SLO/error budget, verificati da `v3/s3-runtime-reliability-check.mjs` e `v3/s3-runtime-reliability-saturation.mjs`.
- **S4-A0..A5 — sub-slice complete / parent GAP-020 still open:** la progressione macchina è registrata in `capability-truth.s4Progress`, con `completedThrough = S4-A5`, main closure `0b3bb752...` / PR #128 e `nextSlice = S4-A6`.

## Gap aperti interni: chain minima

- **S4 — GAP-020:** resta aperto fino a **S4-A6**, che deve produrre contraction proof del compatibility rail, secure-delivery provenance, rollback receipt e accessibility core senza indebolire A1-A5.
- **S5 — GAP-021:** evidence seal necessario prima di qualsiasi promozione a enterprise-candidate.

## Evidence esterna che il repository non può auto-chiudere

- **GAP-007:** efficacia del motore antimalware realmente deployato.
- **GAP-009:** IdP/proxy/MFA/deprovisioning e forza dell'identità del deployment.
- **GAP-012:** validazione con utenti reali e tecnologie assistive.
- **GAP-014:** collector, tracing, retention, alert routing e drill operativi.
- **GAP-022:** branch protection/ruleset e review enforcement osservati nelle impostazioni GitHub. `main@0b3bb752efb6251aea83857fe3d64b93b9527b50` è osservato `protected=false`; questa evidenza non è auto-chiudibile dal repository.

La quarantena, il protocollo scanner, il bridge trusted-header e la telemetria process-local **non sono gap di assenza della capability repository**. Restano aperti solo i loro residui di efficacia/operatività esterna.

## Stato storico

I gap chiusi o mitigati GAP-001..GAP-006, GAP-008, GAP-010, GAP-011, GAP-013 e GAP-015..GAP-019 restano nel registro canonico come storia verificabile. Le sub-slice S4-A0..A5 non riutilizzano ID di gap e non dichiarano chiuso GAP-020: sono progressione interna alla sua chiusura.

## Regola di chiusura

Un gap repository-internal può diventare `closed` soltanto con path di modifica e test esistenti, evidenza riproducibile e limitazione residua esplicita. Un gap con `closureClass = external-evidence` o `independent-evidence` non può essere chiuso da un file o da un test sintetico del repository: richiede l'evidence indicata dalla propria authority esterna.

Il gate `v3/capability-truth-check.mjs` fallisce chiuso su drift fra release identity, presentation authority, foundation anchor S0-S3, latest reconciliation A5-MAIN, capability census, gap canonici/pubblici, progressione S4, blocker lattice S4-S5 ed E4 boundary. Il registro pubblico deve essere una proiezione esatta degli open gap canonici, non soltanto una lista di ID coincidente.
