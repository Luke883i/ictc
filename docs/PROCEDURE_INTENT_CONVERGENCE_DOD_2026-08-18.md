# Procedure intent convergence DoD

This document turns the product request into an executable convergence plan. It is subordinate to the executable owners declared in `docs/authority-matrix.yaml`.

## Intent mined from the request

ICTC must make each procedure legible from the nature of the object it governs, reduce cognitive load continuously, keep cross-procedure references useful without transferring authority, and keep DEMO data semantically faithful enough to act as a realistic falsifier. The common product question is: **what am I governing, what human decision is needed now, what evidence will remain, and what does this state not prove?** Technical trace, history, raw AI output, confidence scores and hashes are secondary detail.

## Global DoD

1. Seven distinct procedure ontologies remain non-collapsible.
2. Every visible control in selected runtime surfaces is anchored to process, stage, intent, authority and evidence effect.
3. A decision context exposes at most one primary action.
4. Workflow state, evidence state and substantive meaning never share one status vocabulary.
5. Cross-procedure automation creates typed draft/review work only.
6. DEMO data conforms to the native object and lifecycle of the owning procedure.
7. RN-01 contains only binding EU law, binding Italian law, competent-authority decisions, or public jurisprudence/case information without personal data.
8. EC-01 defaults to one current question and keeps history/AI trace in drilldown.
9. AO-01 exposes identity, source authority, owner and review/attestation state before edit affordances.
10. MC-01 concept atoms are minimally complete and mapping/scope/effectiveness remain distinct.
11. AP-01 completion never equals verified closure.
12. RC-01 and AR-01 preserve human-rating/internal-approval boundaries.
13. Mutation kill rate is 100% for all declared failure families.
14. Discovery reaches finite M and exact M+1000 produces zero novel normalized families.
15. Release evidence is accepted only on the exact PR HEAD with every applicable CI check successful.

## Local DoD

- **RN-01:** exact four-class closed universe; three contributor paths share one filter; a proposed class is not self-authenticating; verification needs independent classification evidence, publishing authority and reconstructable reference. For public jurisprudence/cases, verification additionally requires explicit human confirmation that the candidate content does not retain personal data. Candidate UI must show proposed class/provenance, not confidence as authority, and must not call an unverified link “official”.
- **EC-01:** one material question/primary action at a time; original narrative immutable; operational classification does not decide notification/legal meaning.
- **AO-01:** auditor read path exposes identity, authority, accountability and review; governed-field DEMO migrations are version-safe and attestation-safe.
- **MC-01:** concept atoms complete; primary decision surfaces use mapping/gap/review counts, not coverage percentages.
- **AP-01:** origin, owner, next step and closure criterion co-located; legacy `done` is review-pending only.
- **RC-01:** every rating presentation remains explicit human judgment.
- **AR-01:** request, disposition, evidence/limits and approved version remain separate; internal approval is not independent assurance.

## Final pre-merge hardening DoD

1. **Authority minimization:** zero new semantic/runtime owners; hardening extends canonical owners.
2. **RN closed universe:** every new/revised mission persists exactly four classes; subsets/extras fail closed.
3. **RN classification integrity:** `sourceClass` may resolve compatible independent evidence but never create it; type-backed evidence outranks host-only ambiguity; mislabeled vendor/internal material is rejected.
4. **RN verification provenance:** 100% of newly verified candidates have independently supported class + authority + reconstructable reference.
5. **RN jurisprudence privacy:** public case/jurisprudence candidates cannot become verified until an authorized human explicitly confirms no personal data are retained in the candidate content; this confirmation is persisted with the source decision.
6. **DEMO idempotence:** second `applyDemoRealityContext()` is deep-equal; target 700/700 stable records.
7. **AO governed-field integrity:** source-authority migration increments version once, records history, recomputes digest; pre-existing due state is preserved, otherwise new version is explicitly re-attested.
8. **MC decision-first metrics:** primary dashboard/card expose decision/gap/review counts, never `coveragePercent`.
9. **AP closure integrity:** primary projections consume `readyForReview` and `closed`; legacy `done` never means closure.
10. **Mutation frontier:** all **21** failure families killed; finite M + exact M+1000 with zero new normalized family.
11. **Exact-head CI:** final SHA reports all required ICTC statuses successful, including runtime diagnostic and exact-head verdict.

## Challenging success metrics

- Ontology separation: **7/7**; collapsed contracts: **0**.
- Primary actions per decision context: **<=1**.
- RN write paths: **3/3** on the same closed-world filter.
- RN mission universe persistence: **100% exact-four**.
- RN verified-source basis: **100% independent class evidence + authority + reference**.
- RN label-laundering survivors: **0**.
- RN verified jurisprudence/case records without explicit privacy review: **0**.
- RN candidate decision surface confidence-as-authority shortcuts: **0**.
- DEMO fidelity: **700/700**; second-pass differences: **0**.
- AO migration integrity: **100/100**, silent governed-field rebases: **0**.
- MC primary percentage shortcuts: **0**.
- AP primary consumers of legacy `counts.done`: **0**.
- Mutation testing: **100% kill rate over 21 families**.
- Novelty holdout: **0 new normalized signatures in exact N+1000**.
- Parallel semantic owners introduced by hardening: **0**.
- Exact-head required status failures: **0**.

## Development and control checklist

- Start from authority matrix and existing owners; never create a parallel semantic owner for convenience.
- Prefer bounded projections over raw storage reads and keep writes persistence/readback/receipt aware.
- Keep AI proposed-only; labels, confidence and summaries never become human authority.
- Run RN validation at mission scope, AI normalization, contribution enrichment, manual observation and human source-decision boundaries.
- Do not trust `sourceClass` alone; require independent metadata/provenance and prefer type-backed evidence over ambiguous host-only evidence.
- For jurisprudence/cases, require a visible human no-personal-data review before verification and persist it in the decision basis.
- Verify every AO governed-field mutation against version, digest, change history and attestation posture.
- Keep analytical compatibility fields out of primary decision semantics when they collapse distinct states into a score/percentage.
- Keep legacy AP `done` readable only as review-pending until explicit verification.
- Preserve terminal negative outcomes; presentation must not force remediation just because a state is negative.
- Add a hostile mutant for every new finding before accepting the fix.
- Run discovery, compress equivalent signatures, then exact N+1000 no-novelty.
- Keep server-backed browser journey coverage and RC/AR regression protection.
- Never weaken a failing checker to make a product change pass.
- Re-check all visible CI contexts on the exact final SHA after every hardening commit.

## Cleanup/minimization rule

A new layer is accepted only if removing it reintroduces a measured failure family and its responsibility cannot be absorbed by an existing owner. Duplicate vocabulary, status semantics, demo context and presentation ownership are removal targets.

## Evidence boundary

Scenario counts are deterministic repository-bounded engineering pressure, not human usability sessions, legal opinions, independent assurance, certification or proof of absence of defects outside the declared model.
