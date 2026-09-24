# A6-UX4 canonical landing-page UI/UX contract

Status: repository-bounded **candidate** contract inside S4-A6. Parent S4-A6 / GAP-020 remains open.

This document defines the minimum-complete presentation grammar for the repository-owned UI. It is not legal-compliance proof, accessibility certification, representative-human usability evidence, deployment-effectiveness evidence, or an enterprise-ready claim.

## Cross-surface minimum-complete grammar

Every operational surface MUST let a typical user answer, without consulting a second competing collection:

1. **Identity** — where am I and which procedure/surface owns this record?
2. **Purpose** — what is this surface for?
3. **Subject** — which record/object am I looking at?
4. **State** — which state matters for the current decision?
5. **Next action** — what needs attention now?
6. **Effect** — does this control navigate, inspect, gather evidence, decide, or execute a control?
7. **Authority** — can my role write/decide or only observe?
8. **Evidence** — why is ICTC showing this fact or recommendation?
9. **Uncertainty** — what is unknown, unverified, incomplete, or pending?
10. **Scope** — how do I reveal non-actionable or terminal items without making them the default?
11. **References** — which source, standard, basis, or evidence is relevant?
12. **Human decision** — which judgment remains attributable to a person?
13. **Claim boundary** — does the UI describe repository evidence rather than imply compliance/certification?

### Shared visual/runtime invariants

- Exactly **one visible operational collection** when every S1/A1 actionable typed target binds to a native record.
- Any partial/unresolved binding **fails closed** to the canonical visible worklist; compression may never hide work.
- One local search/filter grammar; no second `Da fare` toolbar and no `Mostra altri elementi` disclosure as a competing work surface.
- A local collection has exactly one search/state/window owner. RN-01 and EC-01 use their native local toolbar; GRC collections may expose actionable/all scope where that distinction is native to the workspace.
- Terminal/quiescent records are not the default work queue but remain discoverable.
- Navigation/inspection is visually and semantically weaker than write/decision actions.
- Status presentation never collapses lifecycle, epistemic state, organizational use, applicability, and mapping into one badge.
- Unknown stays unknown: presentation must not turn `undeclared` into a negative fact.
- One content owner for context; one visually distinct reference/standards band.
- At desktop the Standard Browser master-detail is the only bounded vertical scroll owner; at 390px/320px it reflows to the page/dialog flow with no local horizontal overflow.
- Minimum interactive target for critical close/navigation controls is 44px; forced-colors and reduced-motion remain supported.
- No A6-UX4 layer may create a new API/write authority, palette authority, release-promotion path, or business-state owner.

## Home

**Canonical purpose.** Fast orientation and triage. One product identity and one priority queue answer “what deserves my attention and where do I go next?”.

**Minimum UI.** Compact priority rows combine process icon, task identity/reason and a 44px micro-open affordance. The open affordance is intentionally visually subordinate; the previous dominant-arrow effect is rejected.

**Typical users.** Operators scan priorities; managers/reviewers identify where attention is concentrated; read-only users can navigate without acquiring write authority.

**Anti-regression.** Exact-head browser asserts product title, no textual arrow in priority-open controls, reduced icon geometry, page reflow and no write side effects from navigation. Mutation families reject dominant arrows, multiple primaries, verbose rows and action-effect ambiguity.

**Why minimal.** Home does not duplicate procedure registries, compliance scores or evidence detail. It only identifies attention and routes to the owning surface.

## Processi di Compliance

**Canonical purpose.** Stable map of the seven peer procedures: RN-01, EC-01, AO-01, MC-01, AP-01, RC-01 and AR-01.

**Minimum UI.** Stable code/name/purpose and one direct entry per procedure; no AI prerequisite and no competing procedure ontology.

**Typical users.** Any role can establish where a task belongs before entering details.

**Anti-regression.** Browser asserts exactly seven procedure cards and page reflow at desktop, 390px and 320px. Ontology mutations reject missing identity/purpose and duplicate axis owners.

**Why minimal.** The hub is navigation, not a second operational queue.

## RN-01 — Monitoraggio normativo e fonti

**Canonical purpose.** Observe sources/materials, verify source truth, plan monitoring and distinguish source observation from impact assessment.

**Minimum UI.** Sources and scheduled monitoring are distinct native collections. Source work receives the full available width and keeps one canonical title/authority/state search row. `Monitoraggi` is secondary and closed by default; its own row owns search, state, `x di y` and bounded `Mostra altri N`. No additional `Vista: Azioni correnti | Tutti gli elementi` control is mounted over RN-01.

