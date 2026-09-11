# SCOPE-0 — Product Operating Model target envelope

This document explains the machine-readable candidate in `v3/scope-0-model.json`. The JSON is the executable target-envelope authority for this slice; `docs/PRODUCT.md` remains the authority for product identity and constitutional claim boundaries. SCOPE-0 is a target decision, **not** evidence that the AS-IS runtime already meets the target.

## Minimal operating-model decision

ICTC targets a **customer-controlled, single-node compliance workgroup** led by a compliance/GRC operator, with contributors and read-oriented assurance users. It keeps exactly seven business procedures, a browser-first client, the current Node/SQLite architecture by default, bounded multi-tenancy, human decision authority and explicit external-evidence boundaries. REALITY-0 must now try to break this target against the actual runtime before DECIDE-0 may authorize structural changes.

## Thirteen scope decisions

| ID | Dimension | Candidate decision | What it does **not** prove |
|---|---|---|---|
| **SCOPE-01** | primary operator and buyer | Compliance/GRC lead or small central team is primary operator; accountable Compliance/GRC/Internal-Control function owner is buyer/sponsor target; market validation remains not-assessed. | Actual buyer demand or product-market fit. |
| **SCOPE-02** | must-win jobs | Seven must-win jobs: triage, preserve original basis, human decisions, cross-process routing, verified closure/review, bounded evidence, AI without authority transfer. | Legal correctness of a decision. |
| **SCOPE-03** | seven-process breadth | Exactly seven business processes remain the product breadth; EP-01 is cross-cutting only; disablement preserves history/evidence. | Equal feature depth across procedures. |
| **SCOPE-04** | deployment topology | Primary topology is customer-controlled single node, loopback by default; bounded multi-tenant/networked operation is conditional; no direct public bind or HA cluster target. | Production deployment security or HA. |
| **SCOPE-05** | scale and concurrency | Design envelope: <=50 named users/tenant, <=10 simultaneous sessions/tenant, <=5 tenants/node, <=10k active records/tenant, write burst <=5; these are unverified design targets. | Benchmarked capacity or SLA. |
| **SCOPE-06** | supported clients | Primary client is evergreen Chromium desktop; responsive down to 390px is secondary for review/triage; no native/offline/legacy-browser target. | Firefox/Safari/AT support. |
| **SCOPE-07** | install/update/rollback support | Versioned bundle + ictc.sh; planned updates, pre-change recovery for schema changes, compatibility-aware code rollback and recovery-point data rollback; no auto/zero-downtime updater. | Signed provenance before C2 closes. |
| **SCOPE-08** | data sensitivity/residency | Internal/confidential compliance and personal data may occur; customer-controlled local residency is primary; secrets stay out of business state; external egress changes residency. | Suitability for every regulated/special-category workload. |
| **SCOPE-09** | availability/recovery/capacity | Business-hours workbench, planned downtime allowed, no universal SLA/HA/RTO/RPO promise; encrypted verified recovery is required and deployment objectives remain E4. | Approved RTO/RPO or off-host durability. |
| **SCOPE-10** | integrations/master systems | Manual/source-pack/external-reference intake, upstream identity, optional AI and same-as-read exports; external master systems keep document authority; no mandatory bidirectional sync. | External system authenticity or sync correctness. |
| **SCOPE-11** | roles/delegation/SoD | Keep admin/user/auditor; delegation via ownership/assignee and tenant membership; AI has no decision authority; universal hard maker-checker is not claimed. | Universal organization-specific SoD enforcement. |
| **SCOPE-12** | product success metrics | Success = E2 traceability/receipts/7-process/surface contracts plus E3 targets for time-to-action, task completion, epistemic comprehension and AT blockers; no compliance score or market-fit inference. | Current metric attainment, usability or market fit. |
| **SCOPE-13** | feature/architecture budget and non-goals | Preserve current Node/vanilla/Store/SQLite/one-root architecture by default; structural rewrites require REALITY evidence and DECIDE authority; no second store/global UI resolver/generic BPM by default. | That current architecture will survive REALITY-0 unchanged. |

## Cross-cutting UIUX constraint

SCOPE-0 inherits the #138 UIUX study instead of duplicating it: 13 canonical surfaces; repeated registries are row/list-first; one identity/purpose and at most one primary action per context; state, owner/authority, next action and claim boundary remain visible when material. Mobile is secondary and cannot reorder meaning. Aesthetic quality and representative usability remain E3-HUMAN.

## Handoff to REALITY-0

REALITY-0 must test this target against the current runtime and produce a target-vs-AS-IS matrix, capacity/concurrency rehearsal, deployment and identity rehearsal, install/recovery rehearsal, integration authority map, UIUX/client rehearsal and an explicit decision log. A failed target assumption is a useful result: it must become a DECIDE-0 choice, not be hidden by changing both product and test.

## Claim boundary

SCOPE-0 is a repository-bounded target decision. Numeric scale values are design-envelope inputs for REALITY-0/C3, not performance guarantees. Chromium/mobile statements are target support choices, not cross-engine or assistive-technology evidence. Networked identity, scanner efficacy, off-host recovery, key custody and observability remain E4 deployment evidence; perceived usability/operator fit remain E3-HUMAN; market fit remains not assessed.

## Runtime-semantic falsification

The SCOPE-0 oracle normalizes the target decisions together with observations read from the canonical product contract, server source, architecture/operations authorities, UIUX scope model, personas and SubjectVersion limit. It exposes 171 validated semantic fields, including 44 repository/runtime-observation fields.

`v3/scope-0-saturation.mjs` first materializes one corruption per semantic field and requires every family to be killed. It then executes **1,000,000 deterministic trials**; each trial creates a fresh normalized state, applies 1–4 distinct corruptions, and executes the full semantic validator on the mutated state. Final local result: **171/171 material families killed; 2,499,816 mutations applied; 0 survivors; 0 harness errors**. Of the applied corruptions, 643,803 targeted runtime-observation fields.

This is **E2 repository/runtime-semantic evidence**. It is not one million HTTP requests, server processes, browser sessions, human studies, independent code mutants, deployment tests or external assurance. The exact seed is `ictc-scope-0-runtime-semantic-2026-09-11`.
