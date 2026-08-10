# Onto-Compliance Horizon v1.0 — visual, ontological and epistemic convergence

Status: candidate design/assurance contract for PR #60. This document is a map and a falsification contract; it does not create business authority.

## Intent

Move ICTC toward an end-user experience in which visual hierarchy, procedure ontology and epistemic authority say the same thing. The product should feel restrained and obvious: identity first, one dominant next action, the work itself, then evidence and technical trace. Visual polish is accepted only when it reduces ambiguity without hiding provenance, human checkpoints or limitations.

## Boundary

This horizon does not claim that arbitrary semantic properties of the whole program are decidable. In the sense relevant to Rice's theorem, we do not attempt to prove global semantic correctness from source or finite runs. We define bounded, computable projections instead: rendered geometry, visible language, route/role behavior, contract-to-CTA mappings, status vocabulary, disclosure order, provenance presentation and mutation sensitivity.

Passing these projections is engineering evidence for the measured horizon, not proof that unknown defect classes do not exist.

## Canonical end-user hierarchy

For every business procedure the first useful reading order is:

1. **Identity** — procedure code, label and purpose from the canonical procedure contract.
2. **Action** — exactly one dominant action for the current role and context.
3. **Work** — the native task surface, records and process-specific controls.
4. **Evidence / trace** — receipts, cross-links, provenance, technical anatomy and product posture.

Consequences:

- exactly one visible `h1` per active surface;
- a legacy hero must not restate the same procedure identity after the canonical frame;
- technical trace must not sit between procedure identity and the entry task;
- a secondary cross-procedure affordance may stay visible but cannot compete with the primary task;
- mobile may change layout, never information authority;
- geometry is allowed to compress; authority is not.

## Visual semantics

### Attention is not a decision

`attentionCount == 0` means only that the current projection exposes no open attention item under that counter. It must not be rendered as `In ordine`, `healthy`, `compliant`, `ok` or another favorable substantive conclusion.

Preferred language:

- `N da vedere` when N > 0;
- `Nessuna attenzione aperta` when N == 0;
- aggregate home language: `procedure senza attenzione aperta`, never `processi in ordine`.

### Primary action is role-relative but procedure-bound

For admin/user, the canonical procedure primary action comes from the procedure contract. For auditor, read-only does not mean leaving the procedure: the primary action is `Consulta record` and must move focus to the native read surface. Product posture remains a separate evidence/assurance destination.

### Proposed is visually and epistemically secondary

AI output remains `proposed`, basis-bound and visually distinct from recorded/reviewed/decided material. Visual distinction cannot be the only authority control; runtime status and receipts remain authoritative.

## Procedure coherence assertions

For each of the seven business procedures:

- code, label, job/purpose, access and claim boundary originate from the canonical procedure registry/contract;
- the frame primary action is consistent with role and procedure;
- first-screen content does not contradict the contract's `ux.firstScreen` intent;
- lifecycle words shown to users are labels for actual stored/projection state, not invented summary verdicts;
- human checkpoints are not represented as AI completion;
- terminal-looking language is not shown for non-terminal states;
- evidence access stays available without becoming the dominant work action.

EP-01 remains cross-cutting and is not counted as an eighth business procedure.

## T-dimensional end-user simulation model

The visual audit explores twelve dimensions. Each observation records the concrete values, not only a case ID.

| T | Dimension | Representative values |
|---|---|---|
| T1 | Role | admin, user, auditor |
| T2 | Procedure/surface | Home, Processi, 7 business procedures, Postura, EP-01 |
| T3 | Viewport | 390, 768, 1280, 1600 px classes |
| T4 | Density | empty, sparse, normal, dense/long text |
| T5 | Workflow stage | entry, open work, review, terminal-looking state |
| T6 | Epistemic status | observed, proposed, reviewed/decided, stale |
| T7 | Navigation entry | Home, Processi, history/back, deep link |
| T8 | Evidence depth | closed, disclosed, download/action available |
| T9 | AI mode | unavailable/off, human-ON proposed output |
| T10 | Input morphology | short, long unbroken token, long prose, mixed identifiers |
| T11 | Interaction mode | pointer, keyboard, reduced motion |
| T12 | Cross-procedure context | none, source-bound target creation/readback |

