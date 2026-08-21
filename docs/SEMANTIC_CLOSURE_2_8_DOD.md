# Semantic Closure 2.8 — accepted repository closure record

Status: merged / repository-accepted
Date: 2026-08-21
Original base: `main@a38db0261fb1298fda6617bcc7ab6f3f7a1dae75`
Merged by: PR #95
Accepted PR head: `351bdd535fd83a4fba5e92b3927dedd8dbe44724`
Merge commit on main: `a7ad0a60f07321347f8c6d9bf0c5396ba80c4d68`

## Scope

Semantic Closure 2.8 converted second-order temporal, evidence, causal, cross-process and UI lifecycle findings into repository invariants without adding a business process or a new constitutional owner. This record describes the merged state; it is no longer a candidate checklist.

`accepted` means the PR exact head satisfied the repository checks observed for PR #95. It does not mean production readiness, deployment assurance, legal/compliance assurance, historical transaction reconstruction, remote evidence authenticity, or complete vertical maturity of RC/AR.

## Closed finding families

1. `contract-transition-runtime-guard-drift`
2. `reason-required-contract-bypass`
3. `residual-shadowing-new-inherent-cycle`
4. `stale-treatment-leaks-new-risk-cycle`
5. `external-evidence-observed-but-unversioned`
6. `action-ai-producer-misclassified`
7. `cross-procedure-draft-cycle-amplification`
8. `generic-handoff-predicate-semantic-flattening`
9. `unregistered-semantic-finalizer-after-constitutional-flush`
10. `projection-commit-bypasses-experience-lifecycle`
11. `outcome-envelope-doctrine-projection-drift`

The 2.8 saturation encodes 10,000,000 deterministic model cases plus 1,000,000 mutants with a 100,000-mutant holdout. Those counts are bounded repository falsification evidence over the declared vocabulary, not probabilities or proof that the vocabulary is complete.

## Accepted invariants

- RN activation contract and runtime checkpoint are aligned.
- the current RC review is selected by temporal cycle; stale residual/treatment state cannot silently shadow a newer inherent review;
- new risk treatment decisions bind the effective review digest;
- external evidence is decision-usable only when a version or digest identifies the observed basis;
- known AI legacy producers are classified as proposed and retain recorded technical basis;
- cross-process creation uses intent-specific predicates, bounded lineage depth 8 and cycle rejection;
- C0.1 remains the final UI semantic converger and consumes rendered/surface/context/projection-committed events;
- read projections remain authority-bounded projections while writes retain OutcomeEnvelope/receipt lineage;
- seven business processes remain exactly seven; EP-01 remains cross-cutting.

## Repository acceptance evidence

The final PR #95 head `351bdd535fd83a4fba5e92b3927dedd8dbe44724` was observed with all ten acceptance contexts successful: stable diagnostic, semantic diagnostic, runtime diagnostic, contract/audit, runtime E2E, browser journeys, epistemic professional browser, launcher smoke, exact-head CI, and actions census. The merge commit itself is not used as a substitute for that exact-head evidence.

## Residual frontier handed to 2.9+

- action-name inference remained a compatibility mechanism after 2.8; Runtime Stabilization 2.9 consumes the promotion-by-name and uncovered-AI portions of that debt while preserving explicit `metadata.epistemicEffects` as the forward contract;
- transaction-time historical selection remains unsupported and fail-closed;
- remote drift monitoring for version-bound external EvidenceRef remains unimplemented;
- RC-01 and AR-01 remain less vertically fine-tuned than RN/EC/AO/MC/AP;
- compatibility UI/history rails remain candidates for later compression;
- repository CI remains distinct from deployment evidence.

## Acceptance checklist — historical result

- [x] branch from exact main base
- [x] temporal/evidence closure without new owner
- [x] typed handoffs and bounded lineage
- [x] known legacy AI causality pinned
- [x] C0.1 context/projection convergence
- [x] targeted falsifiers
- [x] deterministic 10M + 1M saturation encoded in current gate
- [x] README / architecture / epistemic / ADR / testing / development parity for the slice
- [x] exact-head GitHub Actions green on PR #95 head

This document is a historical repository closure record. Successor slices must not reinterpret it as a claim of external or substantive compliance assurance.
