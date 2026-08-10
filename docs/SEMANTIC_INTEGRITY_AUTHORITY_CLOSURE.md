# ICTC Semantic Integrity & Authority Closure

Baseline: `main@a8ecc83da8ae1282f668fbf8c4b8c6d2b20ad75b` (post PR55).

This PR is a bounded successor to Semantic Closure. It does not add a business procedure, generic workflow engine, graph database, event-sourcing rewrite or global AI architecture. It closes places where the repository currently proves less than the semantic claim suggests.

## Principles

- Reuse the existing SQLite audit/current-state substrate.
- One business write remains one atomic transaction.
- Append semantic history is authoritative from cutover forward, but pre-cutover full-state reconstruction remains explicitly unsupported.
- Human initiator, runtime executor and AI/service producer are distinct authorities.
- Persisted ReviewNeed records are the authority for materialized dependency review work; projections may derive candidates but must not create a second current authority.
- `validAsOf` is an evaluation clock. `transactionAsOf` is only a historical-selection clock when a historical state/version source is actually selected.
- Test names and metrics must describe what they really prove.

## Slice matrix

| Slice | Open failure mode | Minimal invariant | Required falsifier |
|---|---|---|---|
| I01 semantic-integrity-root | semantic append rows can be changed out-of-band without breaking current-state audit verification | every post-cutover audit event binds a deterministic semantic manifest; payload and step digests are revalidated on read | tamper payload / occurrence / step and require verification failure |
| I02 write-authority-census | production files can disappear from census because their name contains `test`; route uniqueness is only checked for AP progress | production source classification is path/suffix based and every statically discoverable mutating route has exactly one current owner | `control-test-handler` must be counted; injected duplicate route owner must fail census self-test |
| I03 epistemic-causality | AI action naming can turn the AI provider into the human command initiator; epistemic families are regex-only | initiator derives from actor, producer derives from effect producer; explicit effect metadata wins over legacy inference | human-triggered AI proposal keeps principal initiator and AI producer |
| I04 review-authority | dependency review is both persisted and independently re-derived into current inbox; time crossing can be attributed to unrelated writes | persisted ReviewNeed is the materialized dependency-review source; clock-derived needs have scheduler/clock causation, business invalidation has business causation | retry is idempotent; inbox reads persisted item; unrelated mutation does not claim business cause for a clock-only need |
| I05 temporal-scale-truth | transactionAsOf looks historical while projections read current state; semantic history leaves disk snapshot but all versions are rehydrated into every mutation working set | historical transaction selection fails closed unless supported; in-memory semantic history cache is bounded while SQLite append history remains complete | historical transaction request without selector is rejected; >cache-limit append rows survive while working cache remains bounded |
| I06 falsification-truth | fixed RULES M+1000 and `scenarios.some(rule)` are labelled novelty saturation/mutation testing | scenario activation, taxonomy stability and real implementation mutants are separate metrics; extension contract is tested with a synthetic PROC-08 fixture | kill real mutants; compile synthetic procedure through generic registries without editing kernel membership code |

## Global DoD

1. No partial commit across current snapshot, audit, subject payload/version and epistemic step.
2. Post-cutover semantic append tamper detection is fail-closed.
3. Current-state writes never require unbounded semantic history in the mutable snapshot/working copy.
4. Every business write discovered in production source is classified.
5. Every statically discoverable mutating route has one current semantic owner or an explicit bounded compatibility suppression.
6. AI OFF critical journeys remain unchanged.
7. No synthetic compliance/maturity score is introduced.
8. Catalogue provenance, organizational use, requirement applicability, coverage and effectiveness remain distinct.
9. Existing seven procedures keep their own lifecycle semantics.
10. Exact-head current semantic/runtime/browser/launcher gates must be green before ready-for-review.

## Explicit non-goals

- Full pre-cutover historical state reconstruction.
- Graph database.
- Generic process interpreter.
- Autonomous remediation.
- Global GraphSlice AI.
- Branch-protection mutation: repository-owner governance remains external to runtime code.
- Claiming CodeQL execution when GHAS is disabled; the workflow must report the bounded posture truthfully.