Measured anomaly signatures are normalized from observed properties, for example:

`surface|role|viewport-class|invariant|measured-value-class`

They are not assigned a green outcome in advance.

## M saturation: no genuine novelty

For every T dimension, scenarios are traversed in a deterministic discovery stream and a distinct-seed holdout stream.

- `M_T` is the last discovery index that introduces a new normalized anomaly signature for that dimension.
- the next **100** observations for that dimension must introduce no new signature;
- the holdout must introduce no target-invariant violation hidden from discovery;
- injected faults are evaluated separately and must be detected.

`M+100` is a bounded no-novelty stop condition, not proof that no unknown visual/semantic defect exists.

## G saturation: no further safe compression

Compression is treated as removal of responsibility, duplication or visual weight, not minification. Candidate operators include:

- merge duplicate identity blocks;
- demote duplicate primary actions;
- move technical trace after native work entry;
- replace verdict-like summary language with observational language;
- reuse one status-language owner;
- reuse one procedure-role action resolver;
- remove a wrapper/layout rule when geometry and accessibility invariants survive;
- collapse duplicate test assertions into one source-bound helper.

A compression candidate is accepted only if all protected invariants remain true and required user information remains reachable with no extra authority ambiguity.

- `G` is the last accepted compression in the deterministic candidate stream;
- the next **100** candidates must yield no additional safe compression;
- rejected candidates must record the invariant they degrade.

This makes `G+100` a bounded minimality signal rather than a claim of mathematically minimal UI.

## Visual audit invariants

Hard failures:

- document horizontal overflow at tested viewport;
- visible control target below 44 px in the active task path;
- more than one visible `h1` on an active surface;
- technical anatomy positioned between canonical procedure frame and native entry task;
- more than one dominant primary entry action above the first viewport for the same task;
- favorable verdict language derived only from absence of attention;
- auditor procedure primary action leaves the procedure for global Postura;
- role-hidden surfaces reachable through normal UI affordance;
- AI proposed content visually indistinguishable from recorded/decided content;
- procedure code/label mismatch against the registry.

Measured review signals (reported even when not hard failures):

- first-block height as fraction of viewport;
- action density above fold;
- duplicate procedure-code occurrences above fold;
- card width/height dispersion in the procedure hub;
- line-length pressure and unbroken-token containment;
- number of disclosure layers before native work;
- primary/secondary action area ratio.

## Screenshot atlas

The server-backed browser audit produces full-page screenshots for the representative admin desktop/mobile surfaces and role-specific auditor/user views. Screenshots are evidence of the rendered runtime at one exact commit; automated geometry analysis is not a substitute for independent human usability or assistive-technology assessment.

## Slice plan

1. **Observe** — add screenshot atlas + geometry/ontology/epistemic report without changing UI.
2. **Converge hierarchy** — remove duplicate identity/CTA competition and move trace after work entry.
3. **Converge language/role semantics** — attention wording and auditor read behavior.
4. **Normalize spatial grammar** — proportions, widths, density, mobile and long-token containment.
5. **Saturate T** — per-dimension M+100 with distinct holdout and fault sensitivity.
6. **Saturate G** — compression candidates until G+100 with no safe further reduction.
7. **Exact-head closure** — semantic/runtime/browser/security checks observed on one immutable SHA.

## Global Definition of Done

- exactly seven business procedures remain canonical;
- EP-01 remains cross-cutting;
- all active procedure surfaces satisfy the canonical hierarchy;
- no attention-derived favorable verdict remains in active presentation code;
- auditor read stays procedure-bound;
- screenshot atlas and machine geometry report are produced by server-backed browser CI;
- T-dimensional report records M+100 per dimension;
- compression report records G+100 and rejected/degrading operators;
- existing release, runtime and browser suites remain green;
- CodeQL is reported according to actual execution status, never inferred;
- repository governance gaps remain explicit rather than cosmetically hidden.
