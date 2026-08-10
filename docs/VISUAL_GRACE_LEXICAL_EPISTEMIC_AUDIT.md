# Visual Grace, Lexical Immediacy & Epistemic Convergence Audit

Status: **runtime candidate contract**. This document is a testable design/assurance map, not a compliance conclusion.

## Objective

Converge the visible ICTC experience around three user-observable properties without changing legal or decision authority:

1. **Visual grace** — calm hierarchy, proportion, rhythm, density and salience that make the next action obvious without decorative noise.
2. **Lexical immediacy** — one business term for one business concept, short labels, explicit effects and no hidden authority in wording.
3. **Epistemic convergence** — every one of the seven business processes exposes the same readable chain: identity → action → work → evidence/trace → limitation.

## Canonical user language

- Business domain: **Processi di Compliance**.
- Singular: **Processo di Compliance**.
- Assurance surface: **Postura ICTC**.
- `evidenza` remains a proof object; it is not the name of the assurance surface.
- Internal compatibility identifiers (`procedureRegistry`, route ids, API fields, file names, RN/EC/AO/MC/AP/RC/AR codes) remain unchanged unless a versioned migration explicitly replaces them.
- EP-01 remains cross-cutting and is not an eighth Process of Compliance.

## Visual contract

A process workspace SHOULD read, in this order:

**Identity → Action → Work → Evidence / Trace → Limitation**

Protected invariants:

- exactly one visible process H1;
- exactly one dominant entry action in the initial decision context;
- primary copy max line length is bounded for scanning;
- cards in the same semantic tier use aligned padding, radius and vertical rhythm;
- interactive controls remain at least 44 CSS px;
- mobile/tablet reflow does not rely on document-level overflow clipping;
- neutral observations never use success styling or favorable verdict language;
- proposed AI content remains visually secondary to recorded human/business state;
- beauty never hides actor, state, provenance, evidence or limitation.

## Lexical contract

A visible label MUST name either the object, the action, or the effect. Avoid labels that require product history to decode.

Required convergence:

- `Procedure`, `Procedura`, `Scopo della procedura`, `Segnali della procedura` are retired from the active business UI in favor of **Processi di Compliance**, **Processo di Compliance**, **Scopo del processo**, **Segnali del processo**.
- top navigation and page title use the same canonical domain name;
- assurance navigation, title and cross-process calls-to-action all use **Postura ICTC**;
- technical terms such as receipt, digest, runtime and benchmark appear only at the detail layer and carry a plain-language explanation where needed.

## Postura ICTC: how proof is shown

Postura ICTC MUST make its proof method visible rather than merely asserting posture. The server remains authoritative for the proof projection.

For every posture promise, expose:

1. **Practice** — what ICTC actually does.
2. **Evidence** — static contracts, runtime/browser journeys, receipts/integrity, commit-bound artifacts, or external deployment attestations.
3. **Limit** — what that evidence does not establish.

Declared benchmark mappings (for example WCAG 2.2, WAI-ARIA APG, ISO 9241-210, ISO 37301, NIST CSF 2.0, NIST SSDF and EU AI Act) remain practice/evidence mappings only. No mapping is rendered as certification, legal applicability, conformity percentage or organizational assessment.

## Seven-process epistemic convergence

The seven canonical processes remain:

- RN-01 Monitoraggio normativo
- EC-01 Eventi e segnalazioni
- AO-01 Inventario
- MC-01 Controlli/copertura
- AP-01 Azioni correttive
- RC-01 Rischi compliance
- AR-01 Questionari/verifiche

For each process, browser assurance must verify:

- canonical code + label;
- human-readable purpose and primary action;
- native work appears before technical trace;
- claim boundary is visible in the trace layer;
- role behavior remains process-bound;
- the same revision/projection authority feeds process, Processi di Compliance hub and EP-01 where authorized;
- no UI label upgrades observed/proposed state into a legal or compliance conclusion.

## Saturation model

The audit explores a finite declared scenario space. It does **not** claim to decide non-trivial semantic properties of arbitrary programs.

Randomized dimensions include role, process, viewport, density, workflow stage, epistemic status, navigation entry, evidence depth, AI mode, input morphology, interaction mode, cross-process context, copy length, control density, stale/fresh projection and assurance depth.

For each audit family:

- discovery runs from `1..M`, where `M` is the last index introducing a genuinely new normalized anomaly signature;
- a distinct-seed **M+10000** holdout must produce zero new signatures and zero target invariant violations;
- injected fault mutants are sampled independently from target scenarios so the harness must demonstrate sensitivity rather than assign outcomes from scenario labels.

The output must record seeds, dimensions, M, signature counts, holdout size, mutant kills and the claim boundary.

## Definition of Done

- active user UI consistently says **Processi di Compliance** / **Processo di Compliance**;
- active assurance UI consistently says **Postura ICTC**;
- Postura ICTC visibly explains how claims are demonstrated and where proof stops;
- visual browser audit covers admin/user/auditor across mobile/tablet/desktop/wide and all seven processes;
- lexical/browser/static gates reject reintroduction of ambiguous active labels;
- source-bound randomized saturation reaches M+10000 without novelty in the declared model;
- current semantic, runtime and browser suites pass on the exact PR head;
- conditional/skipped checks remain reported separately from executed success.
