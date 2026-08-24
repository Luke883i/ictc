# UI Fine-Tuning 3.4 — DoD

## Intent

Converge the current native workspace lineage on one bounded presentation slice without adding a new semantic or decision owner. The slice resolves four user-visible drifts: global chrome, Home work summary, Evidence composition, and Process catalogue geometry.

## Global DoD

- `stable-shell.js`, `procedure-frame.js`, and `proof-workspace-3-2.js` remain the canonical local owners.
- 3.4 is a presentation closure loaded after Workspace Chrome 3.3; it does not rewrite business semantics, data, permissions, routing, or procedure state.
- Desktop and mobile retain the canonical three-service shell, seven business processes, EP-01 cross-cutting boundary, 44px shared interaction grammar where applicable, and no horizontal overflow.
- The semantic rail executes both the 3.4 static contract and the 4M mutation saturation gate.

## Task 1 — Header and footer

DoD: the header mounts the canonical inline SVG mark directly and contains no raster logo mount; header remains dark but is visibly lighter than the footer; footer uses a perceptible three-stop dark gradient; footer product and legal links share one vertical alignment; the ambiguous `Candidate` label is absent from rendered footer markup.

Metrics: raster logo mounts `0`; canonical inline mark `1`; header gradient stops `3`; footer gradient stops `3`; visible footer product labels `1`; footer `Candidate` labels `0`.

## Task 2 — Home summary

DoD: attention rows are grouped inside one bounded table-like surface, not independent double-bordered cards; rows use one separator; the first row adds no duplicate top rule; route actions share one compact treatment and preserve the underlying process routing semantics.

Metrics: summary surfaces `1`; internal row separators `n-1`; duplicate perimeter rules `0`; primary row minimum height `>=44px`; routing semantics changed `0`.

## Task 3 — Evidenze ICTC

DoD: the canonical Reticolo epistemico disclosure is unique inside Evidence and remains the first row; duplicate EP-01/meta cards inside Evidence are removed by the Proof owner; Evidence header is compact, neutral/default-color, and contains no decorative hero note.

Metrics: Evidence lattice entries `1`; lattice position `1`; duplicate meta entries `0`; decorative hero notes visible `0`; header text color authority `var(--color-text)`.

## Task 4 — Process catalogue

DoD: desktop process cards share equal grid rows and equal height; canonical visible children are only code, title, catalogue summary, and CTA; historical local labels/details such as `Governa`, decision/proof annotations, signals, or other injected direct children remain hidden from catalogue view; mobile returns to natural auto-height.

Metrics: desktop equal-row policy `1`; canonical direct visible child classes `4`; local-noise direct children visible `0`; CTA alignment `end`; mobile forced equal height `0`.

## Reticular DoD

A change is accepted only when all four domains remain mutually compatible: chrome does not style local workspaces; Home does not become a second process owner; Evidence deduplication does not remove the Processes EP-01 secondary entry; catalogue compression does not hide workspace content after navigation. 3.4 must be a final cascade resolver, not a new composition runtime.

## Falsification

`v3/ui-finetuning-3-4-saturation.mjs` runs four deterministic campaigns of 1,000,000 mutations each over eight abstraction levels per task (4,000,000 total). The required result is 100% kill, zero survivors, broad level/family coverage. These are model mutations tied to source-verified UI invariants, not browser sessions or human preference studies.

## Checklist

- [ ] Canonical SVG mounted inline; PNG mount absent.
- [ ] Header/footer gradients preserve hierarchy and forced-colors fallback.
- [ ] Footer text is vertically aligned and `Candidate` removed.
- [ ] Home uses one table-like perimeter and single row separators.
- [ ] Evidence contains one first-row Reticolo epistemico entry.
- [ ] Evidence header is compact and neutral.
- [ ] Process cards are equal on desktop and natural-height on mobile.
- [ ] Non-canonical direct card annotations are hidden.
- [ ] Existing local owners and routing are unchanged.
- [ ] Static 3.4 contract passes.
- [ ] 4,000,000/4,000,000 mutations are killed.
- [ ] Current semantic rail and repository CI remain green.
