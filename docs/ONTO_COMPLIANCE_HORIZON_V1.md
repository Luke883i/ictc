# Onto-Compliance Horizon v1.0 — visual, ontological and epistemic convergence

Status: candidate design/assurance contract. This document is a map and a falsification contract; it does not create business authority.

## Intent

Move ICTC toward an end-user experience in which visual hierarchy, Processi di Compliance and epistemic authority say the same thing. The product should feel restrained and obvious: identity first, one dominant next action, the work itself, then evidence, technical trace and limitation. Visual polish is accepted only when it reduces ambiguity without hiding provenance, human checkpoints or limitations.

## Boundary

This horizon does not claim that arbitrary semantic properties of the whole program are decidable. In the sense relevant to Rice's theorem, we do not attempt to prove global semantic correctness from source or finite runs. We define bounded, computable projections instead: rendered geometry, visible language, route/role behavior, contract-to-CTA mappings, status vocabulary, disclosure order, provenance presentation and mutation sensitivity.

Passing these projections is engineering evidence for the measured horizon, not proof that unknown defect classes do not exist.

## Canonical end-user hierarchy

For every Processo di Compliance the first useful reading order is:

1. **Identity** — process code, label and purpose from the canonical contract.
2. **Action** — exactly one dominant action for the current role and context.
3. **Work** — the native task surface, records and process-specific controls.
4. **Evidence / Trace** — receipts, cross-links, provenance, technical anatomy and product posture.
5. **Limitation** — what the current evidence does not establish.

Consequences:

- exactly one visible `h1` per active surface;
- a legacy hero must not restate the same process identity after the canonical frame;
- technical trace must not sit between process identity and the entry task;
- a secondary cross-process affordance may stay visible but cannot compete with the primary task;
- mobile may change layout, never information authority;
- geometry is allowed to compress; authority is not.

## Visual semantics

### Attention is not a decision

`attentionCount == 0` means only that the current projection exposes no open attention item under that counter. It must not be rendered as `In ordine`, `healthy`, `compliant`, `ok` or another favorable substantive conclusion.

Preferred language:

- `N da vedere` when N > 0;
- `Nessuna attenzione aperta` when N == 0;
- aggregate home language: `processi senza attenzione aperta`, never `processi in ordine`.

### Primary action is role-relative but process-bound

For admin/user, the canonical primary action comes from the process contract. For auditor, read-only does not mean leaving the process: the primary action is `Consulta registrazioni` and moves focus to the native read surface. Postura ICTC remains a separate assurance destination.

### Proposed is visually and epistemically secondary

AI output remains `proposed`, basis-bound and visually distinct from recorded/reviewed/decided material. Visual distinction cannot be the only authority control; runtime status and receipts remain authoritative.

## Process coherence assertions

For each of the seven Processi di Compliance:

- code, label, job/purpose, access and claim boundary originate from the canonical registry/contract;
- the frame primary action is consistent with role and process;
- first-screen content does not contradict the contract's `ux.firstScreen` intent;
- lifecycle words shown to users are labels for actual stored/projection state, not invented summary verdicts;
- human checkpoints are not represented as AI completion;
- terminal-looking language is not shown for non-terminal states;
- evidence access stays available without becoming the dominant work action.

EP-01 remains cross-cutting and is not counted as an eighth Processo di Compliance.

## T-dimensional end-user simulation model

The visual audit explores twelve dimensions. Each observation records the concrete values, not only a case ID.

| T | Dimension | Representative values |
|---|---|---|
| T1 | Role | admin, user, auditor |
| T2 | Process/surface | Oggi, Processi di Compliance, 7 business processes, Postura ICTC, EP-01 |
| T3 | Viewport | 390, 768, 1280, 1600 px classes |
| T4 | Density | empty, sparse, normal, dense/long text |
| T5 | Workflow stage | entry, open work, review, terminal-looking state |
| T6 | Epistemic status | observed, proposed, reviewed/decided, stale |
| T7 | Navigation entry | Oggi, Processi di Compliance, history/back, deep link |
| T8 | Evidence depth | closed, disclosed, download/action available |
| T9 | AI mode | unavailable/off, human-ON proposed output |
| T10 | Input morphology | short, long unbroken token, long prose, mixed identifiers |
| T11 | Interaction mode | pointer, keyboard, reduced motion |
| T12 | Cross-process context | none, source-bound target creation/readback |

Measured anomaly signatures are normalized from observed properties, for example `surface|role|viewport-class|invariant|measured-value-class`. They are not assigned a green outcome in advance.

## M saturation: no genuine novelty

For every T dimension, scenarios are traversed in a deterministic discovery stream and a distinct-seed holdout stream.

- `M_T` is the last discovery index that introduces a new normalized anomaly signature for that dimension.
- the next **100** observations for that dimension must introduce no new signature;
- the holdout must introduce no target-invariant violation hidden from discovery;
- injected faults are evaluated separately and must be detected.

`M+100` is a bounded no-novelty stop condition, not proof that no unknown visual/semantic defect exists. The later Visual Grace / Lexical / Epistemic audit extends this pressure to randomized M+10000 holdouts without replacing this historical rail.

## G saturation: no further safe compression

Compression is treated as removal of responsibility, duplication or visual weight, not minification. Candidate operators include:

- merge duplicate identity blocks;
- demote duplicate primary actions;
- move technical trace after native work entry;
- replace verdict-like summary language with observational language;
- reuse one status-language owner;
- reuse one process-role action resolver;
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
- technical anatomy positioned between canonical process frame and native entry task;
- more than one dominant primary entry action above the first viewport for the same task;
- favorable verdict language derived only from absence of attention;
- auditor primary action leaves the process for global Postura ICTC;
- role-hidden surfaces reachable through normal UI affordance;
- AI proposed content visually indistinguishable from recorded/decided content;
- process code/label mismatch against the registry.

Measured review signals include first-block height, action density above fold, duplicate code occurrences, card width/height dispersion, line-length pressure, unbroken-token containment, disclosure depth and primary/secondary action area ratio.

## Screenshot atlas

The server-backed browser audit produces full-page screenshots for representative desktop/mobile surfaces across roles. Screenshots are evidence of the rendered runtime at one exact commit; automated geometry analysis is not a substitute for independent human usability, aesthetic preference or assistive-technology assessment.

## Slice plan

1. **Observe** — screenshot atlas + geometry/ontology/epistemic report.
2. **Converge hierarchy** — remove duplicate identity/CTA competition and move trace after work entry.
3. **Converge language/role semantics** — attention wording and auditor read behavior.
4. **Normalize spatial grammar** — proportions, widths, density, mobile and long-token containment.
5. **Saturate T** — per-dimension M+100 with distinct holdout and fault sensitivity.
6. **Saturate G** — compression candidates until G+100 with no safe further reduction.
7. **Exact-head closure** — semantic/runtime/browser/security checks observed on one immutable SHA.

## Global Definition of Done

- exactly seven Processi di Compliance remain canonical;
- EP-01 remains cross-cutting;
- all active process surfaces satisfy the canonical hierarchy;
- no attention-derived favorable verdict remains in active presentation code;
- auditor read stays process-bound;
- screenshot atlas and machine geometry report are produced by server-backed browser CI;
- T-dimensional report records M+100 per dimension;
- compression report records G+100 and rejected/degrading operators;
- existing release, runtime and browser suites remain green;
- CodeQL is reported according to actual execution status, never inferred;
- repository governance gaps remain explicit rather than cosmetically hidden.
