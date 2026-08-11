# ICTC Enterprise 2 — runtime convergence of Surface Standard 1

This note is the **authoritative convergence delta** for `ictc-surface-standard-1`. It supersedes the provisional M/N/Z counters in `ENTERPRISE_2_UI_STANDARD.md` for the current PR head while preserving that document as the base design rationale.

## Why the model changed

The deterministic fixture reached a provisional bounded convergence, but real server-backed journeys continued to expose classes that did not exist in the fixture model. Treating those failures or coverage gaps as noise would violate the saturation method, so each material runtime finding is appended before recomputing the tails.

The post-#67 hardening slice adds three classes: one **direct server-backed falsification** (the seven-procedure oracle expected progressive benchmark rows on RN-01 and found none), one information-completeness gap proven by the runtime/UI projection mismatch, and one Administration vertical-containment property that the previous browser contract did not directly prove.

| Runtime finding | Observed failure / gap | Runtime resolution | Standard witness |
|---|---|---|---|
| Authority layering | `renderIdentity()` exposed `Configura AI` for admin, then a legacy presentation layer hid it | server-issued `actor.role` is the final visibility source | ICTC-L11 |
| Mobile action-bar cascade | settings footer reached 161.375 px at 320 px | terminal 2-column 44 px action bar, budget <=72 px | ICTC-L12 |
| Delayed admin ownership | after the bounded legacy pass, 0 direct admin panels remained visible | terminal owner reconciliation after the delayed pass; stable-state browser assertion | ICTC-L13 |
| Text zoom reflow | 200% text enlargement produced +29 px, then +2 px residual overflow | intrinsic rem grid plus bounded topbar/select sizing; no font reduction and no overflow masking | ICTC-L14 |
| Post-decision source rerender | after `Accetta nel catalogo`, refresh was normalized before `renderSourceDialog()` rebuilt base `Verificata` / `Stato umano` copy | direct source-dialog reconstruction emits `ictc:surface-changed` after the DOM mutation so terminal layers reconcile the stable dialog | ICTC-L15 |
| Admin navigation target budget | at 390 px the active administration tab measured about 137 x 38 CSS px | terminal Surface Standard enforces the existing 44 px control budget on every administration navigation button; authoritative browser measures the stable target | WCAG-2.5.8 / `controlMinPx=44` |
| Admin navigation hit-testing | after stable `EV-01 · Controlli`, `GA-01 · Governo AI` was visible and enabled but header/body descendants intercepted its real pointer click | the admin shell owns explicit header/navigation/body rows and the scroll body has `min-height:0`; authoritative browser verifies `elementFromPoint()` ownership before the real click | ICTC-L16 |
| Procedure standard progressive disclosure | post-#67 seven-procedure oracle expected two progressive benchmark application rows on RN-01 and found none because benchmark details were one always-expanded list | every benchmark application is a native closed `details/summary` row with a compact summary and bounded detail | ICTC-L17 |
| Procedure standard information completeness | runtime projected `practice` and `alignment`, but the user projection omitted the practice while showing lower-level method/evidence/limit detail | expanded benchmark detail now presents declared ICTC practice first, then mapped method steps, evidence and limitation | ICTC-L17 |
| Administration vertical containment | prior browser evidence proved horizontal reflow, target size, isolation and hit-testing but did not prove low-viewport single-scroll ownership; terminal sizing still relied on implicit shell height | Admin dialog is explicitly viewport-bounded, shell fills/clips it, `.admin-grid` is the sole task scroller with stable gutter, and a 390 x 568 browser journey reaches the final active control | ICTC-L18 |

## Effective standard model

The effective standard is compiled from:

- `enterprise-2-ui-standard-model.json` — immutable historical base standard;
- `enterprise-2-ui-standard-runtime-findings.json` — append-only findings and post-#67 hardening knowledge discovered against the complete runtime cascade.

The effective model now spans **23 declared UI surfaces**, including the procedure-context sub-surface, and adds `procedure-standard-application` as a governed component. Historical convergence is not rewritten after falsification; new knowledge is appended and the same saturation gate is recomputed.

## Final triple convergence

- **Novelty:** `M = 115`, confirmation through `M + 100 = 215`, novelty after M = **0**.
- **Contradictions:** `N = 60`, confirmation through `N + 100 = 160`, contradictions after N = **0**.
- **Standards:** `Z = 34`, confirmation through `Z + 100 = 134`, uncovered obligations at/after Z = **0**.

Relative to the previous `109/57/32` frontier, the post-#67 slice is `delta M/N/Z = +6/+3/+2`. The six novelty primitives are one new declared surface, one governed component, one lexical completeness rule and three layout rules. The three contradiction primitives cover overexposed standard detail, omitted practice and implicit Admin scroll ownership. ICTC-L17 and ICTC-L18 add explicit standard witnesses for procedure context and Administration containment.

## Runtime DoD added by server-backed evidence

1. server-issued actor authority remains the final source for administration-action visibility;
2. the progressive-dialog action bar remains <=72 px at 320 px after the complete CSS cascade;
3. administration ownership remains exactly one direct panel after the bounded delayed Enterprise 2 reconciliation pass;
4. global navigation, role controls, runtime status and brand reflow at 200% text enlargement without reducing text size or hiding information;
5. a direct post-decision source-dialog rerender emits the semantic surface-change event and retains canonical terminal vocabulary in the stable DOM;
6. administration section navigation preserves the declared >=44 px target on the 390 px mobile surface after the full cascade;
7. the administration shell exposes a dedicated navigation row whose button center remains the top hit target after a stable section transition, and the next section is reached with a real non-forced pointer click;
8. every canonical procedure exposes benchmark applications as progressive benchmark details, default closed, with the declared ICTC practice, mapped native method steps, evidence and limitation available on demand;
9. benchmark summaries are horizontal-first when room exists and reflow without horizontal overflow on the 390 px procedure context;
10. Administration remains contained within a low viewport, header/navigation do not become task scrollers, `.admin-grid` owns vertical scrolling, and the last active control remains reachable;
11. Surface Standard assurance, seven-procedure browser journey, historical product journeys and general CI execute on the same PR head before this convergence is treated as demonstrated.

## Falsification history

The post-#67 audit deliberately committed the stronger browser oracle before the runtime fix. On `bd8257f7e88fce8b2fa4165b1efbe396b2370a87`, the server-backed convergent-kernel journey failed at `common-anatomy:RN-01` because the locator expected two `.procedure-standard-application` rows and found none. The oracle was not weakened: the runtime projection was refactored into native nested disclosure and the missing practice was surfaced.

Administration vertical containment is recorded differently: it was a **hardening/coverage gap**, not a measured baseline failure, because the RN-01 falsification stopped the browser journey before the new low-viewport assertion was reached. The mature candidate must therefore prove the property on its exact head without retroactively claiming that the baseline had failed it.

## Standards boundary

The standard continues to use WCAG 2.2, WAI-ARIA APG, HTML Living Standard, GOV.UK Design System and ICTC internal invariants as design/test references. The evidence demonstrates implementation of the declared project standard; it does **not** claim certified WCAG conformance, legal compliance, certification, representative-user validation, independent assurance or production readiness.
