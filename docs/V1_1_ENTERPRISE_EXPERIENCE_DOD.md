# ICTC 1.1 stable — Enterprise Experience DoD

## Global definition of done

The release is complete only when every mandatory gate is green. Percentages are not averaged: one red mandatory gate means the global DoD is below 100%.

| Gate | Definition of done | Evidence |
|---|---|---|
| G1 Brand identity | ICTC expands to **Integrated Compliance Tower Control** and the supplied project mark is the only primary brand mark. | browser + contract |
| G2 ICTC-wide Home | `Oggi` is a true product hero: orientation, one primary next action, a compact operational pulse and at most three priority rows; it is not a duplicate process catalog. | browser + saturation |
| G3 Information architecture | Exactly three permanent surfaces: `Oggi`, `Processi`, `Evidenze`. | UI contract + browser |
| G4 Process parity | RN, EC, AO, MC, AP, RC and AR appear exactly once as standalone business-process peers; the shared GRC implementation is not exposed as a five-tab pseudo-application. | browser + process contract |
| G5 Evidence audience | `Evidenze` shows business decisions and traceability first. Runtime/deployment posture and exports are advanced disclosure. | browser + contract |
| G6 Dialog geometry | Administration and AI settings have one intentional vertical scroll region, reachable close action and reachable footer actions at desktop and mobile viewport sizes. | browser geometry |
| G7 Procedure flags | Admin can enable/disable every business process independently. Policy is server-authoritative, audited and blocks new writes/routing/work for disabled processes while retaining history/evidence. At least one process remains enabled. | runtime integration |
| G8 Access semantics | Per-process user scope is explicit and tested; different processes are not forced into one visibility model. | procedure-policy contract |
| G9 Genuine saturation | Semantic discovery reaches M, then M+1000 semantically active frozen holdouts add no finding class; every declared mutation is killed. | saturation report |
| G10 Browser experience | Desktop/mobile journeys cover Home, Processi, Evidenze, all seven process entries, Admin, AI settings and feature-flag changes without JS errors or empty visible controls. | Playwright artifacts |
| G11 Runtime regression | Existing persistence, evidence, decision, AI governance, identity, process and reference checks remain green. | CI |
| G12 Release boundary | Product profile is `1.1_stable` / `stable-2` without pretending that npm/runtime lineage or independent production/security/legal assessment changed. | release contract |

## Task DoD

### T1 — Brand and Home
- [ ] Official supplied mark is served as `/assets/ictc-mark.png`.
- [ ] Header says `ICTC` and exposes `Integrated Compliance Tower Control` without consuming excessive mobile width.
- [ ] Hero communicates the scope of the whole product, not only the current admin task.
- [ ] One primary next action only.
- [ ] Compact pulse contains enabled processes, items requiring attention, processes in order and human decisions.
- [ ] Maximum three priority process rows; the seven-card catalog exists only under `Processi`.
- [ ] No technical trace vocabulary on Home level 1.

### T2 — Seven standalone process experiences
- [ ] Exactly seven cards in `Processi` when all flags are enabled.
- [ ] Disabled procedures disappear from operational catalog and intent routing.
- [ ] AO, MC, AP, RC and AR do not render a permanent sibling tab strip.
- [ ] Every process uses its full business label and keeps its specific lifecycle/forms/metrics.
- [ ] Cross-process navigation goes through contextual handoffs or `Torna ai processi`, not a second catalog.

### T3 — Evidenze and progressive disclosure
- [ ] Top navigation label is `Evidenze`.
- [ ] Heading is `Evidenze e tracciabilità`.
- [ ] First disclosure shows human decision count and recent decision records with process, outcome, reason and actor/time where available.
- [ ] Dossier/evidence language is business-oriented and bounded.
- [ ] Runtime posture, deployment blockers, translation mappings and exports are under one advanced disclosure.
- [ ] No automatic claim of evidence sufficiency or compliance.

### T4 — Admin procedure feature flags
- [ ] Server stores seven independent boolean flags.
- [ ] Default is all enabled for backward compatibility.
- [ ] Saving all disabled is rejected.
- [ ] Update emits an auditable store mutation.
- [ ] Disabled process is excluded from Processi, work queue, deterministic routing and automated monitoring scheduler.
- [ ] New write endpoints for disabled processes return `procedure-disabled`.
- [ ] Handoffs cannot silently create work in a disabled target process.
- [ ] Historical records/evidence remain readable.
- [ ] Admin UI shows label, code, scope and status for each process.

### T5 — Modal and interaction geometry
- [ ] Admin and AI settings use grid shell: fixed header, one `minmax(0,1fr)` scroll body, fixed footer where present.
- [ ] No nested document/dialog/body vertical scrollbars in the same modal.
- [ ] Close button remains inside header bounds during scroll.
- [ ] Settings save/cancel remains reachable without a second scrollbar.
- [ ] No empty visible buttons.
- [ ] Monitoring contribution CTA hierarchy does not overlap.

## Sub-task falsifiers

A task is not done if any of these is observed: duplicate process catalogs; five-GRC sibling tabs; disabled process still writable; disabled process suggested by routing; empty Home below a single card; `Prove` as the primary label; deployment posture before business evidence; more than one modal vertical scroller; close button outside shell bounds; an empty visible button; official icon replaced by a generated approximation; all procedures disabled; feature flags implemented only client-side; or a business process silently loses its process-specific lifecycle.

## Claim boundary

The saturation and browser artifacts are E2 evidence. They are suitable for falsifying product invariants and geometry, not for claiming independent human comprehension, production certification, legal compliance or security of a specific deployment.
