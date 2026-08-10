# ICTC 1.9 — Experience Convergence

Baseline: `main@3357d345e7e16c5b849e593243a5251e6a0eac04`.

## Intent

Move ICTC from layered market-candidate polish to one compact, navigable end-user grammar without changing business authority. Reuse the current seven-procedure registry, projections, actions, evidence and standards semantics. Navigation and presentation must never become a write authority.

## UX authority cutover

The visible end-user procedure grammar is one `ProcedureFrame` primitive, projection/registry-derived and reused by all seven procedures and by the procedure hub. It owns:

- procedure code + plain-language name;
- `Scopo della procedura`;
- operational state;
- number of items requiring attention and, where meaningful, total items;
- exactly one primary entry action;
- contextual back/breadcrumb action.

Procedure bodies remain process-specific. Hidden migration markup may exist during the cutover, but it must not remain a second visible semantic renderer.

## Navigation contract

`surface-router` owns in-app location state. User navigation creates browser history entries; bootstrap/normalization may replace the current entry. Back/Forward restores the authorized UI location without business writes. Location is serializable as surface + optional procedure context and remains compatible with the existing static server shell.

`Vai a…` is the single global navigation/search surface. It reuses authorized bootstrap projections and the procedure registry; it is not a truth index. Keyboard access: `Ctrl+K` / `Meta+K`; Escape closes; arrow keys move; Enter activates.

## Plain-language contract

Top-level navigation is `Home / Processi / Evidenze`. End-user copy prefers the shortest label that preserves semantic precision. Technical IDs, hashes, projection mechanics and claim boundaries remain available by progressive disclosure instead of occupying the first visual layer.

No label may imply legal validity, certification, substantive sufficiency, compliance or maturity merely from catalog presence, mapping, evidence or integrity.

## Density / composition contract

The first viewport must answer, in order: where am I, what is this procedure for, what state is it in, what needs attention, what can I do now. There is one visual primary CTA per top-level procedure surface. Secondary/export/evidence actions remain visually subordinate.

Target tokens are shared: page width, compact section rhythm, control height, card padding, border/elevation, focus ring, and motion. Motion is optional enhancement, 100–180 ms for most UI transitions, and fully disabled by `prefers-reduced-motion`.

## Visual audit defect taxonomy

Normalized classes used for saturation:

1. duplicate semantic renderer;
2. duplicate/competing primary CTA;
3. contextual-back mismatch;
4. no browser Back/Forward location restoration;
5. deep-link context loss;
6. inconsistent procedure header anatomy;
7. excessive first-fold vertical cost;
8. oversized or sticky side panel dominating work;
9. blank/unnamed interactive control;
10. technical copy leaking into first layer;
11. ambiguous process/standard state wording;
12. standard catalog/use/applicability conflation;
13. inconsistent state/count representation;
14. action hierarchy drift across procedures;
15. excessive card/action density;
16. missing keyboard navigation/search;
17. motion without reduced-motion boundary;
18. mobile clipping/overflow;
19. dialog with more than one vertical scroll owner;
20. evidence/proof surface visually claiming more than its boundary.

## Pareto stop rule

Compress iteratively while a change improves scan time, first-fold utility, action clarity or cross-view consistency without causing any of: text clipping, ambiguous authority, reduced evidence discoverability, inaccessible hit targets/focus, mobile overflow, or loss of procedure-specific lifecycle information.

Stop after at least M+100 deterministic model probes produce no new normalized defect class and the next density step would violate one of those constraints. Model trigger frequency is design pressure, not empirical bug probability.

## Global DoD

- 7/7 procedures expose the same visible `ProcedureFrame` anatomy.
- 7/7 procedure workspaces expose exactly one top-level primary CTA.
- `Home` replaces runtime `Oggi` in the canonical shell.
- Browser Back/Forward round-trips surface and procedure context without writes.
- `Vai a…` reaches Home, Processi, Evidenze and all seven procedures by keyboard.
- 100% visible controls in tested critical surfaces have an accessible name.
- 0 known blank interactive controls.
- 0 duplicate visible procedure header owners.
- 0 cross-view semantic use of a synthetic compliance/maturity score.
- standards remain browsable independently of organization scope; use/applicability/coverage remain separate.
- AI remains visibly assist-only and non-authoritative.
- reduced motion removes non-essential transitions/animations.
- responsive audit passes representative desktop/tablet/mobile viewports without horizontal overflow.
- 10,000 deterministic differentiated UX/navigation model scenarios execute; saturation boundary is recorded.
- existing semantic/runtime/browser/security gates remain green on the exact PR head.

## Reticular DoD

For every procedure location, visible frame → canonical procedure registry → authorized operational projection → primary action → resulting receipt/evidence path stays reconstructable. Navigation creates no EpistemicStep because it is transient interaction state; submitted business actions continue through the existing write kernel and epistemic/audit contracts.

## Local DoD

### Home
Compact orientation, one next action, no duplicate dashboard layer, Home label canonical.

### Processi
Seven registry-derived entries, consistent state/count/scopo/CTA grammar, no hidden knowability assumptions.

### RN-01
Primary action is adding material; monitoring creation remains available but subordinate. No competing sticky contribution CTA.

### EC-01
Primary action is registering an event; incident cards never expose blank actions.

### AO-01 / MC-01 / AP-01 / RC-01 / AR-01
Shared procedure frame; process-specific KPI/body retained; primary create/intake action is singular and subordinate forms use progressive disclosure.

### MC-01 standards
Catalog availability is not organization use; every indexed node remains directly searchable/browsable. `Da valutare` is not used as catalog-availability status.

### Evidenze
Business evidence first; technical posture/export remains progressive disclosure; integrity does not imply compliance or sufficiency.

## Non-goals

No framework rewrite, design-system dependency, graph database, generic workflow engine, AI-first navigation, synthetic compliance score, autonomous remediation, or legal/certification claims.
