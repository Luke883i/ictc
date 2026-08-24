# UI Fine-Tuning 3.4 — DoD

## Intent

Converge the current native workspace lineage on one bounded presentation slice without adding a new semantic or decision owner. The slice resolves the current user-visible drifts in global chrome, luminous landing continuity, Home work summary, Evidence composition, and Process catalogue geometry.

## Global DoD

- `stable-shell.js`, `procedure-frame.js`, and `proof-workspace-3-2.js` remain the canonical local owners.
- 3.4 is a presentation closure loaded after Workspace Chrome 3.3; it does not rewrite business semantics, data, permissions, routing, or procedure state.
- No React runtime or icon dependency is introduced: the existing vanilla runtime renders a Lucide-compatible inline SVG for the Home action affordance.
- Desktop and mobile retain the canonical three-service shell, seven business processes, EP-01 cross-cutting boundary, 44px shared interaction grammar where applicable, and no horizontal overflow.
- The semantic rail executes both the 3.4 static contract and the mutation saturation gate.

## Task 1 — Header and footer

DoD: the header mounts the canonical inline SVG mark directly, contains no raster logo mount, and uses a visibly darker three-stop navy/blue gradient than the previous 3.4 tuning; the footer retains a perceptible three-stop dark gradient while improving text/link clarity through stronger muted contrast, bounded link hit areas, and a visible hover state; footer product and legal links share one vertical alignment; the ambiguous `Candidate` label remains absent from rendered footer markup.

Metrics: raster logo mounts `0`; canonical inline mark `1`; header gradient stops `3`; footer gradient stops `3`; footer links with explicit hover treatment `3`; visible footer product labels `1`; footer `Candidate` labels `0`.

## Task 2 — Landing continuity

DoD: Home, Processi and Evidenze landing headers share one luminous, low-contrast gradient vocabulary based on shared tokens; each surface remains bounded by the same border/shadow grammar and keeps dark default text; no procedure runtime, admin surface, business semantics, routing, or state is restyled by this landing treatment.

Metrics: shared landing gradient owners `1`; covered canonical landing surfaces `3`; new semantic owners `0`; procedure/admin scope leaks `0`.

## Task 3 — Home summary and actions

DoD: attention rows are grouped inside one bounded table-like surface, not independent double-bordered cards; rows use one separator; the first row adds no duplicate top rule. Each route action is rendered as one inline CTA containing the `Apri` label and a Lucide-compatible `arrow-up-right` SVG, replacing the text arrow. CTA gradient colors derive from the same brand/header vocabulary used by the global chrome and preserve the underlying process routing semantics.

Metrics: summary surfaces `1`; internal row separators `n-1`; duplicate perimeter rules `0`; primary row minimum height `>=44px`; text-arrow glyphs in Home route CTA `0`; Lucide-style SVG action icons `1` per rendered CTA; routing semantics changed `0`.

## Task 4 — Evidenze ICTC

DoD: the canonical Reticolo epistemico disclosure is unique inside Evidence and remains the first row; duplicate EP-01/meta cards inside Evidence are removed by the Proof owner; Evidence landing header uses the shared luminous landing treatment, remains compact, and contains no decorative hero note.

Metrics: Evidence lattice entries `1`; lattice position `1`; duplicate meta entries `0`; decorative hero notes visible `0`; header text color authority `var(--color-text)`.

## Task 5 — Process catalogue

DoD: desktop process cards share equal grid rows and equal height; canonical visible children are only code, title, catalogue summary, and CTA; historical local labels/details such as `Governa`, decision/proof annotations, signals, or other injected direct children remain hidden from catalogue view; mobile returns to natural auto-height.

Metrics: desktop equal-row policy `1`; canonical direct visible child classes `4`; local-noise direct children visible `0`; CTA alignment `end`; mobile forced equal height `0`.

## Reticular DoD

A change is accepted only when all five domains remain mutually compatible: chrome does not style local workspaces; landing continuity does not become a second semantic owner; Home does not become a second process owner; Evidence deduplication does not remove the Processes EP-01 secondary entry; catalogue compression does not hide workspace content after navigation. 3.4 remains a final cascade resolver, not a new composition runtime.

## Falsification

`v3/ui-finetuning-3-4-saturation.mjs` runs five deterministic campaigns of 1,000,000 mutations each over eight abstraction levels per task (5,000,000 total). The required result is 100% kill, zero survivors, broad level/family coverage. These are model mutations tied to source-verified UI invariants, not browser sessions or human preference studies.

## Checklist

- [ ] Canonical SVG brand mark mounted inline; PNG mount absent.
- [ ] Header uses the darker three-stop 3.4 gradient and retains readable controls.
- [ ] Footer keeps its three-stop gradient, aligned content and clear links; `Candidate` remains removed.
- [ ] Home, Processi and Evidenze landing headers share the luminous tokenized treatment.
- [ ] Home uses one table-like perimeter and single row separators.
- [ ] Home route CTA keeps label and Lucide-style icon on one row; text arrows are absent.
- [ ] Evidence contains one first-row Reticolo epistemico entry.
- [ ] Process cards are equal on desktop and natural-height on mobile.
- [ ] Existing local owners and routing are unchanged.
- [ ] Static 3.4 contract passes.
- [ ] 5,000,000/5,000,000 model mutations are killed.
- [ ] Current semantic rail and repository CI remain green.
