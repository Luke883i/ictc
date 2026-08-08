# ICTC Control Tower V2 Experimental — Definition of Done

## Product outcome
V2 extends the V1 compliance kernel into a unified GRC operating layer. The user enters through **Oggi**, selects work through **Processi**, inspects bounded proof through **Prove**, and sees **Amministrazione** only when authorized. AO-01, MC-01, AP-01, RC-01 and AR-01 share one GRC workspace and never become permanent top-level tabs.

## Global DoD
- [x] V1 authority topology is preserved: runtime semantics, human organizational decisions, external masters/sources, external assessor conclusions.
- [x] One ontology authority, relation grammar, process registry, decision projection, epistemic projection, evidence graph and active UI composition.
- [x] RN-01, EC-01, EV-01, FI-01, IA-01, GA-01 remain supported; AO-01, MC-01, AP-01, RC-01 and AR-01 are added without parallel semantic stacks.
- [x] Every GRC write uses the existing Store mutation/receipt chain and is readable after refresh.
- [x] AI is proposal-only for mapping, action priority, risk rating and assurance draft; human checkpoints adopt/correct operational meaning.
- [x] Risk heatmap and consolidated high-risk KPI use only human-reviewed ratings.
- [x] Coverage is bounded to a declared perimeter; mapped, gap, not-applicable, rejected and unresolved remain distinct.
- [x] Persistent to-dos derive from durable state, not UI-only counters.
- [x] Current-view export and evidence dossier remain same-as-read; GRC records use the canonical evidence graph.
- [x] Professional entrypoint: three permanent shell items, five consolidated GRC KPIs, one next-work CTA, process-level progressive disclosure.
- [x] Primary terminology is business-facing; authority/projection/digest vocabulary is kept in proof/detail surfaces.
- [x] Static/domain saturation covers 10,100 scenarios; browser journey traverses every active service and three roles.
- [ ] Exact-head GitHub CI fully green on the V2 PR candidate.
- [ ] PR remains unmerged until human authorization.

## Slice DoD
### V2-S1 — GRC semantic foundation
- [x] `registry-extension` is the only new archetype and is justified by AO-01.
- [x] Object taxonomy includes technology, information/privacy, organization and security/compliance objects.
- [x] AO/MC/AP/RC/AR and FI-01 are explicit ProcessDefinitions.
- [x] GRC relations are declared once in the runtime relation grammar.
- [x] Synthetic process compilation remains `expectedCoreEdits=0`.

### V2-S2 — AO-01 Inventario oggetti rilevanti
- [x] Generic object supports type, name, owner/responsible party, criticality, source authority, external reference, attributes and typed relations.
- [x] Candidate intake and human review are distinct.
- [x] Version digest changes on relationship mutation; originals/history are not overwritten silently.
- [x] Inventory explicitly does not claim real-world completeness.

### V2-S3 — MC-01 Mapping e copertura
- [x] Declared-perimeter items preserve reference, label, targets, evidence, proposal source and rationale.
- [x] AI mapping cannot produce an accepted mapping by itself.
- [x] Human decisions can produce mapped, gap, not-applicable or rejected.
- [x] N.A. is excluded from the applicable denominator; unresolved never counts as covered.

### V2-S4 — AP-01 Action Plan
- [x] Remediation is a persistent object with origin, owner, due date, state and update history.
- [x] AI priority is only proposed; human adoption binds the operational priority.
- [x] A proposed action cannot progress before adoption.
- [x] User visibility/progression is role-scoped.

### V2-S5 — RC-01 Rischi di compliance
- [x] Scenario supports linked objects, controls and actions.
- [x] AI can propose likelihood/impact/confidence/rationale without changing consolidated risk.
- [x] Human review records likelihood and impact 1..5 with reason.
- [x] 5×5 heatmap is derived only from the latest human review.
- [x] Rating is explicitly managerial support, not legal truth or objective probability.

### V2-S6 — AR-01 Assurance e autovalutazione
- [x] Original request is preserved with digest.
- [x] AI decomposes/drafts with evidence references and limitations.
- [x] Draft answers stay distinct from approved answers.
- [x] Human approval binds request/proposal/answer digests.
- [x] Approval does not claim external certification or independent assessment.

### V2-S7 — Product/UX convergence
- [x] One `grcView`, one router, one active experience composition.
- [x] Process cards derive from server ProcessDefinitions; GRC process selection persists across refresh.
- [x] Oggi shows five consolidated KPIs and a next-work CTA.
- [x] Each GRC process exposes one primary creation disclosure; details/evidence/AI explanations are secondary disclosure.
- [x] Receipts surface immediately after writes; every record exposes a dossier action when authorized.
- [x] Admin/user/auditor controls do not leak mutation authority.
- [x] Canonical V2 browser journey is a superset regression path covering RN, EC, AO, MC, AP, RC, AR and Proof.

## Weld DoD
- [x] Server mounts exactly one GRC runtime handler.
- [x] GRC reviews feed the existing human DecisionRecord projection.
- [x] GRC state feeds the existing epistemic projection; `not-assessed` remains distinct.
- [x] Evidence uses a Store proxy adapter into the existing canonical evidence graph, not a second evidence store.
- [x] Export uses role-scoped GRC projections and the same read authorization boundary.
- [x] Semantic API ratchet is V2 and browser code consumes server projections rather than redefining process/risk authority.
- [x] No process-specific permanent route family or top-level tab was introduced.

## UX / terminology / visual-load audit
Primary navigation is deliberately limited to Oggi / Processi / Prove. Process-specific work moves inside a shared workspace. Always-visible copy uses Inventario, Copertura, Action plan, Rischi, Assurance, Responsabile, Probabilità and Impatto. Claim boundaries are disclosed under “Limiti” rather than repeated as persistent visual noise. AI-originated content is visibly labeled as a proposal and is never styled as approved truth. The visual center of gravity is current state → next work → one primary action → details/proof.

## Claim boundary
“V2 Experimental ready to use” means a coherent end-to-end baseline for controlled experimental GRC work. It does not claim production hardening, legal compliance, certification, high availability, disaster recovery, external assessment, universal control completeness or complete asset discovery. The readiness rail remains separate.
