# Runtime hardening and grace audit — post PR #67

Baseline: `main@933c1df9963a7e903f9fb55523f2241bd30c3139` (merge of PR #67).

## Audit posture

This audit treats the current server-backed browser and semantic suites as the functional baseline, then searches for missing product properties rather than reopening already-solved architecture. The seven canonical procedures remain owned by their existing contracts; this work must not create another procedure registry, another risk source, or another process experience.

The review uses the existing ICTC Surface Standard 1 vocabulary: one scroll owner, progressive disclosure, one primary action, 44px targets, 320/390 reflow, 200% zoom, bounded claims, human authority and evidence/provenance preservation.

## Procedure execution baseline

The current main browser journeys are green and the seven-procedure kernel traverses RN-01, EC-01, AO-01, MC-01, AP-01, RC-01 and AR-01. No procedure-state or cross-procedure authority defect is reopened by this audit.

## Findings

### F1 — Standard application detail has no local visual contract

PR #67 introduced `.procedure-anatomy-standards`, but `procedure-anatomy.css` contains no rules for that surface. Browser tests prove that text exists, not that the new content is progressively disclosed, compact, reflow-safe or horizontally composed when space permits.

Risk: a semantically correct improvement can become a dense default-list block, vary with inherited CSS and regress local grace without failing CI.

### F2 — Runtime projects practice, UI omits it

`processLandscapeProjection()` resolves each benchmark to `name`, `alignment`, `methodSteps`, `practice`, `evidence` and `limit`. The current `benchmarkMarkup()` renders name, method steps, evidence and limit, but drops `practice` and `alignment`.

Risk: the user can see where a standard is referenced but not the minimum complete answer to “how does ICTC apply it?”. This weakens the onto-epistemic chain between declared benchmark, implemented practice, retained evidence and claim boundary.

### F3 — Standard detail is overexposed inside the first disclosure

Opening “Contesto e tracciabilità” currently expands every benchmark’s method steps, evidence and limitation at once. The information is valid but not progressively ordered.

Risk: the first useful context layer becomes a wall of secondary detail. The fix should preserve a compact benchmark summary and reveal practice/evidence/limit only on demand.

### F4 — New procedure context is not represented in Surface Standard saturation

The Surface Standard model covers 22 declared surfaces, but the new standard-application sub-surface is not represented as a distinct covered surface/component. The seven-procedure browser checks content, while the UI-standard saturation does not yet model its novelty/contradiction/standards frontier.

Risk: future refactors can remove progressive disclosure or practice text while existing M/N/Z saturation still reports convergence.

### F5 — Administration vertical containment is not directly proven

Administration now has stable row ownership, one direct panel, 44px navigation targets and pointer-operable tabs. The remaining gap is vertical: the browser standard checks horizontal overflow but does not assert that a low viewport keeps the dialog inside the viewport, keeps header/navigation outside the scrolling region, makes `.admin-grid` the scroll owner, and permits reaching the last active control.

Risk: legacy `min-height` and later terminal overrides can regress into an unreadable or partially unreachable admin surface without violating the current oracle.

### F6 — Admin containment depends on implicit sizing

The terminal refinement gives the shell `grid-template-rows:auto auto minmax(0,1fr)` and the grid `min-height:0`, but it does not give the shell an explicit `height:100%` / `overflow:hidden` containment contract nor reserve scrollbar space for the body.

Risk: intrinsic content sizing or a later CSS layer can reintroduce a second scroll owner or geometry competition.

### F7 — Horizontal-first composition is not guaranteed for standard atoms

Navigation tabs already use one-line labels where possible. The new benchmark application has no equivalent contract for benchmark name, short status/meta and disclosure affordance.

Risk: simple atoms wrap vertically even when sufficient width exists, increasing visual noise.

## Minimal reticular fix strategy

1. Keep canonical procedure and risk owners unchanged.
2. Turn each standard application into a native nested `details/summary`: compact summary first; practice, mapped method steps, evidence and limit inside the drill-down.
3. Add a local CSS contract for horizontal-first desktop summaries, safe mobile reflow, 44px targets and at most one additional visible border level.
4. Make the admin dialog/shell height ownership explicit and the grid the sole vertical task scroller.
5. Extend the existing seven-procedure and Surface Standard browser oracles rather than adding a parallel test architecture.
6. Add the new surface/component/invariants to the existing M+100 / N+100 / Z+100 saturation model and ratchet its exact counts.

## Claim boundary

This audit is correlated engineering evidence produced inside the same development circuit. It does not establish WCAG conformance, legal compliance, certification, representative-user comprehension, production security or independent assurance.
