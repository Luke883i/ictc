# Assurance risk containment

Status: current engineering-risk contract. This document does not create product, legal, compliance, certification or repository-administration authority.

## Why this exists

The PR1–PR63 trajectory repeatedly shows a healthy expansion -> falsification -> compression cycle, but also a recurring structural risk: the same development circuit can define a model, implement it, define its oracle and close the PR. High scenario counts improve pressure inside the declared model; they do not create independence from that model.

The minimum containment strategy therefore targets delivery mechanics rather than adding another product profile.

## Trajectory synthesis

- PR1–PR5 established the epistemic foundation, executable runtime, evidence atlas and stable local boundary.
- PR6–PR13 repeatedly expanded and then compressed UI/product abstractions, ending in two explicit human-authoritative evidence journeys.
- PR14–PR20 hardened identity, AI egress, enterprise posture and runtime stress while keeping external deployment blockers explicit.
- PR21–PR28 iterated heavily on experience, accessibility, standard proof, identity bridge and certification-evidence surfaces.
- PR29–PR43 introduced compensating GitHub-Free governance, executable authority maps, durability/integrity controls, API/release identity and server-owned projections/ontology.
- PR44–PR56 converged active UI authority, process kernels, GRC, stable compression, SQLite semantic history and authority/integrity closure.
- PR57–PR63 added experience refinement, epistemic lattice, seven-process journeys, onto-compliance semantics, lexical/visual convergence and meaningful cross-process handoffs.

Across the trajectory, the strongest pattern is not monotonic expansion: ICTC is capable of deleting and replacing abstractions. The missing invariant was making safe contraction first-class in the release assurance itself.

## Structural risks and containment

1. **Preventive governance gap.** `main` protection is an external repository-owner control. Post-merge evidence and GOV-01F remain detective/compensating controls and must never be described as server-side prevention.
2. **Independent review gap.** Automated exact-head evidence cannot prove that a second independent reviewer inspected the change. Review independence remains external evidence.
3. **Correlated assurance.** Model, implementation, oracle and closure may originate in the same human+AI circuit. External SAST, independent review and heterogeneous runtime/browser oracles reduce this risk; scenario count alone does not.
4. **Review bandwidth.** Large changes without independent review are explicitly a delivery risk even when every internal checker is green.
5. **Complexity ratchet.** Coverage is now expressed as required assurance families with substitutable candidate checks. A safe consolidation may reduce checker count without failing merely because the suite became smaller.
6. **Coverage regression.** Contraction is permitted only when each required family remains represented. Deleting checks while losing a required family remains a hard failure.
7. **Exact-head truth.** Evidence belongs to the commit on which it ran. Old green checks are genealogy, not current closure evidence.
8. **Skipped external analysis.** Truthful disclosure of a skipped tool is required, but a disclosed skip is still not an executed independent oracle.

## Executable model

`v3/assurance-risk-model.mjs` contains the bounded project-risk semantics and the coverage-family contract.

`v3/assurance-risk-check.mjs` executes exactly 100,000 deterministic scenarios split evenly among positive, negative, adversarial and edge families across 13 dimensions:

- branch protection;
- independent review;
- external static analysis;
- exact-head evidence;
- post-merge evidence;
- change surface;
- model/oracle coupling;
- suite expansion/contraction;
- coverage-vs-count contract;
- coverage preservation;
- mutation sensitivity;
- truthful skipped-tool reporting;
- PR-vs-direct-push delivery.

Six deliberately wrong mutants test the detector: post-merge evidence substituting prevention, SAST substituting review, exact-head evidence masking correlated assurance, minimum checker count masquerading as coverage, a truthful skip masquerading as executed SAST, and coverage loss being ignored.

The generated artifact is `artifacts/assurance-risk-saturation.json`.

## Minimality rule

The current release suite must preserve assurance **families**, not a historical minimum number of checker files. Consolidation is desirable when it removes duplicate responsibility while preserving the family contract and falsifier sensitivity.

No new release identity, business process, workflow engine, graph database or compliance conclusion is introduced by this containment layer.

## Residual external controls

This repository change cannot itself create server-side branch protection, a human reviewer, GitHub Advanced Security entitlement, deployment controls or independent legal/security assessment. Those controls must remain visible as external/residual rather than being converted into internal green claims.
