# ICTC Semantic Integrity & Authority Closure

Baseline: `main@a8ecc83da8ae1282f668fbf8c4b8c6d2b20ad75b` (post PR55).

This PR is a bounded successor to Semantic Closure. It deliberately preserves the seven procedure-specific lifecycles and reuses the current SQLite/audit/current-state substrate. It does not introduce event sourcing, a generic workflow engine, a graph database or global AI architecture.

## Principles

- One business write remains one atomic transaction.
- Append semantic history is authoritative from cutover forward; pre-cutover full-state reconstruction remains explicitly unsupported.
- Human initiator, runtime executor and AI/service producer are distinct authorities.
- Persisted ReviewNeed records own materialized dependency-review work; candidate derivation is not a second current authority.
- `validAsOf` is an evaluation clock. `transactionAsOf` is only historical selection when an actual historical state is selected.
- Canonical append history may be larger than the in-memory working cache.
- Test names and metrics must describe what they actually prove.

## Slice matrix

| Slice | Failure mode | Closed invariant | Falsifier |
|---|---|---|---|
| I01 semantic-integrity-root | semantic append rows could be changed out-of-band without breaking current-state audit verification | every post-cutover business audit event binds a deterministic semantic manifest; payload and step digests are checked | direct SQLite tamper of payload, occurrence and step fails closed |
| I02 write-authority-census | production files could disappear from census because their name contains `test`; route uniqueness was AP-only | production classification is path/suffix based; statically discoverable current mutating routes are checked for duplicate owners | `control-test-handler` is counted; synthetic duplicate route is rejected |
| I03 epistemic-causality | AI action naming could turn AI into the human command initiator | initiator derives from actor; producer is per effect; declared effects override legacy naming fallback | human-triggered AI proposal retains human initiator and AI producer |
| I04 review-authority | dependency review was both persisted and independently re-derived; time crossing could be attributed to unrelated writes | persisted ReviewNeed owns materialized dependency-review; clock and business causes materialize separately | clock-only due is absent from business reconciliation, created by clock sweep, retry-idempotent and read from persisted ledger |
| I05 temporal-scale-truth | transactionAsOf looked historical while projections read current state; all versions were rehydrated for each mutation | unsupported historical transaction selection fails closed; working history is bounded while SQLite history remains complete/queryable | historical selector absence rejects; records outside cache remain resolvable |
| I06 falsification-truth | fixed RULES M+1000 and rule activation were described as novelty saturation/mutation testing | 10k model is named fixed-taxonomy activation coverage; fault mutation is a separate invariant test; PROC-08 compiles as an extension fixture | corrupt step, duplicate route, false historical selection, duplicate ReviewNeed and extension collision are rejected |
| I07 claim-evidence-parity | runtime schemas, semantic contract, DoD and security posture could drift while gates stayed nominally green | declared schema/authority values match live runtime; CodeQL conditional posture is explicit rather than represented as executed | contract check exercises current review/insight/version/context schemas; static-analysis posture artifact says conditional/not-executed when GHAS is off |

## Global DoD

1. No partial commit across current snapshot, audit, subject payload/version and epistemic step.
2. Post-cutover semantic append tamper detection is fail-closed.
3. Current-state writes never require unbounded semantic history in the mutable working copy.
4. Every discovered production `Store.mutate` action is classified; static HTTP route ownership has an explicit claim boundary.
5. AI OFF critical journeys remain unchanged; AI never becomes human authority.
6. Persisted dependency review has one current materialized authority.
7. Historical transaction selection is never implied by a current-state projection.
8. No synthetic compliance/maturity score is introduced.
9. Catalogue provenance, organizational use, requirement applicability, coverage and effectiveness remain distinct.
10. Existing seven procedures keep process-specific lifecycle semantics.
11. A synthetic eighth compliance procedure compiles through extension contracts without mutating the shipped registry.
12. Scenario activation, fault injection and E4 evidence remain separate evidence classes.
13. Exact-head semantic/runtime/browser/launcher gates must be green before ready-for-review.

## Explicit non-goals / external boundaries

- Full pre-cutover historical state reconstruction.
- Graph database or universal assertion graph in this PR.
- Generic process interpreter.
- Autonomous remediation or global GraphSlice AI.
- Branch-protection mutation: repository-owner governance remains external to runtime code.
- Claiming CodeQL execution when GitHub Advanced Security is disabled. The repository reports that posture explicitly instead.
- Legal compliance, certification, penetration testing, independent security assessment, deployment assurance or E4 human-comprehension evidence.
