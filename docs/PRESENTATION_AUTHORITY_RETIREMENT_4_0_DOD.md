# Presentation Authority Retirement 4.0 — DoD

## Intent

Ritirare l'ultimo final presentation resolver globale senza cambiare business semantics, routing, persistence, authorization, write authority o C0.1.

## Affected authority

- Home presentation -> `v3/public/enterprise-workspace-3-2.css`.
- Processi/Evidence presentation -> `v3/public/semantic-workspace-closure-3-2-1.css`.
- Stable chrome -> `v3/public/workspace-chrome-3-3.css`.
- `v3/public/workspace-finetuning-3-4.css` -> retired, non caricato e non current authority.
- `uiPresentation` -> `local-owners / canonical-distributed-presentation`.

## DoD

- active final presentation resolver = 0;
- native loader references to 3.4 = 0;
- current 3.4 runtime marker = 0;
- historical stable-chrome causes in enterprise 3.2 = 0;
- historical `#procedureHub` causes in enterprise 3.2 = 0;
- observable Home, Processi, Evidence and chrome invariants preserved at their canonical owners;
- historical 3.4 gates act as retirement oracles rather than as evidence that 3.4 remains current;
- no new stylesheet generation, route, business owner, state, write authority or C0.1 participant.

## Chain position

This is P1 of the minimal internal convergence chain. P2 adds the 7/7 Procedure Worklist and closes RC attention semantics; P3 closes AR temporal invalidation and explicit epistemic effects; P4 contracts compatibility rail debt and closes bounded enterprise-candidate reliability capabilities. P(n+1) starts only from a merged and quiescent P(n) main.

## Tests and falsification

Repository acceptance requires current semantic/runtime/browser CI on the exact PR HEAD. The chain was selected using the recorded 10M E2 modeled campaign in `audit/convergence-main115-10m.json`; its trial volume is not browser, independent code-mutation, human, security-assessment or deployment evidence.

## Claim boundary

This slice is presentation-authority subtraction. It does not claim enterprise-ready, WCAG certification, legal compliance, independent assurance or production deployment assurance.

## Documentation

Current authority is registered in `docs/documentation-manifest.json`, `docs/authority-matrix.yaml`, `docs/START_HERE.md` and the local-owner DoDs. `docs/UI_FINE_TUNING_3_4_DOD.md` is retained only as lineage.
