# ICTC User Journey 2.0 — Definition of Done

## Intent

Transform the merged enterprise runtime into a calm, role-aware product experience. The application must open on one compact home, explain what the current actor can do, expose one primary next action, and keep monitoring and event handling as two clear operational paths.

This DoD certifies the repository implementation and its runtime evidence. It does not certify a production deployment or replace external security, accessibility, legal, identity, backup, observability, or operational evidence.

## Global DoD

The iteration is complete only when all conditions below are true.

### One coherent entry point

- `/` opens on `home`, not directly inside an operational form.
- Home identifies the current role and explains its responsibility in plain language.
- Home presents exactly one primary contextual action.
- Monitoring and Events remain reachable as two distinct operational paths.
- The current state and next step are visible without opening a dialog.

### Role clarity

- Administrator: configures, approves, activates, pauses, verifies, and governs.
- User: contributes source material and records events without administrative controls.
- Auditor: reads, traces, and downloads evidence without write affordances.
- Capabilities remain server-issued; UI text never grants authority.

### Horizontal guided journey

- Every role receives a four-step horizontal journey.
- Each step uses a verb, a short outcome, and no implementation jargon.
- On narrow screens the journey remains ordered and horizontally scrollable.
- The first viewport contains role, purpose, primary action, journey, and current state.

### AI-assisted, human-controlled behavior

- AI readiness is explained contextually.
- AI is described as proposing, extracting, or assisting; never deciding or certifying.
- The next action can use runtime state and AI readiness, but remains deterministic and inspectable.
- Human confirmation remains explicit before activation, source verification, submission, or closure.

### Vocabulary

- Use standard nouns: Home, Monitoraggio, Eventi, Fonti, Evidenze, Configurazione AI, Amministrazione.
- Use action verbs: Crea, Registra, Verifica, Approva, Scarica, Sospendi, Riprendi.
- Remove internal or promotional labels from the primary experience.
- State labels describe state, not instructions.
- One concept has one preferred label across navigation, cards, dialogs, tests, and evidence.

### Density and interaction

- Desktop top bar is at most 60 px high.
- Operational heroes are compact and do not consume the first viewport.
- Primary layout spacing follows a 4/8/12/16/24/32 px scale.
- Cards use restrained borders and shadows; decorative motion is not required for comprehension.
- Touch targets remain at least 44 px and 48 px for coarse pointers.
- Reduced-motion behavior remains supported.

### Assurance

- A static contract check verifies home, role guidance, vocabulary, density hooks, and two operational services.
- Browser evidence covers contextual home CTA, horizontal journey, monitoring, user contribution, event handling, administration, and auditor least privilege.
- Saturation enumerates concrete behavioral scenarios from 1 to M and freezes the primitive set at M.
- The next 100 scenarios introduce zero new primitives.
- CI publishes contract, runtime, and browser artifacts for the exact commit.

## Model-bounded saturation

The saturation model spans:

- roles: administrator, user, auditor;
- routes: home, monitoring, events;
- AI: ready, missing, degraded;
- workload: empty, monitoring, events, mixed;
- urgency: none, review, action;
- viewport: desktop, mobile;
- access: pointer, keyboard.

The model includes singleton, selected pairwise, role-specific, and full-state behavioral primitives. Zero novelty in the M+100 tail proves saturation only inside this declared model.

## Exit certificate

A pull request may claim `user-journey-2-runtime-certified` only when:

1. all repository checks are green;
2. all three browser actor journeys produce evidence;
3. the M+100 artifact records zero novelty;
4. no unresolved blocker contradicts this DoD;
5. the PR description preserves the boundary between repository certification and deployment certification.
