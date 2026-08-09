# ICTC 1.2 Market Candidate — Procedure Roadmap and DoD

## Target

Move ICTC from a technically bounded enterprise candidate to a **market-candidate compliance operations product** in which every business process has a simple entry point, a specific lifecycle, explicit human decisions, bounded evidence and a global deterministic roll-up.

The seven peer procedures remain RN-01, EC-01, AO-01, MC-01, AP-01, RC-01 and AR-01. EV-01 remains horizontal evidence/traceability infrastructure.

## Global DoD

A release is 100% done only if every mandatory gate is green; no average can compensate for a failed gate.

| Gate | Done when |
|---|---|
| G1 Process specificity | All seven procedures have executable process-specific contracts: entry, states, transitions, checkpoints, evidence, exit, metrics and claim boundary. |
| G2 Self-service RN | A normal user can preserve document/link/text material and create/manage only their own periodic monitor; source/impact decisions remain human-governed. |
| G3 Incident/near-miss | EC explicitly supports incident, near-miss and observation intake, versioned formulation, downstream links and reasoned closure. |
| G4 Governed inventory | AO has authoritative identity collision protection, versioning, owner, relations, re-attestation and retirement. |
| G5 Standards & Controls | MC exposes a typed standard library, human applicability/scope decision, requirement resolution, control-objective ontology, semantic and curated crosswalk, mapping/gap/N.A./unresolved and authorized pack import. |
| G6 Action fidelity | AP maintains proposed → adopted → execution → ready-for-review → verified closure, with distinct cancellation and origin links. |
| G7 Risk fidelity | RC separates inherent/residual rating, treatment and review cadence; mitigation closure creates reassessment work rather than auto-closing risk. |
| G8 Assurance completeness | AR approves only complete response-set dispositions tied to the current request/draft and resolvable evidence. |
| G9 Global roll-up | Home/process catalogue uses a deterministic procedure-summary projection; there is no synthetic compliance/maturity score. |
| G10 UX simplicity | Every procedure first screen answers: why am I here, what needs attention, what can I do now, what decision remains, what proof will remain. One primary action per context. |
| G11 Progressive disclosure | Business state first; record detail second; decisions/evidence third; raw trace/export last. Max five levels. |
| G12 Standards IP boundary | Public-law references may be indexed. Proprietary normative text is never bundled without authorization; licensed/user-supplied packs carry an explicit entitlement attestation and digest. |
| G13 Saturation | Semantic discovery reaches M; frozen M+1000 business-relevant holdouts add zero new finding classes; every mutant is killed. |
| G14 Runtime/browser | Exact-head syntax, unit, integration, persistence, security, browser desktop/mobile and process journeys are green. |

## As-is → to-be inventory

### RN-01 — Monitoraggio normativo e fonti
**As-is.** Material intake is strong and preserves link/text/file originals. Periodic monitoring already has draft/planning/active/paused/run semantics, but `manage-monitoring` is admin-only and users see organization missions. AI discovery is therefore operationally admin-centric.

**To-be.** Two equal entry points: **Aggiungi materiale** and **Crea monitoraggio**. Users manage only monitors they created; admin can manage all. A monitor is an owned recurring search plan with cadence, source hints, plan version and run history. AI can generate/execute the search plan, but source verification and impact remain separate human checkpoints. AI-off preserves material intake and manual observations, not automated discovery parity.

**Local DoD.** Owner scope, periodic cadence, retry/pause/resume, run failure visible, source observation versioning, source decision, impact decision, downstream review-needed.

### EC-01 — Incidenti e quasi incidenti
**As-is.** Strong preservation of original narrative/attachments, questions, versioned formulation, explicit submit digest and closure. Missing a first-class near-miss operational concept and bounded closure disposition.

**To-be.** Entry explicitly asks `incident | near-miss | observation`, occurred/detected/awareness timestamps and optional operational severity. Lifecycle stays case-specific: original → clarification → formulation → confirm/submit → closure/follow-up. Closing with open linked remediation requires explicit acknowledgement. This never decides regulatory notification significance.

**Local DoD.** Event-kind required and typed, near-miss count, formulation version-bound, closure disposition, downstream acknowledgement, follow-up lineage.

### AO-01 — Inventario di sistemi e oggetti
**As-is.** Candidate/active/rejected/retired, typed relations, owner PrincipalRef and re-attestation exist. Authoritative source identity is still not collision-safe.

**To-be.** `(sourceAuthority, externalReference)` is a uniqueness key when both exist. Active material updates invalidate attestation and trigger review-needed to dependencies. First screen emphasises inventory health and objects due for re-attestation.

