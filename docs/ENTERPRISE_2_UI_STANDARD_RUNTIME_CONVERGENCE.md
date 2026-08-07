# ICTC Enterprise 2 — runtime convergence of Surface Standard 1

This note is the **authoritative convergence delta** for `ictc-surface-standard-1`. It supersedes the provisional M/N/Z counters in `ENTERPRISE_2_UI_STANDARD.md` for the current PR head while preserving that document as the base design rationale.

## Why the model changed

The deterministic fixture reached a provisional bounded convergence, but the real server-backed journeys exposed five classes that did not exist in the fixture model. Treating those failures as noise would violate the saturation method, so each real finding was incorporated as a new primitive/witness before recomputing the tails.

| Server-backed finding | Observed failure | Runtime resolution | Standard witness |
|---|---|---|---|
| Authority layering | `renderIdentity()` exposed `Configura AI` for admin, then a legacy presentation layer hid it | server-issued `actor.role` is the final visibility source | ICTC-L11 |
| Mobile action-bar cascade | settings footer reached 161.375 px at 320 px | terminal 2-column 44 px action bar, budget <=72 px | ICTC-L12 |
| Delayed admin ownership | after the bounded legacy pass, 0 direct admin panels remained visible | terminal owner reconciliation after the delayed pass; stable-state browser assertion | ICTC-L13 |
| Text zoom reflow | 200% text enlargement produced +29 px, then +2 px residual overflow | intrinsic rem grid plus bounded topbar/select sizing; no font reduction and no overflow masking | ICTC-L14 |
| Post-decision source rerender | after `Accetta nel catalogo`, refresh was normalized before `renderSourceDialog()` rebuilt base `Verificata` / `Stato umano` copy | direct source-dialog reconstruction emits `ictc:surface-changed` after the DOM mutation so terminal layers reconcile the stable dialog | ICTC-L15 |

## Effective standard model

The effective standard is compiled from:

- `enterprise-2-ui-standard-model.json` — immutable historical base standard;
- `enterprise-2-ui-standard-runtime-findings.json` — append-only findings discovered by the complete server-backed cascade and historical journeys.

This split is deliberate: historical convergence is not rewritten after falsification; new runtime knowledge is appended and then compiled by the saturation gate.

## Final triple convergence

- **Novelty:** `M = 107`, confirmation through `M + 100 = 207`, novelty after M = **0**.
- **Contradictions:** `N = 55`, confirmation through `N + 100 = 155`, contradictions after N = **0**.
- **Standards:** `Z = 31`, confirmation through `Z + 100 = 131`, uncovered obligations at/after Z = **0**.

The coverage matrix spans all 22 declared UI surfaces. Every standard obligation has at least one applicable surface and at least one runtime/test witness.

## Runtime DoD added by server-backed evidence

1. server-issued actor authority remains the final source for administration-action visibility;
2. the progressive-dialog action bar remains <=72 px at 320 px after the complete CSS cascade;
3. administration ownership remains exactly one direct panel after the bounded delayed Enterprise 2 reconciliation pass;
4. global navigation, role controls, runtime status and brand reflow at 200% text enlargement without reducing text size or hiding information;
5. a direct post-decision source-dialog rerender emits the semantic surface-change event and retains canonical terminal vocabulary in the stable DOM;
6. the Surface Standard assurance, its server-backed browser journey, historical product browser journey and general CI execute on the same PR head before this convergence is treated as demonstrated.

## Historical-contract maturation

The historical alignment slice began with `delta M/N/Z = 0/0/0`: the initial failures were stale evidence consumers. The browser then falsified that assumption by exposing the stable post-decision vocabulary regression. That finding is therefore promoted into the runtime standard rather than hidden by weakening the browser assertion. The mature slice has `delta M/N/Z = 1/1/1` relative to the previous `106/54/30` frontier.

## Standards boundary

The standard continues to use WCAG 2.2, WAI-ARIA APG, HTML Living Standard, GOV.UK Design System and ICTC internal invariants as design/test references. The evidence demonstrates implementation of the declared project standard; it does **not** claim certified WCAG conformance, legal compliance, certification, representative-user validation or production readiness.
