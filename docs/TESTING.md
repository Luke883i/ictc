# Strategia di test e audit

## Superficie normativa corrente

```bash
npm test
```

`npm test` esegue `test:current`, cioè **current semantic suite + current runtime suite**. I rail storici (`test:contract`, `test:runtime`, `test:enterprise-t`, `test:legacy-regressions`) restano disponibili per diagnosi/regressione ma non ridefiniscono da soli la candidate corrente.

Per una release candidate:

```bash
npm run release:check
```

`release:check` aggiunge il rail stable prima della suite corrente.

## Livelli

| Livello | Comando | Cosa falsifica |
|---|---|---|
| Sintassi | `npm run check` | parsing dei moduli |
| Semantic current | `npm run test:current:semantic` | authority, procedure, UI contract, epistemica, security static posture, saturation |
| Runtime current | `npm run test:current:runtime` | persistenza, readback, authorization, evidence, E2E runtime |
| Candidate corrente | `npm test` | semantic + runtime current |
| Release | `npm run release:check` | stable rail + candidate corrente |
| Authority | `node v3/authority-contract-check.mjs` | ownership dichiarata vs runtime |
| Docs commands | `node v3/docs-command-contract-check.mjs` | comandi normativi esistenti |
| Docs AS-IS | `node v3/documentation-authority-check.mjs` | drift persistence/release/testing/security |

## Browser journey

GitHub Actions esegue journey server-backed sul medesimo PR HEAD. La candidate mantiene i journey V1.9, V2.0 e V2.1 invece di sostituirli: regressione dell'esperienza precedente e nuovi percorsi vengono falsificati insieme.

Il journey V2.1 attraversa le sette procedure con scritture reali da UI, verifica avanzamento revisione/proiezione, EP-01, History, mobile e reduced-motion. I test browser sono evidenza automatizzata; non sostituiscono test umani con screen reader o una review visuale professionale.

## Evidence/export

Il fascicolo oggetto-specifico deve mantenere la stessa autorizzazione di lettura in PDF, XML, Markdown e ZIP. I gate verificano magic/header, escaping XML, lineage, digest, claim boundary e assenza di widening authorization.

## Saturation

I saturation runner usano scenari pseudo-casuali, fault injection e holdout con seed distinto. Un risultato senza nuove firme nello spazio generato è **bounded evidence**, non prova universale di assenza di difetti. I compression mutant devono inoltre dimostrare che una semplificazione che rimuove una responsabilità necessaria reintroduce almeno un'anomalia osservabile.

## Accessibilità e finitura

Prima di una release destinata a utenti reali sono ancora raccomandati test manuali su tastiera, VoiceOver/NVDA, zoom 200%, reflow 320 CSS px, contrasto, dialog/focus e stampa dei receipt PDF. Il CI automatizzato verifica reduced-motion, nomi accessibili e vari invarianti geometrici, non ogni combinazione AT/browser.

## Regola exact-head

Il colore di un check appartiene al commit su cui è stato eseguito. Dopo ogni commit correttivo i risultati del vecchio SHA sono genealogia, non DoD corrente. La promozione usa soltanto check e artifact dell'exact PR HEAD osservato.