**Local DoD.** Identity collision test, re-attestation, retirement, version digest, owner resolution and dependency feedback.

### MC-01 — Standard e Controlli
**As-is.** A bounded mapping ledger over manually declared requirement labels/refs. It can say mapped/gap/N.A./unresolved but does not yet own a standard library or integrated compliance ontology.

**To-be.** MC is the benchmark process. It owns:
- `FrameworkDefinition`: issuer, version, jurisdiction/sector, authoritative source, content policy;
- `RequirementNode`: stable reference node, never confused with normative text ownership;
- `ControlObjective`: ICTC-neutral control semantics used for integrated views;
- `StandardScopeDecision`: in-scope/reference/out-of-scope with human reason;
- `ImplementationControl`: a governed AO control/control-implementation object;
- `CoverageMapping`: standard requirement → implementation target + evidence + human decision;
- `CrosswalkEdge`: exact/partial/supportive/related, always reasoned; automatic edges are only thematic `shared-control-objective` relationships.

Built-in market profile includes GDPR, NIS2, DORA, D.Lgs. 231/2001 metadata, ISO/IEC 27001, ISO 37301, ISO 31000, ISO 22301, ISO/IEC 27701, COSO Internal Control, COSO ERM and NIST CSF 2.0. Additional dominant frameworks are represented as metadata/import profiles where redistribution rights are not appropriate for the OSS repository.

**Local DoD.** Standard selection, scope decision, requirement resolution, standard version, imported-pack license attestation, cross-framework objective matrix, explicit mapping decisions and no automatic compliance/equivalence claim.

### AP-01 — Azioni correttive
**As-is.** Strongest lifecycle: adoption, owner/priority, progress, ready-for-review, evidence-bound verified closure and distinct cancellation.

**To-be.** Keep semantics; simplify first screen to my/open work, overdue, ready-for-review and origin. Verified closure emits `review-needed` back to risk/mapping/source origin.

**Local DoD.** No direct `done → closed`, resolved EvidenceRef on close, cancellation decision, owner PrincipalRef, origin feedback.

### RC-01 — Rischi di compliance
**As-is.** Human inherent/residual ratings, treatment and action linkage exist; heatmap is human-only. Review cadence is stored but should be a visible local work signal.

**To-be.** First screen separates high/critical, unreviewed and review-due. Standard/control bindings resolve to AO/MC objects. Closed mitigation actions trigger residual reassessment work, never automatic risk closure.

**Local DoD.** Inherent before residual, treatment after rating, typed owner, control/object refs, review-due and remediation feedback.

### AR-01 — Questionari e verifiche
**As-is.** Request preservation, manual/AI draft and complete-answer approval invariant are strong after hardening.

**To-be.** Make completeness visible: every question must have a disposition (`answered`, `not-applicable`, `unknown`, `deferred`, `excluded-with-reason`). Evidence gaps are explicit, and approved versions can be superseded/followed-up without destructive overwrite.

**Local DoD.** Complete current response set, valid question IDs, evidence refs, versioned approval and stale-evidence review-needed.

## Global roll-up

The global area is not a maturity score. It is a deterministic **Procedure Summary** containing local process metrics and an attention count. A user can drill from one global row to its native process workspace. No average of GDPR/NIS2/risk/action states is permitted.

## Standards content policy

ICTC open source ships metadata, public-law reference indexes and neutral control objectives. It does not redistribute proprietary normative content. A customer with appropriate rights may import a versioned pack; the runtime stores entitlement attestation, source authority, version and digest. Crosswalks are operational knowledge, not legal opinions.

## Local / CI evidence boundary

Pure 1.2 procedure modules are executed locally before publication. The private repository cannot be cloned from the isolated execution environment because `github.com` DNS is unavailable there, so full repository integration and browser execution are falsified on the exact PR head by GitHub Actions. A green PR requires both layers; local pure-module evidence alone is insufficient.

## Release slices

1. **Contract first** — procedure contracts + DoD + standard catalog schema.
2. **MC runtime** — standard library, scope decisions, authorized pack import, requirement resolver, crosswalks.
3. **RN self-service** — owner-scoped periodic monitors + UI entry.
4. **EC event taxonomy** — near-miss + closure disposition/downstream acknowledgement.
5. **AO identity** — authoritative uniqueness and re-attestation feedback.
6. **Local process fidelity** — AP/RC/AR ratchets and process metrics.
7. **Global summary** — procedure-summary projection and Home/Process cards.
8. **Process UX** — one primary entry per process, standard-specific workspace for MC, no implementation leakage.
9. **Saturation/CI** — 1→M, frozen M+1000, mutation and browser E2E.
