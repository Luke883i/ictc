# Procedure intent convergence DoD

This document turns the product request into an executable convergence plan and is subordinate to the executable owners in `docs/authority-matrix.yaml`.

## Intent mined

Each procedure must be legible from the nature of the object it governs; common primitives must reduce cognitive load without collapsing epistemic distinctions; cross-procedure references must not transfer authority; DEMO must be semantically faithful enough to falsify the experience. The common question is: **what am I governing, what human decision is needed now, what evidence remains, and what does this state not prove?** Technical trace, history, raw AI output, confidence scores and hashes are secondary detail.

## Global DoD

1. Seven distinct procedure ontologies remain non-collapsible.
2. Visible controls are anchored to process, stage, intent, authority and evidence effect.
3. A decision context exposes at most one primary action.
4. Workflow state, evidence state and substantive meaning never share one status vocabulary.
5. Cross-procedure automation creates typed draft/review work only.
6. DEMO data conforms to the native object/lifecycle of the owning procedure.
7. RN-01 contains only binding EU law, binding Italian law, competent-authority decisions, or public jurisprudence/case information without personal data.
8. EC-01 defaults to one current question and keeps history/AI trace in drilldown.
9. AO-01 exposes identity, source authority, owner and review/attestation before edit affordances.
10. MC-01 concept atoms are minimally complete and mapping/scope/effectiveness remain distinct.
11. AP-01 completion never equals verified closure.
12. RC-01 and AR-01 preserve human-rating/internal-approval boundaries.
13. Mutation kill rate is 100% for all declared failure families.
14. Discovery reaches finite M and exact M+1000 yields zero novel normalized families.
15. Release evidence is accepted only on the exact PR HEAD with every applicable CI check successful.

## Local DoD

- **RN-01:** exact four-class closed universe; all three contributor paths apply the same classifier **before catalog persistence**; `sourceClass` is not self-authenticating; verification requires independent classification evidence, publishing authority and reconstructable reference. Public jurisprudence/case verification additionally requires explicit human confirmation that the candidate content retains no personal data. Verification is observation-bound: a changed observation or later decision invalidates the old verification basis. Candidate UI shows proposed class/provenance, not AI confidence as authority, and never calls an unverified link “official”.
- **EC-01:** one material question/primary action at a time; original narrative immutable; operational classification does not decide notification/legal meaning.
- **AO-01:** auditor read path exposes identity, authority, accountability and review; DEMO governed-field migrations are version-safe, digest-safe and attestation-safe.
- **MC-01:** concept atoms complete; primary surfaces use mapping/gap/review counts, not coverage percentages.
- **AP-01:** origin, owner, next step and closure criterion co-located; legacy `done` is review-pending only.
- **RC-01:** rating presentation remains explicit human judgment.
- **AR-01:** request, disposition, evidence/limits and approved version remain separate; internal approval is not independent assurance.

## Final pre-merge hardening DoD

1. **Authority minimization:** zero new semantic/runtime owners; hardening extends canonical owners.
2. **RN closed universe:** every new/revised mission persists exactly four classes; subsets/extras fail closed.
3. **RN three-path enforcement:** scheduled AI, human contribution + AI enrichment and manual observation all pass `normalizeRnDiscoveredItem` before `normalizeCatalogItem`; raw AI scheduler output can never write directly to the catalog. Scheduled runs record discovered/eligible/excluded counts.
4. **RN classification integrity:** proposed labels can resolve compatible independent evidence but never create it; type-backed evidence outranks host-only ambiguity; mislabeled vendor/internal material is rejected.
5. **RN verification provenance:** 100% of newly verified candidates have independently supported class + authority + reconstructable reference.
6. **RN jurisprudence privacy:** case/jurisprudence candidates cannot become verified until an authorized human confirms no personal data are retained; this confirmation is persisted with the decision basis.
7. **RN temporal validity:** any new observation that no longer matches the decided observation returns the item to candidate and clears `rnVerification`; every new decision starts from a clean verification basis.
8. **DEMO idempotence:** a second `applyDemoRealityContext()` is deep-equal; target 700/700 stable records.
9. **AO governed-field integrity:** source-authority migration increments version once, records history and canonical digest; pre-existing due state is preserved, otherwise the new version is explicitly re-attested.
10. **MC decision-first metrics:** primary dashboard/card expose decision/gap/review counts, never `coveragePercent`.
11. **AP closure integrity:** primary projections consume `readyForReview` and `closed`; legacy `done` never means closure.
12. **Mutation frontier:** all **23** failure families killed; finite M + exact M+1000 with zero new normalized family.
13. **Exact-head CI:** final SHA reports all required ICTC statuses successful, including runtime diagnostic and exact-head verdict.

