# UI Fine-Tuning 3.4 — retired lineage record

## Status

**Retired.** UI Fine-Tuning 3.4 was an effective transitional presentation closure. It is no longer a current presentation authority and `v3/public/workspace-finetuning-3-4.css` is not part of the active tree/runtime.

## What was absorbed

- stable header/footer -> `v3/public/workspace-chrome-3-3.css`;
- Processi landing/catalogue -> `v3/public/semantic-workspace-closure-3-2-1.css`;
- Evidenze ICTC presentation -> `v3/public/semantic-workspace-closure-3-2-1.css`;
- Home landing/work-summary/actions -> `v3/public/enterprise-workspace-3-2.css`.

The current runtime publishes `uiPresentation=local-owners`; it does not publish a 3.4 current marker.

## Retirement invariants

- active final presentation resolver = `0`;
- native workspace loader references to `workspace-finetuning-3-4.css` = `0`;
- runtime `data-ui-fine-tuning` current markers = `0`;
- historical stable-chrome causes in `enterprise-workspace-3-2.css` = `0`;
- historical `#procedureHub` causes in `enterprise-workspace-3-2.css` = `0`;
- header/footer output remains owned by 3.3;
- Processi/Evidence output remains owned by 3.2.1;
- Home output remains owned by 3.2;
- no new stylesheet generation, business owner, write authority, route, state or C0.1 participant is introduced by the retirement.

## Falsification

The historical paths `v3/ui-finetuning-3-4-check.mjs` and `v3/ui-finetuning-3-4-saturation.mjs` are intentionally retained as **retirement oracles**, not as proof that 3.4 remains current. They verify the relocated observable invariants at canonical owners and fail if the retired final resolver, its loader or its runtime marker returns.

The saturation remains bounded model evidence. It is not browser-session volume, compiled code-mutant evidence, a human usability study, WCAG certification, legal assessment or deployment assurance.

## Lineage boundary

This document preserves why 3.4 existed and how it was retired. It is classified as `lineage` in `documentation-manifest.json` and cannot regain current authority through filename, recency or test-path naming.
