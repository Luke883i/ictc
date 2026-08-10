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
| Docs AS-IS | `node v3/documentation-authority-check.mjs` | drift persistence/release/testing/security/onboarding |
| PR60 UX language | `node v3/ux-language-polish-check.mjs` | copy, progressive disclosure, target geometry, refresh ownership, receipt print boundary |
| PR60 saturation | `node v3/pr60-convergence-saturation.mjs` | fault model source-bound + M+100 no-novelty |

## Browser journey

GitHub Actions esegue journey server-backed sul medesimo PR HEAD. La candidate mantiene i journey V1.9, V2.0 e V2.1 invece di sostituirli: regressione dell'esperienza precedente e nuovi percorsi vengono falsificati insieme.

Il journey V2.1 attraversa le sette procedure con scritture reali da UI, verifica avanzamento revisione/proiezione, EP-01, History, mobile e reduced-motion.

Il journey PR60 aggiunge controlli mirati sulle capacità introdotte dalla maturazione finale:

- Postura desktop/mobile senza overflow documentale;
- gerarchia Osservabile → Da completare → Confine;
- disclosure da tastiera e target interattivi ≥44px;
- nessun refetch Postura provocato da burst di `ictc:rendered` generici;
- refresh Postura dopo `ictc:projection-committed`;
- apertura/chiusura del menu Fascicolo con ritorno focus;
- download server-backed PDF, XML, Markdown e ZIP.

I browser journey sono evidenza automatizzata E2; non sostituiscono una review umana di usabilità o test assistivi con VoiceOver/NVDA.

## Evidence/export

Il fascicolo oggetto-specifico mantiene lo stesso perimetro di autorizzazione della lettura in PDF, XML, Markdown e ZIP. I gate verificano magic/header, escaping XML, tracciabilità, digest, claim boundary e assenza di widening authorization. Il renderer PDF viene inoltre falsificato con token senza spazi più lunghi della riga stampabile.

## Saturation

I saturation runner usano scenari pseudo-casuali, fault injection e holdout con seed distinto. Un risultato senza nuove firme nello spazio generato è **bounded evidence**, non prova universale di assenza di difetti. I compression/simplification mutant devono dimostrare che la rimozione di una responsabilità necessaria reintroduce almeno un'anomalia osservabile.

Le suite storiche possono usare M+1000. La saturation specifica PR60 implementa la richiesta **M+100**: costruisce il profilo target leggendo i sorgenti correnti, esegue 12.000 scenari di discovery con fault mutators, definisce M come l'ultimo scenario che introduce una nuova signature normalizzata misurata e verifica altri 100 scenari holdout con seed distinto. `0 newNormalizedSignatures` significa no-novelty entro quel modello misurato, non assenza globale di difetti.

## Accessibilità e finitura

Prima di una release destinata a utenti reali restano raccomandati test manuali su tastiera, VoiceOver/NVDA, zoom 200%, reflow 320 CSS px, contrasto, dialog/focus e stampa fisica o preview dei receipt PDF. Il CI automatizzato verifica reduced-motion, nomi accessibili, alcuni flussi tastiera e invarianti geometrici, non ogni combinazione AT/browser.

## Regola exact-head

Il colore di un check appartiene al commit su cui è stato eseguito. Dopo ogni commit correttivo i risultati del vecchio SHA sono genealogia, non DoD corrente. La promozione usa soltanto check e artifact dell'exact PR HEAD osservato. Un job condizionale `skipped` è non eseguito e va dichiarato separatamente dai check riusciti.