## Challenging success metrics

- Ontology separation: **7/7**; collapsed contracts: **0**.
- Primary actions per decision context: **<=1**.
- RN write paths: **3/3** on one closed-world filter **before catalog persistence**; persisted source universe: **100% exact-four**.
- RN scheduled raw-to-catalog bypasses: **0**; every scheduled run exposes `eligible` and `excluded` counts.
- RN verified-source basis: **100% independent class evidence + authority + reference**.
- RN label-laundering survivors: **0**.
- RN verified jurisprudence/case records without explicit privacy review: **0**.
- RN candidate confidence-as-authority shortcuts: **0**.
- RN stale `rnVerification` after changed observation/rejection: **0**.
- DEMO fidelity: **700/700**; second-pass differences: **0**.
- AO migration integrity: **100/100**; silent governed-field rebases: **0**.
- MC primary percentage shortcuts: **0**.
- AP primary consumers of legacy `counts.done`: **0**.
- Mutation testing: **100% kill rate over 23 families**.
- Novelty holdout: **0 new normalized signatures in exact N+1000**.
- Parallel semantic owners introduced by hardening: **0**.
- Exact-head required status failures: **0**.

## Development and control checklist

- Start from authority matrix and existing owners; never create a parallel semantic owner for convenience.
- Prefer bounded projections over raw storage reads; keep writes persistence/readback/receipt aware.
- Keep AI proposed-only; labels, confidence and summaries never become human authority.
- Validate RN at mission scope, scheduled AI discovery, contribution enrichment, manual observation and human source-decision boundaries.
- Enforce the same RN classifier before catalog normalization on every contributor path; explicitly forbid `normalizeCatalogItem(raw)` in the scheduler.
- Never trust `sourceClass` alone; require independent metadata/provenance and prefer type-backed evidence over ambiguous host-only evidence.
- For jurisprudence/cases, require visible no-personal-data review before verification and persist it.
- Bind source verification to the exact observation; a new observation or later decision must clear stale verification state.
- Verify every AO governed-field mutation against version, digest, change history and attestation posture.
- Keep analytical compatibility fields out of primary decision semantics when they collapse distinct states into a score/percentage.
- Keep legacy AP `done` readable only as review-pending until explicit verification.
- Preserve terminal negative outcomes; presentation must not force remediation just because a state is negative.
- Add a hostile mutant for every new finding before accepting the fix.
- Run discovery, compress equivalent signatures, then exact N+1000 no-novelty.
- Keep server-backed browser journey coverage and RC/AR regression protection.
- Never weaken a failing checker to make a product change pass.
- Re-check all visible CI contexts on the exact final SHA after every hardening commit.

## Cleanup/minimization

A new layer is accepted only if removing it reintroduces a measured failure family and its responsibility cannot be absorbed by an existing owner. Duplicate vocabulary, status semantics, demo context and presentation ownership are removal targets.

## Evidence boundary

Scenario counts are deterministic repository-bounded engineering pressure, not human usability sessions, legal opinions, independent assurance, certification or proof of absence of defects outside the declared model.
