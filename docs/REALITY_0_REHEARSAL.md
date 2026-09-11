# REALITY-0 — target × AS-IS rehearsal

REALITY-0 rehearses the merged SCOPE-0 target against the repository/runtime AS-IS anchored at `main@508ac901ea9d9ab60dba8438340b7ef9db9c08c7` (merge of PR #139). It is an evidence/classification slice. It does not choose a replacement architecture and does not change business write authority, APIs, persistence semantics or UI behavior.

## Why this slice exists

SCOPE-0 deliberately defined bounded targets without laundering them into capability claims. REALITY-0 asks which targets already fit, which fit only with explicit boundaries, which are only partially supported, which remain unverified envelopes, which depend on external evidence, and which contradict AS-IS. Only DECIDE-0 may convert those findings into structural implementation choices.

## Use-case lattice

The deterministic use-case lattice contains **12,096 distinct semantic scenarios**:

`7 procedures × 3 roles × 8 operations × 4 evidence states × 3 topologies × 2 AI modes × 3 pressure/failure modes`.

Operations: observe, create, propose, review, decide, verify, export, recover. Evidence states: absent, declared reference, version-bound, receipt-bound. Topologies: loopback single-node, networked single-node, bounded multi-tenant. Pressures: nominal, stale/conflict, burst/failure.

Every scenario crosses nine layers: product, UI, API, authority, Store, persistence, AI, operations and epistemic semantics. The oracle preserves twelve non-equivalences/boundaries, including proposed ≠ decided, evidence ≠ conclusion, mapping ≠ conformity, completed ≠ closed+verified, green CI ≠ deployment assurance, AI ≠ human decision authority, tenant selector ≠ membership grant, failed/stale write ≠ visible committed state, and export = same-as-read.

This is a semantic scenario lattice. It is not 12,096 full browser sessions or production deployments.

## Rehearsal result

| SCOPE | Verdict | REALITY-0 finding |
| --- | --- | --- |
| 01 operator/buyer | partial-fit | professional personas and runtime roles exist; representative operator/buyer validation remains E3 |
| 02 must-win jobs | fit | native journeys preserve basis, human decisions, cross-process work, evidence and verified closure |
| 03 seven-process breadth | fit | seven peer procedures + cross-cutting EP-01 match target |
| 04 topology | bounded-fit | loopback primary fits; networked/multi-tenant remains conditional on trusted identity/deployment controls |
| 05 scale/concurrency | unverified-envelope | mechanisms exist, but SCOPE numeric envelope is not an end-to-end capacity benchmark |
| 06 clients | bounded-fit | Chromium/390 repository rails exist; cross-engine/representative AT evidence is outside E2 |
| 07 install/update/rollback | partial-fit | launcher, migration/recovery rollback exist; C2 provenance remains open |
| 08 data/residency | bounded-fit | local SQLite/tenant isolation fits; egress/key/scanner deployment controls change the boundary |
| 09 availability/recovery | partial-fit | encrypted verified recovery exists; HA/off-host/approved RTO-RPO remain unproven |
| 10 integrations/master systems | fit | bounded intake, upstream identity, optional AI and same-as-read export preserve external master authority |
| 11 roles/delegation/SoD | fit | admin/user/auditor + server-side membership + no AI authority fit bounded target |
| 12 success metrics | external-dependent | E2 structure is measurable; representative time/task/comprehension/AT outcomes remain E3 |
| 13 architecture budget | fit | Node/vanilla/Store/SQLite/one-root AS-IS matches default target; no hard contradiction forces replatforming |

Summary: **5 fit, 3 bounded-fit, 3 partial-fit, 1 unverified-envelope, 1 external-dependent, 0 contradiction**. Zero hard contradiction is not proof that the target is fully satisfied; it means REALITY-0 found no repository evidence that presently forces a structural replatform.

## DECIDE-0 handoff

DECIDE-0 receives seven bounded inputs: preserve current architecture unless evidence overrides; measure capacity before any scale claim via C3; close delivery provenance via C2; preserve E3 human validation; preserve E4 identity/scanner/recovery/alerting boundaries; execute UIUX convergence only with C5 owner-compression terminal; and do not select event-store/HA/OIDC/replatforming merely because they are familiar enterprise patterns.

## Falsification

The local candidate enumerates all 12,096 baseline use cases with zero oracle violation. A separate deterministic campaign materializes 63 harmful mutation families and then executes **1,000,000** mutations over fresh REALITY assessment state, runtime-derived observation state and per-use-case invariants. DoD: 63/63 material families killed, zero survivors, zero harness errors. Final deterministic digest: `76c87d415ac74c95dcb523285b80921836b0b3a282f4b77feaa9b03d5356746a`. Exact result is emitted by `v3/reality-0-saturation.mjs` and must be rerun by the canonical semantic rail on the PR exact-head.

The million is E2 model/validator mutation evidence. It is not a million HTTP requests, browser runs, user studies, independent code mutants or deployment executions.

## Claim boundary

REALITY-0 can support only a repository/runtime-observable rehearsal at an exact SHA. Human operator fit, task effectiveness, assistive-technology usability and pleasantness remain E3-HUMAN. Branch protection/independent review remain E3-GOV. Production identity, scanner efficacy, external key custody, off-host recovery objectives, collector/alerting and signed provenance effectiveness remain E4-DEPLOY. `enterpriseCandidate` and `enterpriseReady` remain false.
