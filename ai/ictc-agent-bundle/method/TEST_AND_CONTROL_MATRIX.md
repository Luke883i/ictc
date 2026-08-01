# Test e controlli

## Gate repository

| Livello | Comando canonico | Prova |
|---|---|---|
| Contratto repository | `npm run contract` | file, autorita e struttura attese |
| Schemi | `npm run schema:check` | fixture conformi agli schemi |
| Linguaggio | `npm run labels:check` | label coerenti e non fuorvianti |
| Epistemico | `npm run epistemic:check` | separazione osservazione/proposta/decisione |
| Wiring UI | `npm run wiring:check` | controllo visibile collegato a handler/API |
| Verifica base | `npm run verify` | invarianti applicative |
| E2E base | `npm run e2e` | percorsi end-to-end storici |
| Audit runtime | `npm run audit:runtime` | persistenza e readback |
| Accessibilita | `npm run audit:a11y` | struttura e nomi accessibili |
| Documentazione | `npm run audit:docs` | coerenza contrattuale |
| Core UI | `npm run audit:ux:core` | kernel, shell, copy, accessibilita, saturazione |
| Release | `npm run release:check` | composizione dei gate di rilascio |

## Prove live della PR #8

### Runtime

Avvia un provider sintetico, avvia ICTC su stato isolato, verifica `/api/health`, esegui `v3/journey-runtime-check.mjs` e controlla receipt/eventi/blob.

### Browser

Riavvia con stato isolato, esegui `v3/journey-browser-check.py`, effettua scritture reali, readback, navigazione, preferenze e screenshot.

### Controlli di saturazione

La UI core usa `M=40` e `M+100=140`; l'assenza di nuove primitive dopo M e una conclusione bounded sul set simulato, non prova completezza universale.

## Regola di selezione

- Patch documentale: test documentazione + contratto + eventuali riferimenti.
- Patch schema/modello: schema, epistemic, verify, runtime.
- Patch API/store: test mirato, runtime audit, journey runtime, release.
- Patch UI: linkage, shell, copy, accessibilita, browser, release.
- Patch workflow/test harness: sintassi, riproduzione del failure, self-test del harness, workflow completo.

## Controlli che non vanno confusi

- hash del file != correttezza semantica;
- receipt di scrittura != verita del contenuto;
- runtime verde != browser verde;
- test locale verde != GitHub Actions verde;
- mergeable != approvato;
- merge != release o deploy.
