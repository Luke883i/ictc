# ICTC 1.2 Hardening & Compression DoD

Baseline: `main@5c03518d1f4577630573155f83e552e6313a2e2c` after PR #53.

This plan is deliberately subtractive. It does not add a new business procedure or a new presentation model. It hardens the current seven-procedure product and compresses duplicate authority.

## Priority inventory

| ID | Priority | Problem | Local DoD | Replicable metric |
|---|---|---|---|---|
| H00 | P0 | PR/current CI and post-merge verification use different test authorities | `npm test`, PR semantic/runtime jobs and post-merge all consume `current-release-suite.mjs`; historical aggregate remains explicitly named | current-suite drift findings = 0; post-merge uses `test:current`; current semantic/runtime paths exist |
| H01 | P1 | Static shell still declares V4.1 and is rewritten into 1.2 at runtime | static HTML is natively 1.2; runtime shell only enriches/validates; obsolete CSS compatibility imports are removed when no longer required | legacy shell markers in canonical HTML = 0; canonical nav = home/processes/proof |
| H02 | P1 | SubjectVersion silently drops history after 5000 records | no silent deletion; retention posture is explicit and observable; projection pagination/limit never mutates history | silent truncation branches = 0; retention policy exposed; >5000 append test preserves oldest digest |
| H03 | P1 | Disabled procedures can continue to influence current global summary | summary is feature-policy-aware while evidence/history remain readable | summary rows == enabled procedures; disabled procedure attention contribution = 0 |
| H04 | P1 | Canonical procedure contract is transformed into compatibility form and reconstructed | canonical registry reads canonical structures unchanged; compatibility is a separate projection | canonical transitions/metrics retain object shape; compatibility mutation count = 0 |
| H05 | P1 | External EvidenceRef URL is universally labelled usable without observation | evidence resolution distinguishes declared, available/verified, version-bound and unresolved/missing; checkpoint decides admissibility | declared external evidence auto-usable = 0; strong evidence requires observation or digest/version policy |
| H06 | P1 | Enterprise read scope is role-centric and coarse | introduce bounded `ScopeRef`; actor-visible projection context carries organization/unit/jurisdiction/legalEntity dimensions without inventing SaaS tenancy | scope normalization deterministic; same scope applied to summary/records/export basis |
| H07 | P1 | Browser security headers are minimal | static/API responses declare safe browser policy; TLS/HSTS responsibility remains deployment-bounded | CSP, frame policy, referrer policy, permissions policy present on static responses |
| H08 | P1 | Attachment trust is not first-class | attachment metadata records quarantine/scan posture and download/evidence surfaces preserve trust state; no fake malware-clean claim | every attachment has trust state; unscanned != clean; scanner absence exposed as limitation |
| H09 | P2 | UI proof/anatomy contains process label/type hardcodes | derive process code/label/subject mapping from canonical registry metadata | hardcoded seven-process business label maps in proof/anatomy = 0 |
| H10 | P2 | Server handler/projection composition is manual | introduce a bounded procedure-adapter registry for policy/routing/presentation metadata; do not replace process-specific handlers with a generic engine | adding synthetic adapter requires <=1 registry/adaptor edit and 0 switch-list additions in audited surfaces |
| H11 | P2 | CI retains release-era workflow authority V1/V2/V3/V4 | classify legacy workflows as regression/manual-only after current coverage ratchet; current required families are semantic/runtime, browser, security/integrity, post-merge | auto-triggered release-era DoD workflows = 0; unique assertions retained or referenced |

## Global Definition of Done

1. Exact branch parent is the observed post-PR53 `main` SHA and `main` is never written directly.
2. Every H00-H11 has an executable or static falsifier in the repository.
3. `npm run test:current` is green on the final PR head.
4. Canonical browser journey and launcher smoke are green on the final PR head.
5. Security/integrity/durability checks remain green.
6. No business-process semantics are flattened: each procedure keeps its own states, transitions, checkpoints, evidence, exit and claim boundary.
7. No new claim of legal compliance, certification, external assessment or production deployment readiness is introduced.
8. Evidence posture distinguishes recorded provenance/integrity from substantive sufficiency.
9. The final diff reduces authority duplication: current test authority, procedure metadata authority and shell authority each have one canonical source.
10. PR description records baseline SHA, semantic commits, local DoD, global DoD, metrics and known external/deployment limitations.

## Implementation strategy

Work is cumulative and ordered by dependency: CI truth -> runtime history/policy -> evidence/scope/security -> native shell/UI -> adapter/CI compression -> global falsification. Each commit must be independently reviewable and must not depend on a future commit to explain its safety boundary.
