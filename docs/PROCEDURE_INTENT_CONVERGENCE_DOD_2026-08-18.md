# Procedure intent convergence DoD

This document turns the product request into an executable convergence plan. It is subordinate to the executable owners declared in `docs/authority-matrix.yaml`.

## Intent mined from the request

The target is not a literal restyling of five pages. ICTC must make each procedure legible from the nature of the object it governs, reduce cognitive load continuously, keep cross-procedure references useful without transferring authority, and keep DEMO data semantically faithful enough to act as a realistic falsifier.

The common product question is: **what am I governing, what human decision is needed now, what evidence will remain, and what does this state not prove?** Technical trace, history, raw AI output, confidence scores and hashes are secondary detail.

## Global DoD

1. Seven distinct procedure ontologies remain non-collapsible.
2. Every visible control in the selected runtime surfaces is anchored to process, stage, intent, authority and evidence effect.
3. A decision context exposes at most one primary action.
4. Workflow state, evidence state and substantive meaning never share one status vocabulary.
5. Cross-procedure automation creates typed draft/review work only.
6. DEMO data conforms to the native object and lifecycle of the owning procedure.
7. RN-01 DEMO contains only binding EU law, binding Italian law, competent-authority decisions, or public jurisprudence/case information without personal data.
8. EC-01 defaults to one current question and hides history/AI trace behind drilldown.
9. AO-01 exposes identity, source authority, owner and review/attestation state before edit affordances.
10. MC-01 concept atoms contain reference, concept, intent, expected outcome, evidence question, scope status, source authority and version; drilldown is opaque.
11. AP-01 exposes origin, owner, next work step and closure criterion in one work narrative; completion never equals verified closure.
12. RC-01 and AR-01 remain regression-safe and preserve their current human-rating/internal-approval boundaries.
13. Mutation kill rate is 100% for all declared ontology/cognitive/demo fault families.
14. Discovery reaches finite M and the exact next 1,000 seed-separated scenarios produce zero novel normalized failure families.
15. Release evidence is accepted only on the exact PR HEAD and every applicable CI check is successful.

## Local DoD and metrics

- RN-01: exactly four source classes; all contributor paths share one filter; a proposed class is not self-authenticating; verification needs independent classification evidence, publishing authority and a reconstructable reference; zero out-of-nature DEMO sources.
- EC-01: one material question and one primary action at a time; original narrative immutable; legal/notification meaning remains outside operational classification.
- AO-01: severe-auditor read path needs no technical drilldown to establish identity, authority basis, accountable owner and last/next review; stale or rejected remains visible.
- MC-01: every displayed framework concept is atomically complete; no concept abstraction masquerades as normative wording; mapping/scope/effectiveness remain distinct.
- AP-01: origin and expected outcome are reconstructable; owner and next step are visible; completion evidence and closure verification are separate.
- RC-01: every rating presentation says it is a human judgment; no score implies objective probability or legal significance.
- AR-01: original request, answer disposition, evidence/limitation and approved response version remain separate; internal approval never reads as independent assurance.

## Final pre-merge hardening DoD

1. **Authority minimization:** zero new semantic/runtime owners in the hardening cycle; fixes extend canonical owners.
2. **RN closed universe:** every new/revised mission persists exactly the four RN source classes; subsets and extra classes fail closed.
3. **RN classification integrity:** `sourceClass` may resolve compatible independent evidence but may never create it. Type-backed signals outrank host-only ambiguity. A guideline does not become Italian binding law merely because jurisdiction is Italy; a vendor release note cannot become EU law by labeling itself so.
4. **RN verification provenance:** a source cannot become `verified` without independently supported class, publishing authority and reconstructable reference (URL, identifier or preserved contribution). The basis remains attached to the decision.
5. **DEMO idempotence:** a second `applyDemoRealityContext()` after convergence produces deep-equal state. Target: 700/700 stable records.
6. **AO governed-field integrity:** DEMO `sourceAuthority` migration increments version exactly once, records a migration edge and recomputes canonical digest. Pre-existing due state is preserved; otherwise the DEMO persona re-attests the new version explicitly.
7. **MC decision-first metrics:** primary dashboard/procedure card expose mapping decision/gap/review counts, never `coveragePercent`; analytical percentage may remain only in bounded compatibility projection.
8. **AP closure integrity:** primary projections consume `readyForReview` and `closed`; legacy `done` is compatibility-only and never means verified closure.
9. **Mutation frontier:** all **20** declared failure families must be killed; finite M followed by exact M+1000 must add zero genuinely new normalized family.
10. **Exact-head CI:** final SHA must report every required ICTC status successful, including runtime diagnostic and exact-head verdict.

## Challenging success metrics

- Procedure ontology separation: **7/7**; collapsed object/decision/evidence contracts: **0**.
- Primary actions per decision context: **<=1**.
- RN write-path coverage: **3/3** (scheduled AI, human contribution + AI enrichment, manual observation).
- RN mission source universe persistence: **100% exact-four**.
- RN verified-source basis: **100% independent class evidence + authority + reconstructable reference**.
- RN label-laundering survivors: **0**.
- DEMO procedure fidelity: **700/700** records.
- AO migration integrity: **100/100** version/digest/attestation semantics; silent governed-field rebases: **0**.
- DEMO replay differences on second pass: **0**.
- MC primary percentage shortcuts: **0**.
- AP primary consumers of legacy `counts.done`: **0**; closure count includes only explicit `closed`.
- Mutation testing: **100% kill rate over 20 families**.
- Novelty holdout: **0 new normalized signatures in exact N+1000**.
- Parallel semantic owners introduced by hardening: **0**.
- Exact-head required status failures: **0**.

## Development and control checklist

- Start from authority matrix and existing owners; never create a parallel semantic owner for convenience.
- Prefer bounded projections over raw storage reads and keep writes persistence/readback/receipt aware.
- Keep AI proposed-only; never let its labels, confidence or summaries become human authority.
- Run RN validation at mission scope, AI normalization, contribution enrichment, manual observation and human source-decision boundaries.
- Do not trust `sourceClass` alone: require independent metadata/provenance; prefer type-backed evidence over ambiguous host-only evidence.
- Keep public jurisprudence/case mining bounded to public information without personal data; do not infer legal applicability from collection.
- Verify every AO governed-field mutation against version, digest, change history and attestation posture.
- Keep analytical compatibility fields out of primary decision semantics when they collapse distinct states into a percentage/score.
- Keep legacy AP `done` readable only as review-pending until explicit verification.
- Preserve terminal negative outcomes; presentation must not force remediation solely because a state is negative.
- Add hostile mutants for every new finding before accepting the fix.
- Run discovery, compress equivalent signatures, then exact N+1000 no-novelty.
- Keep server-backed browser journey coverage and RC/AR regression protection.
- Never weaken a failing checker to make a product change pass.
- Re-check all visible CI contexts on the exact final SHA after every hardening commit.

## Cleanup/minimization rule

A new layer is accepted only if removing it reintroduces a measured failure family and if its responsibility cannot be absorbed by an existing owner. Duplicate vocabulary, status semantics, demo context and presentation ownership are removal targets.

## Evidence boundary

Scenario counts are deterministic repository-bounded engineering pressure, not human usability sessions, legal opinions, independent assurance, certification or proof of absence of defects outside the declared model.
