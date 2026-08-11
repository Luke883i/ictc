# Assurance risk containment

Status: current engineering-risk and information-value contract for PR64. This document defines repository-internal evidence and stop conditions; it does not create product, legal, compliance, certification or repository-administration authority.

## Why this exists

The PR1–PR63 trajectory repeatedly shows a productive expansion -> falsification -> compression cycle, but also two recurring structural risks: the same development circuit can define model, implementation, oracle and closure; and the final user surface can lose the meaning that exists in deeper domain contracts. High scenario counts increase pressure inside a declared model, but they neither manufacture epistemic independence nor guarantee that a person understands why a screen matters.

PR64 therefore targets both assurance mechanics and the onto-epistemic projection from domain truth to final user views. It deliberately avoids a new product profile or business process.

## Trajectory synthesis

ICTC repeatedly expanded and later compressed product abstractions, authority, persistence, GRC, evidence, experience, epistemic lattice and seven business processes. The healthy recurring pattern is **expansion -> falsification -> compression -> new capability**. The missing invariants were:

- safe contraction based on responsibility coverage rather than checker count;
- strict separation among preventive controls, detective evidence, review and technical oracles;
- fail-closed interpretation of assurance inputs;
- a global information-value invariant so that every final view preserves the meaning of the domain objects it exposes.

## Structural audit findings addressed in PR64

1. **Ambiguous evidence input.** Boolean-like document values such as `"false"` must never become positive evidence through truthiness coercion. Invalid, missing, extra or out-of-domain fields fail closed as `input-contract-gap`.
2. **Correlated assurance substitution.** Under `same-circuit` development, static analysis alone is not independent review. Correlation is treated as contained only when independent review is combined with at least one technical oracle channel.
3. **Complexity ratchet.** Minimum checker counts are not assurance. Required responsibility families are now the invariant, so valid consolidation can reduce suite size.
4. **Scenario-count inflation.** 100k saturation is bounded pressure, not a defect probability or certification. Seven wrong-rule mutants must be discriminated.
5. **Document boundary fragility.** Exactly 10k deterministic malformed/document-shaped inputs exercise strings, booleans, numbers, arrays, objects, unknown fields, YAML/JSON/Markdown-like fragments, Unicode and long payloads.
6. **Final-view semantic loss.** Deep claim boundaries are not sufficient if the user-facing surface only exposes operational mechanics. Every navigable ICTC surface now carries a compact explanation of purpose, common governance chain, evidence and limit.

## Atomized intentions

### Assurance and delivery

- **I01 — Typed evidence.** Assurance dimensions accept only declared boolean or enum domains.
- **I02 — Unknown is not safe.** Missing, malformed, extra or non-object evidence becomes `input-contract-gap` with conservative normalization.
- **I03 — Non-substitution.** Post-merge evidence is not prevention; SAST is not review; exact-head evidence is not independence.
- **I04 — Correlation containment.** `same-circuit` assurance requires independent review plus at least one technical oracle channel.
- **I05 — Safe compression.** Release assurance preserves responsibility families, not a historical minimum checker count.
- **I06 — Falsification sensitivity.** Deliberately weakened assurance rules must change observed risk signatures.
- **I07 — Document-boundary robustness.** Schema fuzzing covers exactly 1..10,000 deterministic malformed/document-like cases.
- **I08 — Bounded claims.** Simulation and fuzz counts are engineering evidence, never defect probabilities or certification.
- **I09 — Exact-head closure.** Only CI evidence bound to the final PR HEAD can close the PR DoD.
- **I10 — External residual honesty.** Branch protection, independent review, GHAS entitlement and independent legal/security assessment cannot be self-certified by repository code.

### Onto-epistemic information value

- **I11 — Ontological manifest.** The first Home view states what ICTC is for before asking the user to operate it.
- **I12 — Common compliance denominator.** Every final view preserves the chain **applicable obligation -> risk/impact -> control/action -> responsible person -> evidence -> limit/review**.
- **I13 — Applicability boundary.** ICTC can organize and support applicability work but does not determine legal applicability, conformity, certification or professional conclusions by itself.
- **I14 — Data and AI governance.** The user can see that current persistence/attachments are local-runtime concerns, AI egress follows configured provider/network policy, AI has proposal-only authority and administrative usage/trace evidence is observable.
- **I15 — Professional translatability.** Auditor, engineering and management/finance lenses can read the same underlying objects without creating separate ontologies or fake access roles.
- **I16 — Minimal visual hierarchy.** The information-value projection remains compact, responsive and subordinate to the work surface: maximum semantic density with minimum additional UI.

## Common compliance denominator

ICTC does not assume that every organization is subject to the same law, standard, contract or assurance scheme. Instead it exposes the common work that recurs across cogent regulation, quality systems, security standards and recognized practice:

