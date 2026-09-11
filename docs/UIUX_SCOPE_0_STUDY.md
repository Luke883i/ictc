# UIUX-SCOPE-0 — mounted-surface census and convergence study

**Classification:** repository-bounded UIUX scope / rationalization study (E2).  
**Observed Git main:** `255cb9363efd10b46c8ccb3c323427b8e222199a` (merged PR #137 / TRUTH-0).  
**Non-claim:** this study does not prove aesthetic quality, representative usability, assistive-technology effectiveness, deployment behavior, legal compliance, or enterprise readiness.

## 1. Why this study exists

A6-UX1..UX4 established fixed-safe chrome, palette ownership, operational surfaces and semantic-surface contracts, but those facts do not imply that the current experience is visually compressed, calm, attractive or easy to scan. The repository now has enough semantic structure to distinguish a new problem: **presentation convergence is technically governed but still visibly over-stratified**.

The objective is therefore not a new cosmetic layer. It is to rationalize the mounted experience so that common structure is visually common, procedure semantics stay specific, repeated work is dense by default, and epistemically material fields survive compression.

## 2. Mounted experience census

`v3/public/app.js` installs `active-experience.js`; that composition root currently invokes **45 direct installers**. The experience constitution still admits exactly **five final participants** across harmonization, presentation, integrity, journey and annotation, with decision-presentation exclusive. Installer count is diagnostic rather than a quality KPI: the defect risk is not “too many files”, but multiple historical/feature mutators producing persistent markup/copy/style before final convergence.

The semantic surface registry defines 13 user-facing or subordinate surfaces:

| Surface | Runtime root | Class | Current semantic role | Rationalization target |
|---|---|---|---|---|
| Home | `#homeView` | common landing | work / attention | one next-decision strip + max 3 compact priorities; no stacked hero/dashboard narration |
| Processi | `#processesView` | common landing | catalogue | seven compact one-row procedure entries; code + title + one-line purpose + route |
| RN-01 Monitoraggio | `#monitoringView` | procedure | work | one canonical page identity; dense monitor/source registers; narrative only where needed |
| EC-01 Incidenti | `#incidentsView` | procedure | work | one canonical page identity; dense event register; narrative expands on demand |
| AO-01 Oggetti | `#grcWorkspace` | procedure | work | inventory row/table grammar; owner/source/reattest inline |
| MC-01 Standard/controlli | `#grcWorkspace` | procedure | work | requirement/mapping rows; scope basis + unresolved gap remain visible |
| AP-01 Azioni | `#grcWorkspace` | procedure | work | worklist rows; owner/due/execution/closure verification remain distinct |
| RC-01 Rischi | `#grcWorkspace` | procedure | work | scenario rows; rating is not status/probability; treatment/review action distinct |
| AR-01 Assurance | `#grcWorkspace` | procedure | work | request/response rows; answer version/evidence visible when material |
| Evidenze ICTC | `#proofView` | auxiliary | evidence | fact strip + decision/evidence register; secondary domains as compact disclosures |
| Reticolo epistemico | `#epistemicView` | auxiliary | relationships | one toolbar row when width permits; list first, graph optional; technical modes progressive |
| Amministrazione | `#adminCenter` | auxiliary | administration | one identity + attention; compact tabs/sections; technical diagnostics progressive |
| Configurazione AI | `#settingsDialog` | subordinate | configuration | two-column form; advanced instructions disclosed on demand |

Dialogs and subordinate workspaces remain interaction surfaces, but they are not new trajectory-level landings. They inherit the common dialog grammar and are audited under the owning landing/work-unit.

## 3. Structural findings

### F-UX-01 — common frame and legacy procedure hero can coexist

`procedure-frame.js` prepends a canonical frame to RN-01 and EC-01 while the static document already contains rich procedure heroes with their own title, explanatory copy and action panels. Later enhancers can hide or normalize pieces, but the architecture permits two identity/narrative layers to coexist. This is a direct source of visual height and ambiguity even when semantic ownership ultimately converges.

**Target:** the common procedure frame becomes the sole page identity. Procedure-specific bodies own work content, not a second hero identity.

### F-UX-02 — repeated registries still default to heterogeneous card grammars

Base rendering uses separate `mission-card`, `catalog-card`, `incident-card` and GRC `<article>` records. Meanwhile the current semantic composition invariant already says `list-before-cards`. The contract is therefore stronger than the final presentation: repeated records should default to compact rows/lists, and cards should be an explicit exception for a single narrative/decision object or grouped summary.

**Target:** one dense record primitive with procedure-specific columns/fields, plus a narrow narrative-card exception.

### F-UX-03 — semantic annotation is stronger than visual enforcement

`semantic-composition-runtime.js` mainly annotates roots with composition version, information role and local owner. It does not itself enforce one-row density, typography hierarchy, primitive geometry or duplicate-identity retirement.

**Target:** semantic composition remains authority, while `UIUX-CONVERGE-0` gives its density/primitive invariants a material browser-visible implementation.

### F-UX-04 — five constitutional owners do not eliminate pre-constitution visual layering

The constitution correctly constrains final participants, but the active composition root installs 45 direct modules. Some are bootstrap/features and are healthy; some are compatibility/presentation enhancers. Counting modules is not a target. **Persistent slot ownership** is the target: each semantic visual slot must end with one owner, and compatibility presentation mutators must be retired or reduced after parity evidence.

**Target:** C5 remains the owner-compression rail; UIUX convergence depends on C5 being terminal before claiming visual-owner convergence.

### F-UX-05 — Proof is semantically ordered but can still be visually tall

The proof workspace already converges reading order to facts → decisions → evidence basis → trace → epistemic investigation → external → integrity → method → export. That is semantically sound, but nine visually equivalent stacked regions can still feel heavy.

**Target:** facts + decision/evidence register dominate; secondary domains become visually compact disclosure rows without losing external-evidence boundaries.

### F-UX-06 — Epistemic already has progressive disclosure; default analytical mode still needs density discipline

The epistemic workspace already moves advanced filters and technical modes behind disclosure and makes `Quadro` the primary mode. This should be preserved. The remaining target is to prevent lens/tool overlays from rebuilding a dashboard-like stack and to make relation-list scanning the calm default.

### F-UX-07 — Admin already hides technical detail, but configuration domains need one visual grammar

The native admin workspace hides non-actionable metrics/boundary blocks and moves readiness under technical disclosure. Remaining convergence is primarily consistent section/tab geometry, action hierarchy and elimination of component-specific card styles.

## 4. Lossless compression law

“More compressed” does **not** mean “flatter”. A row may compress labels, spacing and secondary prose, but it may not suppress epistemically material information.

When material, the visible or immediately adjacent interaction must preserve:

- state;
- subject/record identity;
- authority or owner;
- next action;
- boundary/limitation;
- basis, version, due date and provenance when they change the decision.

Responsive layout may wrap or stack this order. It may not change the semantic order or silently demote authority/state/action meaning.

## 5. Minimal design grammar

The target common primitive set is deliberately small:

1. **Chrome** — header/nav/profile/footer and global spacing/tokens.
2. **Surface header** — back/context + code/title + one-line purpose + primary action.
3. **Attention strip** — max three action-relevant priorities; no synthetic compliance score.
4. **Control rail** — search/filter/sort/view controls on one line when width permits, wrapping losslessly.
5. **Record row** — default repeated-work primitive.
6. **Narrative/decision card** — exception for a single object that needs prose or a human decision checkpoint.
7. **Evidence row** — basis/version/provenance/receipt with claim boundary.
8. **Progressive disclosure** — technical, explanatory or historical detail.
9. **Dialog/workspace frame** — subordinate create/review/configuration flows.

Procedure modules specialize fields and actions. They do not fork common tokens or geometry.

## 6. Procedure-specific density contract

- **RN-01:** monitor rows and source rows; candidate/verified/rejected is state, applicability stays human; “add material” is the primary entry and plan creation is secondary/disclosed.
- **EC-01:** event rows preserve observed narrative identity/time/state/next action; the full narrative is expandable, not repeated in every card-sized block.
- **AO-01:** inventory rows expose type/name/owner/source/reattest need; metadata and evidence open in detail.
- **MC-01:** requirement/mapping rows expose framework/requirement/scope basis/mapping state/gap/next decision; never present a conformity percentage as truth.
- **AP-01:** action rows expose owner/due/execution/verification/next action; “completed” and “closed+verified” remain visually distinct.
- **RC-01:** scenario rows expose rating as human assessment, next review and treatment; severity color cannot masquerade as workflow status.
- **AR-01:** request/response rows expose request, answer version, owner/due, evidence basis and review/approval action; internal approval never appears as independent assurance.

## 7. One-million mutation result

The final deterministic harness uses seed `ictc-uiux-scope-0-onto-epistemic-2026-09-11`.

- 58 mutation families;
- 58/58 material single-family mutants killed by the full model oracle;
- 1,000,000 deterministic symbolic multi-family compositions (1–4 independently killed families per trial);
- 0 survivors;
- 0 harness errors.

The first attempted harness was **discarded**: it exposed that the oracle accepted an incorrect surface root because it checked only root presence, not root identity. The oracle was strengthened before the million-run result was counted.

Mutation levels cover ontology/surface identity, heading/action hierarchy, record density, epistemic non-equivalences, trajectory topology, work-unit completeness, human-evidence boundary and mount/authority structure.

This is repository E2 falsification of the model. It is **not** evidence that a human finds the interface pleasant.

## 8. Workbook lattice falsification

Five alternatives were tested conceptually and by mutation:

1. **UIUX-SCOPE → UIUX-REALITY → UIUX-DECIDE as three new serial barriers:** rejected; duplicates cognition already owned by SCOPE-0/REALITY-0/DECIDE-0.
2. **Seven serial UI procedure slices:** rejected; serializes implementation without semantic need.
3. **Fold all UIUX into C5:** rejected; C5 contracts ownership, but does not decide target density or implement procedure-specific presentation.
4. **Wait until S4-A6-CLOSE:** rejected; closure must verify convergence, not discover or implement it.
5. **Redesign immediately before SCOPE/REALITY:** rejected; would encode unproven target-user/client/density assumptions.

### Converged minimum

`GOV-WB4 → TRUTH-0 → SCOPE-0 → REALITY-0 → DECIDE-0 → UIUX-CONVERGE-0 → S4-A6-CLOSE → S5-CANDIDATE-SEAL`

UIUX becomes a cross-cutting obligation of the existing discovery/decision sequence:

- **SCOPE-0:** define target operator/jobs/client/density/success/non-goal requirements. Repository evidence may suggest hypotheses; unresolved product decisions remain unresolved.
- **REALITY-0:** materialize exact final-DOM/mount/visual-debt evidence against that target, including title duplication, slot ownership, token coverage, density and responsive/a11y behavior.
- **DECIDE-0:** choose the canonical primitive set, common/specific boundary, compatibility retirement and target density from scope + reality evidence.
- **UIUX-CONVERGE-0:** implement those decisions across common shell, Home, Process hub, RN, EC, AO, MC, AP, RC, AR, Admin, Epistemic and Proof; then run cross-surface falsification.

C2/C5 remain eligible after TRUTH-0. C1/C3/C4 remain eligible after DECIDE-0. All C1–C5 still must reach a terminal state before S4-A6-CLOSE. C5 is additionally a semantic-owner gate for the UIUX convergence claim.

## 9. UIUX-CONVERGE-0 internal work units

The new serial barrier is one slice with fourteen independently testable work units, not fourteen governance barriers:

- `UXW-01-COMMON-SHELL-AND-MOUNT-COMPRESSION`
- `UXW-02-HOME`
- `UXW-03-PROCESS-HUB`
- `UXW-04-RN-01`
- `UXW-05-EC-01`
- `UXW-06-AO-01`
- `UXW-07-MC-01`
- `UXW-08-AP-01`
- `UXW-09-RC-01`
- `UXW-10-AR-01`
- `UXW-11-ADMIN`
- `UXW-12-EPISTEMIC`
- `UXW-13-PROOF`
- `UXW-14-CROSS-SURFACE-FALSIFICATION`

A work unit can be merged only if it reduces or preserves active presentation ownership; it may not add a new final resolver, second business write authority, synthetic compliance score, semantic state collapse or hidden technical-default surface.

## 10. Evidence boundary

Repository automation can establish surface census, owner uniqueness, one-H1/one-primary-action contracts, primitive/token conformance, responsive semantic-order invariance and browser/a11y E2 behavior. **Perceived pleasantness, representative comprehension, representative task efficiency and assistive-technology usability remain E3-HUMAN evidence.**