**Epistemic boundaries.** Source existence, source verification and downstream impact are separate axes. A source being present does not mean it has been verified or that an organizational impact has been decided.

**Anti-regression.** Browser requires semantic-bridge binding, one visible collection, actionable native records, hidden redundant worklist, integrated scope selector and merged material aside. Mutations reject material-aside width theft, duplicate toolbar, source/verification/impact collapse and unbound actionable targets.

**Why minimal.** One collection answers both “what needs action?” and “what else exists?” without duplicating the same records.

## EC-01 — Eventi registrati

**Canonical purpose.** Register and work events while keeping registration, qualification, investigation and any external-notification decision distinct.

**Minimum UI.** One `Eventi registrati` heading/count, one local search/state/window toolbar and one native event collection. Bounded expansion is owned by that same toolbar; no competing `Altri fascicoli evento` disclosure or parallel scope selector remains.

**Epistemic boundaries.** Registration is a fact about ICTC records; it does not imply legal qualification, external notification, root-cause conclusion or closure validity.

**Anti-regression.** Browser rejects a visible inner duplicate event heading and requires single-collection binding. Mutations reject duplicate titles/counts, terminal-as-next-action and claim laundering.

**Why minimal.** One registry owns event identity; attention is a projection over it, not a second list.

## AO-01 — Inventario di sistemi e oggetti

**Canonical purpose.** Maintain stable object identity, lifecycle and basis prerequisites before human attestation/governance actions.

**Minimum UI.** The native object registry is the visible collection. Candidate/governed/terminal lifecycle remains visible but does not replace evidence/basis completeness. Activation/attestation actions remain unavailable when prerequisites are incomplete.

**Epistemic boundaries.** Lifecycle state is not substantive completeness and does not prove a control or legal conclusion.

**Anti-regression.** Typed/stable record binding and worklist/native count equivalence remain blocking. Mutations reject unstable index binding, worklist drift, raw-state leakage and lifecycle/epistemic-axis collapse.

**Why minimal.** Stable object identity plus one current-action projection is sufficient; a second `Da fare` card wall adds no authority.

## MC-01 — Standard e Controlli

**Canonical purpose.** Understand standards/frameworks, organizational-use status, applicability/scope and mappings without collapsing those axes or reproducing proprietary source text.

**Minimum UI.** Framework cards remain the native collection. `undeclared` persists as runtime truth and is presented as **Uso da dichiarare**, not as non-use. `Applicazione con evidenza` is presented as **Uso metodologico con evidenza**, explicitly below certification strength. `Standard e pratiche applicate` is a visually strong reference band distinct from its rows. Inside MC-01 the first-plane order is **Biblioteca → Vista integrata → Mappature operative**; only Mappature is progressive and closed by default. One `Comprendi standard` entry opens the read-only Standard Browser.

**Standard Browser geometry.** Equal ref/label identities are deduplicated. Objectives wrap. Desktop has one bounded vertical scroll owner: `.standard-browser-master-detail`; non-scroll descendants use `overflow-x: clip; overflow-y: visible`. At 390px/320px master-detail becomes single-column flow. No local horizontal scrollbar is permitted and close target remains >=44px.

**Epistemic boundaries.** Organizational use, applicability and mapping are separate; method evidence is not certification; a summary does not replace the official source; browser consultation cannot write business state.

**Anti-regression.** UX3 exact-head Chromium preserves historical master-detail/single-scroll-owner behavior; UX4 exact-head Chromium adds horizontal-overflow, copy, identity-dedup, mobile and no-write oracles. Static contract rejects independent palettes and business network writes.

**Why minimal.** One framework record, one understanding entry and one scope editor provide all necessary decisions. Extra usage badges, duplicate concept drilldowns or parallel standard lists increase ambiguity rather than information.

## AP-01 — Azioni correttive

**Canonical purpose.** Progress corrective actions through typed states while preserving attributable review/decision points.

**Minimum UI.** Native action records are the visible collection; actionable-by-default scope surfaces proposed/open/in-progress/ready-for-review work and reveals the rest through the same toolbar.

**Epistemic boundaries.** Navigation or inspection never implies execution; ready-for-review is not approval or completion.

**Anti-regression.** Effect grammar classifies controls and role/write boundaries remain external to presentation. Mutations reject navigation-to-write conflation, terminal default leakage and human-decision automation.

