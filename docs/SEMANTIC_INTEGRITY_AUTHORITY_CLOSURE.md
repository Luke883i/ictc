# ICTC Semantic Integrity & Authority Closure

Baseline: `main@a8ecc83da8ae1282f668fbf8c4b8c6d2b20ad75b` (post PR55).

This PR is a bounded successor to Semantic Closure. It deliberately preserves the seven procedure-specific lifecycles and reuses the current SQLite/audit/current-state substrate. It does not introduce event sourcing, a generic workflow engine, a graph database or global AI architecture.

## Principles

- One business write remains one atomic transaction.
- Append semantic history is authoritative from cutover forward; pre-cutover full-state reconstruction remains explicitly unsupported.
- Human initiator, runtime executor and AI/service producer are distinct authorities.
- Persisted ReviewNeed records own materialized dependency-review work; candidate derivation is not a second current authority.
- `validAsOf` is an evaluation clock. `transactionAsOf` is provenance on current-state projections; historical transaction selection fails closed until a real historical selector exists.
- Canonical append history may be larger than the in-memory working cache.
- One transaction may materialize multiple AFTER-state subject occurrences, but secondary semantic subjects are declared by trusted server-side command code, not by client metadata.
- Trace, evidence export and proof must consume the same current Decision/Epistemic authorities rather than legacy projections.
- Test names and metrics must describe what they actually prove.

## Slice matrix

| Slice | Failure mode | Closed invariant | Falsifier |
|---|---|---|---|
| I01 semantic-integrity-root | semantic append rows could be changed out-of-band without breaking current-state audit verification | every post-cutover business audit event binds a deterministic semantic manifest and the exact EpistemicStep digest/schema | direct SQLite tamper of payload, occurrence, step, and a step tampered **and rehashed** all fail closed |
| I02 write-authority-census | production files could disappear from census because their name contains `test`; route uniqueness was AP-only | production classification is path/suffix based; statically discoverable current mutating routes are checked for duplicate owners | `control-test-handler` is counted; synthetic duplicate route is rejected |
| I03 epistemic-causality | AI action naming could turn AI into the human command initiator | initiator derives from actor; executor is ICTC runtime; producer is per effect; declared effects override legacy naming fallback | human-triggered AI proposal retains human initiator and AI producer |
| I04 review-authority | dependency review was both persisted and independently re-derived; time crossing could be attributed to unrelated writes; persisted needs could not be safely closed | persisted ReviewNeed owns materialized dependency-review; clock and business causes materialize separately; resolution requires an existing later human decision on the same subject | clock-only due is absent from business reconciliation, created by clock sweep, retry-idempotent, read from persisted ledger; stale/wrong-subject decisions cannot resolve it |
| I05 temporal-scale-truth | transactionAsOf looked historical while projections read current state; all versions were rehydrated for each mutation | historical transaction selection is unsupported/fail-closed in 1.2; working history is bounded while SQLite history remains complete/queryable, including digest bindings | both `requireHistoricalState` and a caller-supplied `historicalStateSelected:true` reject; records outside cache remain resolvable |
| I06 falsification-truth | fixed RULES M+1000 and rule activation were described as novelty saturation/mutation testing | 10k model is named fixed-taxonomy activation coverage; fault mutation is a separate invariant test; PROC-08 compiles as an extension fixture | corrupt step, duplicate route, false historical selection, duplicate ReviewNeed and extension collision are rejected |
| I07 claim-evidence-parity | runtime schemas, semantic contract, DoD and security posture could drift while gates stayed nominally green | declared schema/authority values match live runtime; CodeQL conditional posture is explicit rather than represented as executed | contract check exercises current review/insight/version/context schemas; static-analysis posture artifact says conditional/not-executed when GHAS is off |
| I08 read-authority-cutover | Procedure Trace and Evidence Graph still consumed legacy Decision/Epistemic projections | trace and evidence graph consume Decision 2.4 + Epistemic 2.1, use one ProjectionContext per projection, and may resolve evicted SubjectVersions through append persistence | trace/export tests assert current authority basis and resolve an old digest binding outside the working cache |
| I09 multi-subject-write | semantic write kernel materialized a primary subject plus a bespoke `requirementScope` result-shape special-case | Store supports bounded, trusted server-side secondary semantic subject refs; every resolved subject gets its own AFTER-state occurrence in the same audit manifest; no result-shape coupling | a synthetic transaction returns `{ok:true}` while mutating mapping + requirement scope and still produces two canonical occurrences in one revision/manifest |

