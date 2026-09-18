# UI cosmetic surface census — 17 September 2026

Status: presentation audit / implementation trace. This document does not create a runtime owner, business authority, compliance claim or new procedure.

## Scope and method

The cosmetic pass starts from `main@d1ee88feb51e4af766a351765df386874b36fe5d` and uses the canonical surface registry already declared by `v3/public/ui/native-semantic-lattice-3-2.js`. The implementation is deliberately mechanical: preserve DOM/business ordering and current runtime owners; change only sizing, spacing, visual hierarchy, wrapping, opacity and action geometry. Existing copy authorities remain authoritative.

The common rule is: identity/title/subtitle/purpose copy may use the full width of its semantic container; long body content may still use reading measures. No copy is clipped or ellipsized merely to fit a screenshot. Action clusters use equal physical targets. Hidden state, procedure membership, routes, write handlers and evidence meaning are untouched.

## Screenshot mining

The earlier draft marked Image 4 as excluded. PR164 final closure no longer treats omission as success: every repository-recovered screenshot-history intent is reconciled through the G01–G16 ledger from `FINAL_VIEW_COMPRESSION_AUDIT.md`, while handwriting that is not independently available as machine-readable repository evidence remains explicitly non-transcribed rather than guessed.

| Image | Surface / selector | Owner anchors | Observation | Treatment |
| --- | --- | --- | --- | --- |
| 1 | RN-01 `#monitoringView`, `#catalogList`, `.catalog-card` | `procedure-frame.js`, `operational-surface-a6-ux3.js`, `enduser-composition-p2.css` | State is visually weak; missing rationale is visually detached/right-shifted; header/purpose copy can consume more horizontal space. | Stronger bounded state chips; reason starts at reading edge; common width/wrap rule. |
| 2 | procedure context `.procedure-anatomy` | `procedure-anatomy.js`, `procedure-editorial-slots.js` | “Contesto e tracciabilità” is useful but visually heavy/late. | Compact calm disclosure only. No visual/DOM reordering: canonical editorial order remains `attention > controls > primary > advanced-context > reference`. |
| 3 | `.procedure-anatomy-standards`, `.procedure-standard-application` | `procedure-anatomy.js`, `procedure-anatomy.css`, A6-UX4 reference truth | Reference band has excess weight; standard names read as headings rather than index rows. | Compact reference band; normal-weight standard names; boundary remains explicit. |
| 5 | MC-01 `#grcWorkspace`, `[data-framework-card]`, `.market-scope` | `procedure-market-ux.js`, `operational-surface-a6-ux3.js` | Use state needs clearer badge semantics; scope editor entry and “Comprendi standard” have different visual grammars. | State badges by declared use; identical action geometry for scope entry and standard browser entry. |
| 6 | `#standardBrowserDialog` | `standard-browser.js`, `a6-ux3-operational-surface.css`, `a6-ux4-semantic-surface.css` | Index/detail hierarchy is too flat; selected item and provenance need stronger reading hierarchy. | Wider bounded dialog; clear master/index plane; selected row treatment; quieter item labels; stronger provenance/detail readability. |

## Canonical surface census

The 13 canonical end-user surfaces are preserved exactly as declared by `LOCAL_COMPOSITION_OWNERS` and `SURFACE_ARCHETYPE_FAMILY`.

| Surface | Root | Current composition owner | Cosmetic intent |
| --- | --- | --- | --- |
| Home | `#homeView` | `stable-shell.js` | Let title/lead use available width; keep one obvious next action. |
| Processi di Compliance | `#processesView`, `#procedureHub` | `procedure-frame.js` | Seven peer procedures; equal CTA width/height; natural wrapping. |
| RN-01 Monitoraggio | `#monitoringView` | `procedure-frame.js` | Compact registry, readable state and rationale, no clipped purpose. |
| EC-01 Eventi | `#incidentsView` | `procedure-frame.js` | Same action geometry; full-width identity/purpose copy. |
| AO-01 Oggetti | `#grcWorkspace` | `grc-workspace-3-2.js` | Dense registry rows; titles/meta never clip prematurely. |
| MC-01 Standard e Controlli | `#grcWorkspace` | `grc-workspace-3-2.js` | Clear use-state badges; equal standard-card actions; readable standard browser. |
| AP-01 Azioni | `#grcWorkspace` | `grc-workspace-3-2.js` | Stable action target geometry and full-width procedure copy. |
| RC-01 Rischi | `#grcWorkspace` | `grc-workspace-3-2.js` | Same shared copy/wrap and button rules; no semantic change to rating. |
| AR-01 Assurance | `#grcWorkspace` | `grc-workspace-3-2.js` | Same shared copy/wrap and button rules; no strengthening of assurance claims. |
| Evidenze ICTC | `#proofView` | `proof-workspace-3-2.js` | Headings/subtitles consume available plane; evidence order unchanged. |
| Reticolo epistemico | `#epistemicView` | `epistemic-workspace-3-2.js` | Preserve search-first knowledge explorer; remove arbitrary copy caps. |
| Amministrazione | `#adminCenter` | `admin-workspace-3-2.js` | Compact configuration console; two-column procedure availability at desktop; canonical ICTC copy retained. |
| Configurazione AI | `#settingsDialog` | `settings-1-8-fix.js` | Opaque dialog, readable section hierarchy, equal footer actions. |

## Visible overlay/dialog census

