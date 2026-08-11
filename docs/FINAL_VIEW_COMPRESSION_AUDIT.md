# ICTC — final-view density and onto-epistemic compression audit

**Authoritative baseline:** `main @ 005502b5b44f9fb2ac04e15560f34e488b16d1d2` (merge of PR #64).  
**Scope:** final user-facing composition only. No business-state, permission, persistence, legal-applicability or certification authority is added.

## Evidence boundary

The PPTX available through the conversation exposes slide text but not the embedded screenshot pixels/handwritten red marks to the repository/file-search channel. Therefore this catalog does **not** pretend to transcribe unreadable handwriting. It separates three evidence classes:

1. **Screenshot-derived historical observations** already recorded in prior ICTC visual audits of the supplied screenshots.
2. **Current-main observations** verified against the active presentation code at the baseline above.
3. **New engineering inferences** derived from the interaction between the two.

If the original annotated images become pixel-readable in a later environment, handwritten notes can be reconciled against this catalog without changing its categories.

## Distilled intention

> Maximize meaningful, decision-relevant information per viewport while preserving human authority, evidence, claim boundaries and accessibility. Prefer one row when it fits; wrap only under real width/zoom constraints; explain a concept once per view; move proof detail behind local progressive disclosure; never create a second ontology merely to make the screen look simpler.

The minimum product grammar remains:

**work → process → decision/action → evidence → limit/review**

AI remains proposal/support capability; administrative AI telemetry remains control-plane evidence.

## Catalog of gaps and opportunities

| ID | Evidence | Gap / bug | Local editorial or composition response |
|---|---|---|---|
| G01 | screenshot-history | Header competes with work through too many peer-level controls. | Keep work navigation primary; control-plane actions subordinate to profile/admin. |
| G02 | screenshot-history | Hero/title consumes disproportionate vertical space. | Bound operational headings and keep first actionable object above fold. |
| G03 | screenshot-history | Home repeats orientation before showing actual work. | One compact manifest; work starts immediately after it. |
| G04 | screenshot-history | Process catalog appears through competing representations. | One canonical process hub; alternative groupings are filters, not duplicate catalogs. |
| G05 | screenshot-history | Process cards repeat method/proof explanations. | Keep purpose + meaningful signal + action frontstage; proof/limits local and progressive. |
| G06 | screenshot-history | Constant badges such as normal/zero state add noise. | Render state emphasis only when it changes attention or action. |
| G07 | screenshot-history | Generic actions such as “Apri” are weakly state-oriented. | Prefer the canonical action label already owned by each procedure contract. |
| G08 | screenshot-history | Sparse data is dashboardized into large cards/empty panels. | Collapse sparse/empty states to compact rows. |
| G09 | screenshot-history | Technical ids/hash/type names appear too high in proof views. | Keep technical identity available in drilldown, not primary headline. |
| G10 | screenshot-history | Administration creates empty quadrants and long vertical scans. | Horizontal section navigation + one active admin section where already supported. |
| G11 | screenshot-history | AI state is visually overexposed relative to human work. | Keep AI state contextual; expose configuration/telemetry in control plane. |
| G12 | screenshot-history | Proof posture can visually resemble external certification. | Preserve visible claim boundary and “evidence, not certification” language. |
| G13 | screenshot-history | Local and federated identity can appear as one authority. | Keep the two authority sources semantically distinct. |
| G14 | screenshot-history | Disclosure blocks can become walls of text. | Closed by default unless the active task requires detail; split independent concerns. |
| G15 | screenshot-history | One-result/tiny collections retain large rigid layouts. | Let rows/cards shrink to content density. |
| G16 | screenshot-history | “job/novelty/baseline/fascicolo” can precede the human object. | Business noun first; implementation term only in detail/configuration. |
| G17 | current-main | Process context is repeated in H1, context strip and card/workspace kicker. | Keep H1/context once; cards use code + business name. |
| G18 | current-main | `Scopo del processo` repeats on every card although the paragraph is already purpose text. | Remove the repeated label; preserve the purpose sentence. |
| G19 | current-main | `da vedere` hides what the count actually represents. | Project canonical runtime metric labels. |
| G20 | current-main | `registrazioni` is guessed by frontend fuzzy matching. | Project actual canonical metric label/value instead of deriving a generic noun. |
| G21 | current-main | Zero-attention badge renders a repeated non-event. | Quiet zero state; surface only meaningful positive signals. |
| G22 | current-main | All-surface information value is a large panel on every view. | Convert to compact strip: purpose + common method; evidence/limit in one disclosure. |
| G23 | current-main | Home manifest method/data/boundary are vertically stacked. | Keep purpose explicit; make method inline and data/AI+boundary compact detail. |
| G24 | current-main | Context strip restates the same process title that the frame immediately repeats. | Context carries navigation/code, frame carries the business title. |
| G25 | current-main | Proof context repeats `Postura ICTC` immediately beside its own heading. | Breadcrumb carries only navigation ancestry where heading is authoritative. |
| G26 | current-main | Epistemic context repeats cross-surface terminology before the local title. | Keep compact ancestor + EP-01 code; local heading owns title. |
| G27 | current-main | Final convergence CSS still lets several action clusters choose different wrapping behavior. | Apply one shared horizontal-first geometry grammar. |
| G28 | current-main | Compactness is not currently a measured release invariant. | Add exact 10k semantic falsifier + browser geometry budgets. |
| G29 | current-main | Duplication is discussed qualitatively but not counted as a bounded audit object. | Maintain anchored duplication families and pairwise witness count. |
| G30 | inference | Forcing one line everywhere would trade vertical economy for horizontal overflow. | “One row when it fits” is the invariant, never `nowrap` as dogma. |
| G31 | inference | Hiding evidence/boundary to gain space would destroy information value. | Compress through disclosure, not deletion. |
| G32 | inference | Persona-specific copy can accidentally create persona-specific ontologies. | Role changes authority/action, not underlying object semantics. |
| G33 | inference | Adding another polish enhancer would worsen composition debt. | Mutate existing canonical terminal primitive and frame. |
| G34 | inference | New color semantics in the convergence layer would create a second visual authority. | Geometry/rhythm only; semantic colors remain owned by existing surfaces. |
| G35 | inference | Counting visual elements alone rewards meaningless density. | Density metric is decision-relevant information per viewport, bounded by readability/accessibility. |
| G36 | inference | Excessive compactness can weaken keyboard/touch usability. | 44px target minimum remains non-negotiable. |

## Duplication census

`v3/information-density-model.mjs` records eight anchored logical duplication families. Pairwise witnesses are a bounded way to express how many duplicated relationships the families create; they are **not** claimed as 100+ independent defects.

- process context: repeated hub/context/kicker/empty-state representations;
- purpose framing: repeated meta-labels and panels;
- evidence framing: repeated front-stage evidence explanation;
- boundary framing: repeated full disclaimer blocks;
- common method framing: repeated stacked taxonomy;
- state badges: seven process-level normal/attention badges;
- generic counters: seven semantically weak attention counters;
- action language: repeated generic “open” entry actions.

The executable contract yields 199 pairwise witnesses (>100), preventing the audit from collapsing into a few cosmetic anecdotes. The runtime slice retires the high-value duplications rather than attempting to delete every repeated word.

## Challenging Definition of Done

### DoD A — screenshot/gap closure
- G01–G36 are classified and every current-main item G17–G29 has a code/test response or an explicit non-goal.
- No claim is made that unreadable handwritten pixels were transcribed.
- Product copy remains bounded: no legal applicability, conformity or certification conclusion is introduced.

### DoD B — horizontal-first and scroll economy
- On 1280×900 desktop, final-view framing is compact enough that the first meaningful work/action remains in the first viewport for Home and Processi.
- Action/tool clusters occupy one row whenever their measured combined width fits the container; wrapping is allowed when it does not.
- Page-level horizontal overflow is zero at 1280, 390 and 320 widths.
- Interactive targets remain at least 44px.
- Collapsed detail retains keyboard-native semantics.

### DoD C — onto-epistemic polish/compression
- A primary concept is not repeated across context strip + immediate heading + card kicker.
- Process signals use canonical metric labels; generic `da vedere`/`registrazioni` are retired from the canonical frame.
- Normal zero-attention badges are quiet.
- Evidence and limits remain reachable on every final surface.
- Human authority, AI proposal authority and role/access semantics remain distinct.
- No new renderer, profile, product generation or release identity is created.

### DoD D — falsification and closure
- Exactly 10,000 deterministic semantic scenarios execute: 2,500 normal, 2,500 edge, 2,500 stress, 2,500 adversarial.
- All declared wrong-rule mutants are discriminated.
- The duplication catalog yields >100 anchored pairwise witnesses.
- Semantic suite, runtime suite, browser journeys, launcher and applicable security checks are green on one exact PR HEAD.
- Conditional CodeQL skip is reported as skipped, not green.

## Metrics

- `duplicationPairWitnesses`: 199 (>100), audit pressure metric only.
- `semanticScenarios`: exactly 10,000.
- `families`: exactly 4 × 2,500.
- `genericCanonicalFrameLabels`: 0 for `da vedere` and `registrazioni`.
- `normalStateBadgeOnZeroAttention`: 0 in canonical procedure frame.
- `documentHorizontalOverflow`: 0 at tested viewports.
- `minInteractiveTargetPx`: >=44.
- `proofBoundaryReachability`: 100% of modeled final surfaces.
- `newPresentationAuthorities`: 0.

## Non-goals

This slice does not redesign storage, permissions, state machines, legal applicability, certification, external identity providers or AI provider security. It does not assert that compactness itself improves human comprehension without user research; browser and semantic tests establish engineering properties only.