**Why minimal.** State + next action + effect + human authority are sufficient; duplicate attention cards are not.

## RC-01 — Rischi di compliance

**Canonical purpose.** Work risk records while separating assessment, treatment and review judgments.

**Minimum UI.** Native risks are the visible collection with actionable scope integrated into the local toolbar.

**Epistemic boundaries.** Risk labels are not probabilities, legal conclusions or evidence of treatment effectiveness; human assessment/review remains explicit.

**Anti-regression.** Single collection, stable binding, action-effect and claim-boundary mutations are blocking.

**Why minimal.** One risk record carries identity/state/evidence/decision. A second queue would repeat the same authority.

## AR-01 — Richieste e assurance

**Canonical purpose.** Track assurance/request cases through drafting, evidence gathering, review and approval while preserving role boundaries.

**Minimum UI.** Native assurance cases are the visible collection; actionable scope is integrated, not repeated as a separate worklist.

**Epistemic boundaries.** Drafting, review and approval remain distinct. Read-only/auditor actors can inspect evidence without receiving a write control through presentation.

**Anti-regression.** Role-collapse and write-visible-for-auditor mutations are blocking; browser network oracle rejects non-GET writes caused by navigation/inspection.

**Why minimal.** One case collection plus role/effect cues is enough to answer “what can I do?” without duplicating case state.

## Evidenze ICTC

**Canonical purpose.** Reconstruct repository-owned facts, decisions, bases and technical evidence without laundering technical status into compliance.

**Minimum UI.** Semantic evidence/boundaries precede or own interpretation; the runtime snapshot is explicitly secondary. `Perimetro di accesso` becomes **Vista per ruolo** and `Catena integra` becomes **Coerente tecnicamente** / **Coerenza tecnica da verificare**.

**Epistemic boundaries.** Role-scoped visibility is not proof of access sufficiency. Technical chain coherence is not legal compliance, production effectiveness or certification.

**Anti-regression.** Browser requires repository-observation claim scope, bounded labels and page reflow. Mutations reject technical-first proof, visibility-to-access sufficiency and technical-coherence-to-compliance transformations.

**Why minimal.** Evidence must answer what is observed, why, and with which boundary. Telemetry is supporting evidence rather than the first or strongest claim.

## Mutation and oracle evidence

A6-UX4 is protected by layered evidence with explicit epistemic grades:

- deterministic semantic/geometry campaign: **10,000 cases**;
- screenshot-derived UI/UX mounting campaign: **100,000 cases** across 25 negative patterns plus end-user questions;
- editorial/semantic/visual/minimum-complete ontology campaign: **100,000 cases**, 48 mutation families across 13 required axes;
- exact-head Chromium: desktop 1440 plus 390px and 320px, including single visible collection, Standard Browser geometry, role/copy boundaries and no navigation-induced writes;
- successor-lineage UX3 Chromium remains blocking for historical operational invariants, including the single desktop vertical scroll owner.

The deterministic campaigns are **E2 model/source evidence**, not browser sessions or human studies. The browser rails are repository exact-head automation, not representative-human usability or independent assurance.

## Acceptance checklist

A6-UX4 is acceptable only when all are true:

- [ ] 7/7 procedures retain typed S1/A1 actionable authority.
- [ ] 7/7 expose one visible operational collection when exact native binding is complete.
- [ ] Partial binding restores the canonical worklist; no actionable item can disappear silently.
- [ ] No redundant `Da fare` / `Mostra altri elementi` competing collection remains in the exact-binding path.
- [ ] RN-01 source width is not consumed by a redundant material aside.
- [ ] EC-01 has one visible `Eventi registrati` heading/count owner.
- [ ] One canonical context label/disclosure is visible.
- [ ] Standards/reference band is visually distinct; use/applicability/mapping remain separate.
- [ ] Home open affordance is compact and non-dominant.
- [ ] Standard Browser has no horizontal overflow at 1440/390/320 and <=1 bounded vertical scroll owner on desktop.
- [ ] Critical targets remain >=44px; forced-colors/reduced-motion behavior is preserved.
- [ ] 10k + 100k screenshot-derived + 100k ontology campaigns have zero survivors.
- [ ] Existing current semantic, runtime, stable, enterprise-boundary and governance rails are green on the exact PR head.
- [ ] Convergence workbook binding is green and uses the observed base main SHA, never a prospective merge fact.
- [ ] Parent S4-A6 remains open; no enterprise-candidate or enterprise-ready claim is introduced.