1. determine which obligations and commitments are actually applicable;
2. understand risk, impact and materiality in the organization’s context;
3. define or select controls and actions;
4. assign human responsibility and decision checkpoints;
5. preserve evidence, versions, provenance and limitations;
6. monitor change, incidents, effectiveness and residual gaps;
7. review and improve rather than treating a score or mapping as final truth.

This common denominator is an organizing method, not a claim that different normative sources are legally equivalent.

## Professional lenses, one ontology

These are interpretive lenses, **not new ICTC access roles**:

- **Auditor:** What was required or claimed? Who decided? What evidence supports it? What is missing or outside the claim?
- **Engineer / technical owner:** Which system/object is affected? Which control or action changes? How is implementation and operational evidence observed? What residual risk remains?
- **CFO / management:** What exposure or material impact matters? Who owns it? What is the priority/cost/trade-off? Which evidence supports the decision and when is review due?

All three lenses resolve to the same canonical chain rather than separate copies of the truth.

## Reticular multi-abstraction DoD

`ASSURANCE_DOD_LATTICE` is executable data in `v3/assurance-risk-model.mjs`. The assurance checker verifies unique nodes, valid dependencies, acyclicity, reachability from global root `G0`, the five layers `axiom -> model -> test -> closure -> global`, and complete representation of I01–I16.

- **Axioms:** claim boundary; unknown is not positive evidence; controls are non-substitutable; human authority/applicability remain explicit.
- **Models:** closed assurance input; reviewer+technical-oracle composition; coverage-family contraction; all-surface information-value contract.
- **Tests:** 100k bounded saturation; 10k document fuzz; mutation discrimination; all-surface semantic/browser projection.
- **Closure:** bounded evidence claim; exact-head CI; explicit residual controls; user-facing informational closure.
- **Global:** `G0`, satisfied only when repository-internal evidence and exact-head CI converge.

`G0` is intentionally not self-asserted by simulation code. Exact-head GitHub CI supplies the external execution evidence required by the closure node.

## Final-view projection

The Home manifest states the product purpose, common method, data/AI governance and claim boundary before the role-specific next action.

Every navigable surface then carries the same compact information primitive:

- **Scopo e valore** — what work is being done and why it matters;
- **Catena comune** — applicable obligations, risk/impact, controls/actions, responsibility, evidence, limits/review;
- **Evidenza** — what this surface can leave behind or make reconstructable;
- **Limite** — what the visible state must not be mistaken for.

For Monitoring, Incidents and each GRC process, purpose is derived from the canonical procedure contract and the visible limit is process-specific. Postura ICTC and Reticolo epistemico retain their own proof/inference boundaries. Administration and AI configuration surface provider/model/budget/usage governance without describing runtime telemetry as deployment certification.

## Executable evidence

`v3/assurance-risk-check.mjs` executes exactly 100,000 deterministic engineering scenarios across 14 assurance dimensions, seven deliberately wrong mutants and exactly 10,000 document-boundary fuzz cases. The generated artifact is `artifacts/assurance-risk-saturation.json`.

`v3/visual-grace-lexical-epistemic-check.mjs` statically checks the canonical labels, all-surface information-value contract, home manifest, procedure-specific boundaries and visual restraint.

`v3/browser-information-value.py` exercises the final rendered product across Home, Processi di Compliance, Monitoring, Incidents, all five GRC process views, Postura ICTC, Reticolo epistemico, all three supported runtime roles, Administration, AI configuration and mobile containment. Navigation/read-only inspection must produce zero API writes.

## Minimality and compression rule

The current release suite preserves assurance **families**, not a minimum checker count. The information-value layer is one shared primitive plus canonical copy, not a new dashboard per persona or framework. PR64 adds no release identity, business process, workflow engine, graph database, compliance score, normative applicability engine or autonomous authority.

## Stop conditions

Repository-internal work stops only when all of the following are true on one final HEAD:

1. I01–I16 are represented by the reticular DoD and `G0` reaches every node;
2. 100k saturation completes and every structural mutant is discriminated;
3. 10k document-boundary fuzz completes and malformed inputs fail closed;
4. all final navigable surfaces preserve purpose, common compliance denominator, evidence and claim boundary;
5. Home exposes the ontological manifest before operational priority;
6. admin-facing AI governance exposes usage/trace meaning without implying deployment certification;
7. desktop and mobile browser falsifiers show no projection overflow and read-only navigation generates no writes;
8. coverage-family validation passes without reintroducing a checker-count ratchet;
9. the full applicable GitHub CI set for the exact final HEAD has no failure, queued or in-progress residue;
10. skipped conditional tooling is reported as skipped, never green;
11. external residual controls remain explicit rather than converted into repository claims.

Only then may PR64 leave draft and merge. This is a bounded repository-engineering DoD, not external certification.

## Residual external controls

Repository code cannot itself create server-side branch protection, an independent human reviewer, GitHub Advanced Security entitlement, deployment controls or independent legal/security assessment. Those remain external/residual controls even when `G0` is satisfied for the PR scope.
