# Procedure ontology final maturity audit

Baseline: `main@d165b0f1780938bab22b6447fa38d339efc34927` (merge of PR #66).

## Scope and authority

This audit closes residual procedure-ontology requirements without creating another procedure registry, risk source, benchmark catalogue or legal classifier. Runtime procedure identity/state/transitions remain owned by `v3/runtime/procedure-contracts.mjs`; completion criteria, handoffs and benchmark bindings remain owned by `v3/procedure-dod.mjs`; benchmark practice/evidence/limits remain owned by `v3/standard-proof-1-6-contract.json`; risk state remains owned by `v3/runtime/grc-risks.mjs`.

The five DoD items of each procedure are native completion expectations, not five universal workflow phases. The four process-landscape phases are only a UX grouping. Neither is allowed to rewrite the other.

## Procedure-by-procedure expectation lattice

| Procedure | Promise embodied by ICTC | Native logical progression | Standard/practice bindings | Cross-feed expectations | Adversarial expectation |
| --- | --- | --- | --- | --- | --- |
| RN-01 Monitoraggio normativo e fonti | Observe a bounded objective/source space, preserve originals, make review/impact decisions | perimeter/objective -> human activation -> original preservation -> source decision -> impact decision | ISO 37301 -> steps 1,2,4,5; SRE observability -> 2,3,4 | drafts to objects, coverage, actions, risks; source provenance survives | no source may silently become applicable, authoritative or complete because it was observed |
| EC-01 Incidenti e quasi incidenti | Preserve the original report and awareness time, distinguish formulation from human event/submission decisions | original -> human event kind -> reconstructable versions -> submission/closure -> acknowledged downstream work | NIST CSF 2.0 -> 1..5; ISO 37301 -> 1,4,5 | drafts to objects, actions, risks | AI/formulation changes cannot rewrite the original or inherit a submission/closure decision |
| AO-01 Inventario di sistemi e oggetti | Maintain governed identity/version/authority relationships and re-attestation | source authority -> candidate review -> version/relations -> re-attestation -> retire/reject | ISO 37301 -> 1,2,4,5; NIST CSF 2.0 -> 1,3,4 | drafts to monitoring, coverage, actions, risks, assurance | stale/unattested objects remain visible as stale; a relation cannot substitute object authority |
| MC-01 Standard e Controlli | Separate standard provenance/use, requirement applicability, mapping review, gaps and crosswalk rationale | edition/provenance -> human scope -> proposed mapping -> reviewed disposition -> rationale/supersession | ISO 37301 -> 1..5; NIST CSF 2.0 -> 1..5 | drafts to objects, actions, risks, assurance | tracked standard != applicable requirement != effective control != conformity/certification |
| AP-01 Azioni correttive | Turn an accepted origin into owned work whose completion and verified closure remain distinct | origin/owner -> human adoption/priority -> progress -> completion candidate -> verified close/cancel | ISO 37301 -> 1,2,4,5; SRE observability -> 3,4,5 | drafts to risks, assurance | progress/completion cannot self-promote to verified closure; cancellation needs rationale |
| RC-01 Rischi di compliance | Record a scenario and bindings, keep rating/treatment/residual review human, project one canonical matrix | scenario/bindings -> human inherent rating -> human treatment -> mitigation links -> residual/review cadence | ISO 37301 -> 1..5; NIST CSF 2.0 -> 1..5 | drafts to actions, assurance, coverage | AI ratings stay overlays; normative/legal nature is never inferred from text or score |
| AR-01 Questionari e verifiche | Preserve the request, make every answer disposition/evidence/limitation reconstructable, require human approval/version | original request -> dispositions -> proposed AI draft -> evidence/limits -> human-approved version | ISO 37301 -> 1,2,4,5; GOV.UK/USWDS practices -> 2,3,4,5 | drafts to actions, risks, coverage | proposed text/evidence cannot become assurance, certification or approved response implicitly |

## Cross-procedure invariants

A handoff is typed `cross-procedure-draft-from`. It may create a target draft, but must preserve source procedure, source subject and source state revision. It must not mutate the source, transfer a human decision, inherit legal applicability, copy a risk rating as truth or turn an assurance conclusion into a target conclusion. Cycles are permitted only as explicit new drafts/reviews; no cycle may self-certify or erase provenance.

The expected sequence is therefore local plus cross-referential: source fact/decision -> typed draft -> target-native checkpoint -> target-native evidence -> target-native human decision -> optional reviewed handoff. Each target remains accountable to its own contract.

## One canonical risk matrix, many projections

`v3/runtime/grc-risks.mjs` remains the only risk-state owner. The 5x5 heatmap is a projection over human-reviewed ratings, preferring residual over inherent when available. Origin, object, normative reference, control and specificity are alternative facets over the same canonical risk IDs; drilldown must reconstruct those IDs rather than create another risk dataset.

Normative specificity is explicit-only. The regression fixture `IT-DLGS231-2001-ART24BIS` models a mapping owner explicitly registering D.Lgs. 231/2001 art. 24-bis. The risk projection may surface that exact registered reference and its canonical risk ID; it must not synthesize a `legalClassification`, infer a predicate offence from scenario text or treat the mapping as a legal-applicability conclusion.

Official legal reference used for the fixture: Normattiva, D.Lgs. 8 giugno 2001 n. 231, art. 24-bis, “Delitti informatici e trattamento illecito di dati”: https://www.normattiva.it/uri-res/N2Ls?urn%3Anir%3Astato%3Adecreto.legislativo%3A2001-06-08%3B231~art24bis-com3=

## Standards application without certification drift

A benchmark reference is no longer sufficient by itself. Every procedure benchmark must bind to one or more native DoD method-step numbers. The runtime resolves the existing standard-proof catalogue to show benchmark name, repository practice, evidence paths and the existing limitation. Missing, duplicate, extra or out-of-range bindings are ontology faults.

Primary benchmark references remain the existing catalogue sources, including ISO 37301:2021 (https://www.iso.org/standard/75080.html), NIST CSF 2.0 (https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20), Google SRE monitoring practices and the GOV.UK Design System. These are implementation/practice references. ICTC does not thereby determine organisational conformity, legal applicability or certification.

## Deterministic falsification contract

`v3/procedure-ontology-saturation.mjs` must establish all of the following on every exact-head semantic release run:

- exactly 10,000 dedicated clean simulations distributed deterministically across all seven procedures and typical/edge/stress/adversarial families;
- exactly 10,000 additional global clean simulations;
- exactly 10,000 generated mutations, with every declared fault family exercised and every mutant killed;
- discovery from iteration 1 through finite `M`, followed by the next exact 1,000 generated states on the same PRNG stream (`M+1000`) with zero new normalized signatures and zero target violations;
- a compression frontier where removing any retained normalized fault dimension is lossy and merging any two distinct normalized fault families is lossy; therefore zero tested one-step lossless compressions remain inside the declared model;
- a SHA-256 digest over the full machine-readable summary in `artifacts/procedure-ontology-saturation.json`.

The compression statement is deliberately bounded: it proves irreducibility only for the declared normalized invariant vocabulary and the tested one-step ablation/pair-merge operators. It is not a mathematical proof that no other ontology, representation or future product compression could exist.

## Claim boundary and residual assurance

These checks are correlated engineering evidence produced inside the same development circuit. They do not establish legal compliance, complete standards coverage, control effectiveness, production security, representative-user comprehension, certification or independent assurance. Deployment attestations and independent review remain external evidence.
