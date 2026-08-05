# ICTC Enterprise Convergence Definition of Done

Base commit: `e70a5ac17eecea65758a679e4136ffdde8dc5d9d`.

## Product boundary

This change set can make the ICTC application runtime **enterprise-certifiable**. It cannot certify the deployment by itself. `enterprise-ready` remains blocked until external evidence exists for identity provider, TLS, durable storage, backup restore, malware scanning, observability, dependency review and human accessibility validation.

## Global DoD

A release candidate is converged only when all of the following are true:

1. Every public product claim resolves to a reachable module, route or rendered capability.
2. Every changed executable JavaScript module is syntax checked by `npm run check`.
3. Authorization is evaluated from server-issued capabilities; read permission never authorizes writes.
4. Auditor access is read-only and does not impersonate an administrator for evidence generation.
5. The canonical monitoring model remains `missions`; no parallel `monitoringJobs` source of truth is activated.
6. Semantic metadata is a deterministic projection of canonical records and is explicitly bounded as non-legal classification.
7. Empty metrics remain `null` or zero with a real denominator; no synthetic operational records are introduced.
8. UI labels distinguish object, state, action, producer and consequence.
9. Mobile layouts reflow at 320 CSS px, controls expose at least a 44 px interaction target, and motion respects `prefers-reduced-motion`.
10. A write receipt never obscures the active action area and links to evidence rather than presenting a digest as the primary meaning.
11. README, package version, product contract, runtime health and evidence artifacts describe the same release.
12. Saturation freezes primitives at M and observes no new primitive in an independent M+100 tail.

## Semantic commit slices

### S1 — Define executable assurance

- versioned global DoD;
- machine-readable claim manifest;
- convergence gate included in `npm test`;
- no unsupported claim may be marked implemented.

### S2 — Enforce capability-safe evidence and semantic projection

- capabilities returned by bootstrap;
- auditor reads incidents without obtaining administrator write or evidence authority;
- evidence bundle generation preserves the real actor role;
- `/api/workbench/meta`, `/api/workbench/metrics` and `/api/workbench/graph` are read-only projections over canonical state;
- graph does not emit edges to invisible private records.

### S3 — Compact and clarify the experience

- canonical labels and state language;
- capability-driven visibility;
- corrected auditor identity;
- compact hero, panels and administration rows;
- semantic status colors;
- mobile header, full-screen small dialogs and coarse-pointer targets;
- receipt placement avoids action overlap.

### S4 — Align release evidence

- runtime, package and README version agree;
- claim manifest reports the exact implementation paths and checks;
- saturation artifact records M, M+100 and zero tail novelty;
- CI runs the convergence gate.
