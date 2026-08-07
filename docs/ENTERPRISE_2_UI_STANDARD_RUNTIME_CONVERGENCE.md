# ICTC Enterprise 2 — runtime convergence of Surface Standard 1

This note is the **authoritative convergence delta** for `ictc-surface-standard-1`. It supersedes the provisional M/N/Z counters in `ENTERPRISE_2_UI_STANDARD.md` for the current PR head while preserving that document as the base design rationale.

## Why the model changed

The deterministic fixture reached a provisional bounded convergence, but the real server-backed browser journey exposed four classes that did not exist in the fixture model. Treating those failures as noise would violate the saturation method, so each real finding was incorporated as a new primitive/witness before recomputing the tails.

| Server-backed finding | Observed failure | Runtime resolution | Standard witness |
|---|---|---|---|
| Authority layering | `renderIdentity()` exposed `Configura AI` for admin, then a legacy presentation layer hid it | server-issued `actor.role` is the final visibility source | ICTC-L11 |
| Mobile action-bar cascade | settings footer reached 161.375 px at 320 px | terminal 2-column 44 px action bar, budget <=72 px | ICTC-L12 |
| Delayed admin ownership | after the bounded legacy pass, 0 direct admin panels remained visible | terminal owner reconciliation after the delayed pass; stable-state browser assertion | ICTC-L13 |
| Text zoom reflow | 200% text enlargement produced +29 px, then +2 px residual overflow | intrinsic rem grid plus bounded topbar/select sizing; no font reduction and no overflow masking | ICTC-L14 |

## Effective standard model

The effective standard is compiled from:

- `enterprise-2-ui-standard-model.json` — base standard plus the first server-issued-authority finding;
- `enterprise-2-ui-standard-runtime-findings.json` — append-only findings discovered by the complete server-backed cascade.

This split is deliberate: historical convergence is not rewritten after falsification; new runtime knowledge is appended and then compiled by the saturation gate.

## Final triple convergence

- **Novelty:** `M = 106`, confirmation through `M + 100 = 206`, novelty after M = **0**.
- **Contradictions:** `N = 54`, confirmation through `N + 100 = 154`, contradictions after N = **0**.
- **Standards:** `Z = 30`, confirmation through `Z + 100 = 130`, uncovered obligations at/after Z = **0**.

The coverage matrix spans all 22 declared UI surfaces. Every standard obligation has at least one applicable surface and at least one runtime/test witness.

## Runtime DoD added by server-backed evidence

1. the progressive-dialog action bar remains <=72 px at 320 px after the complete CSS cascade;
2. administration ownership remains exactly one direct panel after the bounded delayed Enterprise 2 reconciliation pass;
3. global navigation, role controls, runtime status and brand reflow at 200% text enlargement without reducing text size or hiding information;
4. server-issued actor authority remains the final source for administration-action visibility;
5. the server-backed UI-standard browser journey and the static assurance gate pass on the same commit before this convergence is treated as demonstrated.

## Standards boundary

The standard continues to use WCAG 2.2, WAI-ARIA APG, HTML Living Standard, GOV.UK Design System and ICTC internal invariants as design/test references. The evidence demonstrates implementation of the declared project standard; it does **not** claim certified WCAG conformance, legal compliance, certification, representative-user validation or production readiness.
