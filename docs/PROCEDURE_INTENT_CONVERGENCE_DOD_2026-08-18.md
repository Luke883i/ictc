# Procedure intent convergence DoD

This document turns the product request into an executable convergence plan. It is subordinate to the executable owners declared in `docs/authority-matrix.yaml`.

## Intent mined from the request

The target is not a literal restyling of five pages. ICTC must make each procedure legible from the nature of the object it governs, reduce cognitive load continuously, keep cross-procedure references useful without transferring authority, and keep DEMO data semantically faithful enough to act as a realistic falsifier.

The common product question is: **what am I governing, what human decision is needed now, what evidence will remain, and what does this state not prove?** The answer must be visible with minimal reading. Technical trace, history, raw AI output and hashes are secondary detail.

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

- RN-01: exactly four allowed source classes; two contributors remain explicit; scheduled AI produces candidate facts/sources only; zero out-of-nature synthetic monitoring topics.
- EC-01: one material question and one primary action at a time; original narrative immutable; legal/notification meaning remains outside operational classification.
- AO-01: severe-auditor read path needs no technical drilldown to establish identity, authority basis, accountable owner and last/next review; stale or rejected remains visible.
- MC-01: every displayed framework concept is atomically complete; no concept abstraction masquerades as normative wording; mapping/scope/effectiveness remain distinct.
- AP-01: origin and expected outcome are reconstructable; owner and next step are visible; completion evidence and closure verification are separate.
- RC-01: every rating presentation says it is a human judgment; no score implies objective probability or legal significance.
- AR-01: original request, answer disposition, evidence/limitation and approved response version remain separate; internal approval never reads as independent assurance.

## Final pre-merge hardening DoD

The PR is merge-ready only when these stronger ratchets also hold:

1. **Authority minimization:** zero new semantic/runtime owners in the hardening cycle; fixes must extend canonical owners already named by the authority matrix.
2. **RN closed universe:** every newly created or revised mission persists exactly the four RN-01 source classes. Subsets and extra classes fail closed.
3. **RN verification provenance:** a catalog candidate cannot become `verified` without a source class, an identified publishing authority and a reconstructable reference (source URL, identifier or preserved human contribution). The verification basis remains attached to the decided source.
4. **DEMO idempotence:** after one successful normalization pass, a second `applyDemoRealityContext()` produces deep-equal state. Target: 700/700 records stable on replay.
5. **AO governed-field integrity:** changing DEMO `sourceAuthority` increments the object version exactly once, records a synthetic migration edge in `changeHistory` and recomputes the canonical version digest. If the previous object was already due, that due state is preserved; otherwise the DEMO persona explicitly re-attests the new version. Target: 100/100 AO records version-safe, zero silent digest rebases and no artificial explosion of the re-attestation backlog.
6. **MC decision-first metrics:** the primary GRC dashboard and procedure card expose counts of mapping decisions/gaps/reviews, never `coveragePercent`. The analytical percentage may remain in the bounded coverage projection for compatibility, but it is not a primary posture/compliance shorthand.
7. **AP closure integrity:** primary projections consume `readyForReview` and `closed`; the legacy `done` alias may remain only for backward compatibility and must never count as verified closure or drive primary UI semantics.
8. **Mutation frontier:** the convergence model must kill 100% of the expanded failure families, including RN verification without provenance, silent DEMO governed-field rewrite, percentage shortcut, non-idempotent DEMO refinement and legacy-done-as-closed. After finite M, exact M+1000 must add zero genuinely new normalized family.
9. **Exact-head CI:** success is accepted only when the final PR SHA reports every required ICTC status successful, including runtime diagnostic and exact-head verdict.

## Challenging success metrics

- Procedure ontology separation: **7/7**, zero collapsed object/decision/evidence contracts.
- Primary decision contexts: **<= 1 primary action** each.
- RN write-path coverage: **3/3** paths (scheduled AI, human contribution + AI enrichment, manual observation) use the same closed-world filter; mission universe persistence **100%**.
- RN verified-source provenance: **100%** of newly verified candidates have class + authority + reconstructable reference.
- DEMO procedure fidelity: **700/700** records pass native ontology checks; **100/100 AO** records preserve version/digest/attestation semantics after authority rebase.
- DEMO replay stability: **0 state differences** after the second refinement pass.
- MC primary surfaces: **0 percentage shortcuts**; decision/gap/review counts only.
- AP primary surfaces: **0 consumers of legacy `counts.done`**; closure count includes only explicitly verified `closed` records.
- Mutation testing: **100% kill rate** over all declared families.
- Novelty holdout: **0 new normalized signatures in exact N+1000**.
- Parallel semantic owners introduced by hardening: **0**.
- Exact-head required status failures: **0**.

## Development checklist

- Start from authority matrix and existing owners; no parallel runtime owner.
- Reuse procedure guidance, procedure finetuning, surface primitives, control anchors, canonical demo seed and reality-context layers.
- Add a new contract only where it ratchets a responsibility that existing contracts do not close.
- Prefer presentation projections over raw-storage reads.
- Any demo refinement must use native normalizers or bounded presentation metadata and must preserve synthetic provenance.
- Add static checks before runtime change.
- Add hostile mutation families for ontology collapse, primary-action duplication, authority promotion, demo contamination, missing source authority, state conflation and silent cross-process decision transfer.
- Verify every mutation of an AO governed identity field against object version, digest, change history and re-attestation semantics; preserve a pre-existing due state, otherwise re-attest the new version explicitly.
- Verify RN at intake, AI normalization, persistence and human source-decision boundaries; do not trust a model-provided `sourceClass` as sufficient verification evidence.
- Keep analytical compatibility fields out of primary decision semantics when they compress distinct states into a score or percentage.
- Keep legacy AP `done` readable but project it as review-pending until explicit verification.
- Run convergence discovery, compress equivalent signatures, then N+1000 no-novelty.
- Keep browser server-backed journey coverage for all selected surfaces and regression coverage for RC/AR.
- Do not weaken a checker to make a product change pass.
- Re-check all visible CI contexts on the exact final SHA after every hardening commit.

## Cleanup/minimization rule

A new layer is accepted only if removing it reintroduces a measured failure family and if its responsibility cannot be absorbed by an existing owner. Duplicate vocabulary, duplicate status semantics, duplicate demo context and duplicate presentation ownership are removal targets.

## Evidence boundary

All scenario counts are deterministic engineering pressure, not human usability sessions, legal opinions, independent assurance or proof of absence of defects outside the declared model.