## Global DoD

1. No partial commit across current snapshot, audit, subject payload/version and epistemic step.
2. Post-cutover semantic append tamper detection is fail-closed, including a recomputed self-hash on a modified EpistemicStep.
3. Current-state writes never require unbounded semantic history in the mutable working copy.
4. Every discovered production `Store.mutate` action is classified; static HTTP route ownership has an explicit claim boundary.
5. AI OFF critical journeys remain unchanged; AI never becomes human authority.
6. Persisted dependency review has one current materialized authority and requires a fresh human decision for resolution.
7. Historical transaction selection is never implied or manufactured by a boolean flag on a current-state projection.
8. Multi-subject business mutations can materialize each declared AFTER-state subject without domain-specific logic in the semantic kernel.
9. Procedure Trace and Evidence Graph no longer consume legacy Decision/Epistemic read authorities.
10. No synthetic compliance/maturity score is introduced.
11. Catalogue provenance, organizational use, requirement applicability, coverage and effectiveness remain distinct.
12. Existing seven procedures keep process-specific lifecycle semantics.
13. A synthetic eighth compliance procedure compiles through extension contracts without mutating the shipped registry.
14. Scenario activation, fault injection and E4 evidence remain separate evidence classes.
15. Exact-head semantic/runtime/browser/launcher/security-posture gates must be green before technical merge readiness.

## Evidence language

The 10,000-scenario model remains useful as **fixed-taxonomy scenario activation coverage**. Its M+1000 window demonstrates stability only inside the predeclared taxonomy; it is not proof that an unknown C19 cannot exist. The former `18/18 mutation` label is not used as mutation-testing evidence. Real fault falsifiers in this PR alter persistence, lineage, route ownership, temporal claims, review decisions or extension assumptions and require the implementation/tests to reject the mutation.

## Extension contract

A future compliance procedure is expected to provide domain-specific contract/adapter/lifecycle/workspace code. Reuse means it must not require a new hard-coded membership authority in ProjectionContext, history persistence, semantic manifests, generic trace/proof, policy or metric-kernel membership. The compile-only PROC-08 / TP-01 fixture exercises this boundary without shipping an eighth business process.

## Explicit non-goals / residual boundaries

- Full pre-cutover historical state reconstruction.
- Historical transaction-time state selection in release 1.2; requests fail closed rather than pretending a current snapshot is historical.
- Graph database or universal assertion graph in this PR.
- `epistemic_step` is an append lineage substrate; `canonicalEpistemicProjection` remains a governed projection, not a claim that the append table is already a universal knowledge-graph read authority.
- Generic process interpreter.
- Autonomous remediation or global GraphSlice AI.
- Branch-protection mutation: repository-owner governance remains external to runtime code.
- Claiming CodeQL execution when GitHub Advanced Security is disabled. The repository reports that posture explicitly instead.
- Legal compliance, certification, penetration testing, independent security assessment, deployment assurance or E4 human-comprehension evidence.

## Merge-readiness rule

A green exact-head is necessary but not sufficient. The PR can be called technically merge-ready only when: (a) the exact head is mergeable; (b) no configured workflow is failed, queued or in progress; (c) the browser journey is green; (d) semantic/runtime suites include the new falsifiers; (e) CodeQL is described as `skipped/conditional` when GHAS is off rather than as a completed security scan. Administrative Draft → Ready and branch protection remain repository-governance operations, not runtime semantics.