These are not promoted to new business surfaces; they receive the same cosmetic grammar through existing selectors.

- Standard Browser: `#standardBrowserDialog` — read-only master/detail index; sole Y-scroll owner stays `.standard-browser-master-detail`.
- Standard scope decision overlay: `.market-scope-editor[data-a6-scope-popup="native-details-overlay"]` — opaque fixed overlay; the summary remains the close/disclosure control and the existing `data-standard-scope` button is visually dominant as the save action. No implicit save is introduced.
- Plan review: `#planDialog` — opaque shell and equal footer actions.
- Material intake: `#contributionDialog` — opaque shell, full-width header copy, equal footer actions.
- Incident intake: `#incidentDialog` — same dialog grammar; no change to incident semantics.
- Admin Center: `#adminCenter` — included in canonical census; single scroll-owner model preserved.
- AI settings: `#settingsDialog` — included in canonical census.
- Other existing `.dialog-shell`, `.proof-detail-shell` and `.clarity-context-shell` overlays inherit only opacity/header/action geometry; no route or write behavior changes.

## Admin procedure availability

`admin-workspace-3-2.js` already replaces legacy language with canonical `WORKSPACE_COPY.admin`:

- title: `Disponibilità operativa dei processi`;
- purpose: availability controls new work/routing/automation without deleting records or suspending obligations;
- CTA: `Salva disponibilità operativa`.

The cosmetic pass therefore does not invent a second copy authority. It compresses the seven `.procedure-policy-row` records into a comparable two-column desktop grid, keeps one-column flow on small screens, reduces row chrome and preserves the server-backed seven-flag semantics and minimum-one-enabled rule.

## Mechanical wrapping rule

Root cause class: multiple historical layers impose `ch`-based `max-width`, `overflow-wrap:anywhere`, nowrap or ellipsis on identity/purpose copy even where the parent has unused width. The cosmetic rule is deterministic:

1. semantic identity containers get `min-width:0`, `width:100%`, `max-width:none`;
2. title/subtitle/purpose copy uses normal whitespace, no ellipsis, `overflow-wrap:break-word`, `word-break:normal`;
3. long technical values, hashes, URLs and record bodies keep their existing specialized overflow rules;
4. mobile collapses action widths to 100% instead of forcing horizontal overflow.

This targets premature line breaks without turning every long paragraph into an unbounded reading line.

## Explicit non-actions / future-safe boundaries

- The annotated request to move `Contesto e tracciabilità` or the standards reference band ahead of primary work is **not** implemented as CSS ordering. Current tests and owner contracts make the editorial sequence semantic; visual-only reordering would diverge DOM, keyboard and assistive reading order.
- Public official standard text is **not fabricated** by this cosmetic pass. ICTC already has a separate `standard-public-source-pack` runtime that can overlay complete, confirmed, versioned official public text. Proprietary ISO/COSO/etc. content still requires an authorized/licensed pack. The cosmetic pass only improves navigation and legibility of whatever content authority is actually present.
- No new global state, network call, write endpoint, feature flag, procedure, AI authority or compliance inference is added.

## Verification anchors

`v3/browser-uiux-beauty-p4.py` remains the rendered browser oracle across 13 surfaces and desktop/tablet/mobile viewports. This PR extends the same oracle to check equal Processi CTA geometry, removal of artificial copy caps, Admin feature-flag compactness/canonical labels, scope-overlay opacity/save affordance and Standard Browser master/detail readability. Existing A6-UX1/A6-UX3/A6-UX4 checks continue to protect final footer ownership, scope behavior, single-scroll authority and read-only standard navigation.


## PR164 final intent lattice

The temporary \`cosmetic-convergence-3-5.css\` file was an incubator, not a presentation authority. Its surviving rules are absorbed into the existing owners: semantic workspace closure (copy flow, action geometry and RN-01), A6-UX4 (context/reference, scope decision and Standard Browser), enterprise workspace (Admin/dialogs), and workspace chrome (AI indicator). The temporary stylesheet is no longer mounted.

Repository-recovered screenshot-history G01–G16 is reconciled as follows: header/control-plane noise is reduced by the icon-only AI capability indicator and existing profile ownership (G01/G11); heading and first-plane density remain bounded by canonical workspace owners (G02/G03/G08/G15); the seven-process catalogue stays singular and action-oriented (G04/G05/G07); non-action state stays subordinate while material state remains visible (G06); technical identity stays progressive in proof surfaces (G09); Admin is compressed into comparable operational-availability rows (G10); evidence/claim, identity-source and progressive-disclosure boundaries remain unchanged (G12–G14/G16). None of these mappings is a claim that unavailable handwritten pixels were re-transcribed.

### Mutation / falsification ladder

PR164 adds four deterministic mutation budgets: 1,000 local geometry schedules, 10,000 component schedules, 100,000 cross-surface semantic schedules and 1,000,000 global schedules. Material mutants cover wrapping, action clusters, state-axis separation, canonical DOM order, scope cancel/save behavior, Standard Browser hierarchy, Admin copy/density, AI icon/tooltip/role separation, 320px coverage and authority/claim containment. Every schedule must be killed. This is repository/model evidence, not a user study or one million browser sessions.

The existing P4 three-by-one-million campaign, P2 runtime mutation rail, P6 ten-million semantic-design saturation and exact-head browser/workflow gates remain independent predecessor falsifiers.
