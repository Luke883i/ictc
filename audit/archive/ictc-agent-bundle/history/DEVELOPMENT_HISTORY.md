# Storia di sviluppo ICTC osservata

## Origine e progressione

La traiettoria osservata porta da una fondazione epistemica a una webapp locale proof-oriented, quindi a una superficie ridotta ai due servizi centrali.

| Data | Milestone | Commit |
|---|---|---|
| 2026-07-31 | Fondazione epistemica v2, PR #1 | `a23e5f1d807ec3ec939a1354486c5c34c790956b` |
| 2026-07-31 | API locale e runtime | `212f03ffb2c2845213f4d7c2212a3ca92b10ab3d` |
| 2026-07-31 | Launcher e runtime audit, PR #2 | `a85369e0f07ab3d99d934b0f95aba863855685fc` |
| 2026-07-31 | Living Evidence Atlas, PR #3 | `9eb2f472f0c04148bc608fb487b1e57fbe0211ea` |
| 2026-07-31 | Audit post-merge e hardening launcher, PR #4 | `030d8381e9a894e6a187e7f12ec6cb89e40b91ad` |
| 2026-08-01 | Attestazione v1 locale stabile, PR #5 | `28db1731c01d0570f37fbea8bcbd40aa1d5702e8` |
| 2026-08-01 | Proiezione UX accessibile, PR #6 | `d4481b570f56859c8c0e2bfd82c1115166efd3ba` |
| 2026-08-01 | UI journey/persona, PR #7 | `848e87cd4dbae363d172b6226786c29b9a0fce64` |
| 2026-08-01 | Refocus sui due servizi, PR #8 | `39dba493a9ccff78cf6a32d9b4cb111c04bfdc55` |

## Punto di partenza della PR #8

La base era la UI journey/persona della PR #7. Il problema progettuale era l'eccesso di tassonomia e di astrazioni rispetto alle due azioni che l'utente deve comprendere immediatamente.

## Punto di arrivo

La PR #8 rende primarie soltanto:

1. **Monitoraggio normativo**: configurazione, acquisizione o inserimento manuale, blob/digest, proposta AI opzionale, review umana, decisione e collegamento a controllo.
2. **Incidenti e quasi incidenti**: segnalazione, responsabilita, triage, analisi, risposta, ripristino e lezioni apprese.

Il runtime rimane locale e single-user. Ledger, receipt, readback e blob attestano operazioni tecniche; non determinano automaticamente applicabilita legale, conformita o obblighi di notifica.

## Catena di correzione della PR #8

Dopo il refocus, la branch ha introdotto policy di rete, blob store content-addressed, modello runtime e kernel checks. La CI ha poi evidenziato mismatch tra audit e refactor, handler compatti, collegamenti ES module e vincoli CSP. Ogni failure e stata trattata come prova falsificante e corretta con patch minima e test mirato.

La catena completa e in `PR8_COMMIT_CHAIN.json`.

## Lezioni trasferibili

- Le superfici utente devono derivare da operazioni runtime reali.
- Ogni stato positivo necessita di prova e readback.
- I test statici non sostituiscono il browser reale; il browser non sostituisce il runtime.
- Le CSP possono invalidare il test anche quando l'app funziona: il test deve rispettare i guardrail del prodotto.
- Il commit pubblicato deve essere verificato dopo l'update del ref; i risultati su un parent non si trasferiscono automaticamente al nuovo HEAD.
