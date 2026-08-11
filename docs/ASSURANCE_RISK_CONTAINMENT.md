# Assurance risk containment

Status: current engineering-risk contract for PR64. This document defines repository-internal evidence and stop conditions; it does not create product, legal, compliance, certification or repository-administration authority.

## Why this exists

The PR1–PR63 trajectory repeatedly shows a productive expansion -> falsification -> compression cycle, but also a recurring structural risk: the same development circuit can define a model, implement it, define its oracle and close the PR. High scenario counts increase pressure inside the declared model; they do not manufacture epistemic independence.

PR64 therefore targets the delivery/assurance mechanics and deliberately avoids a new product profile or business capability.

## Audit synthesis

The strongest trajectory pattern is not monotonic expansion. ICTC has repeatedly deleted and replaced abstractions, and the release process is strongest when compression follows falsification. The unresolved risks were: ambiguous evidence inputs, correlated assurance substitutions, count-based suite ratcheting, review-bandwidth overload, exact-head drift and the temptation to convert external residual controls into internal green claims.

The PR64 audit found two additional definitional defects before closure:

1. boolean-like document values such as `"false"` could previously be coerced by JavaScript truthiness if they reached the model boundary;
2. `same-circuit` assurance could previously be treated as contained by static analysis alone, even though SAST is not a substitute for independent review or oracle diversity.

Both are now fail-closed invariants.

## Atomized intentions

- **I01 — Typed evidence.** Assurance dimensions accept only their declared boolean or enum domains.
- **I02 — Unknown is not safe.** Missing, malformed, extra or non-object evidence becomes `input-contract-gap` with conservative normalization.
- **I03 — Non-substitution.** Post-merge evidence is not prevention; SAST is not review; exact-head evidence is not independence.
- **I04 — Correlation containment.** `same-circuit` assurance is contained only when independent review is combined with at least one technical oracle channel (external static analysis or a heterogeneous technical oracle).
- **I05 — Safe compression.** Release assurance preserves responsibility families, not a historical minimum checker count.
- **I06 — Falsification sensitivity.** Deliberately weakened assurance rules must change observed risk signatures.
- **I07 — Document-boundary robustness.** Schema fuzzing covers 1..10,000 deterministic malformed/document-like cases.
- **I08 — Bounded claims.** Scenario and fuzz counts are engineering pressure, never defect probabilities or certification.
- **I09 — Exact-head closure.** Only CI evidence bound to the final PR HEAD can close the PR DoD.
- **I10 — External residual honesty.** Branch protection, independent human review, GHAS entitlement and independent legal/security assessment cannot be self-certified by repository code.

## Reticular multi-abstraction DoD

`ASSURANCE_DOD_LATTICE` is executable data in `v3/assurance-risk-model.mjs`. The existing assurance checker verifies that the graph is acyclic, every dependency exists, all I01–I10 intentions are represented and root `G0` reaches every node.

| Node | Layer | Meaning | Depends on |
|---|---|---|---|
| A1 | axiom | claim boundary | — |
| A2 | axiom | unknown is not positive evidence | — |
| A3 | axiom | assurance controls are non-substitutable | — |
| M1 | model | closed input contract | A2 |
| M2 | model | review + technical oracle composition | A3 |
| M3 | model | coverage-family contraction | A3 |
| T1 | test | 100k bounded saturation | M1, M2, M3 |
| T2 | test | 10k document-boundary fuzz | M1 |
| T3 | test | mutation discrimination | M2, M3 |
| C1 | closure | bounded evidence claim | A1, T1, T2, T3 |
| C2 | closure | exact-head CI evidence | C1 |
| C3 | closure | external residual controls remain explicit | A1, A3 |
| G0 | global | PR64 global DoD | C2, C3, M3 |

`G0` is intentionally not self-asserted by the simulation process. The checker proves the repository-internal graph and evidence nodes; exact-head GitHub CI supplies C2 externally. This prevents the model from certifying its own execution environment.

## Executable evidence

`v3/assurance-risk-check.mjs` executes exactly **100,000 deterministic engineering scenarios**, split evenly among positive, negative, adversarial and edge families across **14 dimensions**:

- branch protection;
- independent review;
- external static analysis;
- heterogeneous technical oracle;
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

Seven deliberately wrong mutants test non-substitution and sensitivity: post-merge-as-prevention, SAST-as-review, exact-head-as-independence, minimum-count-as-coverage, truthful-skip-as-executed-SAST, ignored coverage loss and assumed mutation sensitivity.

The same checker then executes exactly **10,000 deterministic schema/document fuzz cases**. The corpus includes empty and whitespace strings, boolean-like text, numerics, YAML/JSON/Markdown-shaped fragments, Unicode markers, arrays, objects, unknown fields, non-object roots and a long payload. Every malformed case must produce `input-contract-gap`; a dedicated witness proves the string `"false"` normalizes conservatively rather than becoming truthy evidence.

The generated artifact remains `artifacts/assurance-risk-saturation.json` and records saturation, fuzz, mutation and lattice summaries with replay digests.

## Minimality and compression rule

The current release suite must preserve assurance **families**, not a minimum number of checker files. Consolidation is desirable when it removes duplicate responsibility while preserving coverage, falsifier sensitivity and the DoD graph. PR64 adds no release identity, business process, workflow engine, graph database, compliance score or autonomous authority.

## Stop conditions

Repository-internal work stops only when all of the following are true on one final HEAD:

1. I01–I10 are represented by the reticular DoD and root `G0` reaches all nodes;
2. 100k saturation completes and all structural mutants are discriminated;
3. 10k document-boundary fuzz completes with all malformed inputs rejected fail-closed;
4. coverage-family validation passes and no count ratchet is reintroduced;
5. the full applicable GitHub CI set for the exact final HEAD has no failure, queued or in-progress residue;
6. skipped conditional tooling is reported as skipped, never green;
7. residual external controls remain explicit rather than converted into repository claims.

Only then may PR64 leave draft/merge. This is a bounded repository-engineering DoD, not external certification.

## Residual external controls

Repository code cannot itself create server-side branch protection, an independent human reviewer, GitHub Advanced Security entitlement, deployment controls or independent legal/security assessment. Those remain external/residual controls even when G0 is satisfied for the PR scope.
