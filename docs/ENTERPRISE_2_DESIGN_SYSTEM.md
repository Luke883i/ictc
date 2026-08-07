# ICTC Enterprise 2 — Aurora design system

## Scope

`ictc-aurora-1` is the terminal visual and transition layer for the Enterprise 2 candidate. It is installed after the process and editorial layers. It changes presentation, visual hierarchy and bounded transition behaviour only. It does not add permissions, endpoints, record states or claims.

## Visual direction

The system is intentionally sober: neutral operational surfaces, one semantic accent per service, restrained elevation and high information contrast. Decorative gradients and grid texture remain removable without losing state or meaning.

| Surface | Accent | Purpose |
|---|---|---|
| Panoramica | indigo | orientation and cross-process continuity |
| Monitoraggio normativo | cyan | research, sources and recurring execution |
| Eventi e segnalazioni | amber | attention and human checkpoints |
| Evidenze e controlli | violet | technical evidence and limitations |
| Amministrazione | active surface accent | control-plane continuity |

## Terminal token families

- semantic colour: ink, canvas, surface, line, accent and status tones;
- typography: system sans and system mono without bundled font files;
- spacing: compact operational rhythm inherited from the editorial layer;
- radius: 8, 12, 16 and 22 CSS pixels by layer depth;
- elevation: two restrained shadow levels;
- motion: 140, 220 and 320 millisecond bands;
- focus: visible three-pixel accent halo;
- responsive density: 1440, 900, 760, 480, 420 and 320 pixel behaviour.

## Interaction hierarchy

Every rendered action receives one of three visual priorities:

1. `primary`: the single context-defining action;
2. `secondary`: an alternative action with a visible boundary;
3. `quiet`: method, evidence or low-frequency navigation.

The priority is visual only. It does not create or infer authority.

## Transition contract

- surface changes use a 260 ms opacity, translation and blur recovery;
- open disclosures use a 180 ms content reveal;
- open dialogs use a 220 ms bounded entrance;
- card entry uses at most eight stagger positions at 22 ms intervals;
- transitions do not change focus, hidden state, order or accessible names;
- `prefers-reduced-motion: reduce` collapses all decorative duration to effectively zero;
- forced colours remove decorative backgrounds and retain text, borders and focus.

## Status contract

Status text remains canonical. Colour is redundant:

- positive: accepted, active, complete or coherent;
- attention: to evaluate, to approve or to complete;
- critical: excluded, failed or blocked;
- neutral: paused, manual, read-only or undetermined;
- informative: all other states.

No colour token changes the underlying state label.

## Visual audit coverage

The deterministic browser fixture renders the current PR composition with the runtime editorial and design-system modules. It covers:

- desktop 1440 × 1000;
- mobile 390 × 844 and 320 × 568;
- zoom 200%;
- light and dark colour schemes;
- forced colours;
- normal and reduced motion;
- home, monitoring, events and proof surfaces;
- disclosure animation, button priority, status tone and accessible labels.

The fixture is a deterministic rendering proof, not a substitute for the complete server-backed browser journey. The repository browser journey remains the authoritative end-to-end gate when GitHub Actions executes.

## Saturation rule

The design-system saturation enumerates risk primitives from scenario 1 through `M`. `M` is the last scenario that introduces a new primitive. Scenarios `M+1` through `M+100` are deterministic cross-dimensional perturbations. Saturation is accepted only when both novelty and new contradictions are zero throughout that 100-scenario tail.

This is bounded convergence against the declared model. It does not prove the absence of future defects, browser changes or deployment-specific interactions.

## Claim boundary

The layer demonstrates implemented visual-system and transition safeguards in the candidate UI. It does not establish WCAG conformance, legal compliance, certification, production readiness or representative-user validation.
