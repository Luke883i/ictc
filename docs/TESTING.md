# Strategia di test, mutation e saturation

## Superficie normativa

```bash
npm test
npm run release:check
```

`npm test` = semantic current + runtime current. I rail storici restano regressioni/diagnostica; non ridefiniscono `v3/release-identity.json`.

## Closure 2.8

I check mirati sono:

```bash
node v3/semantic-closure-2-8-runtime-check.mjs
node v3/semantic-closure-2-8-causality-check.mjs
node v3/semantic-closure-2-8-ui-check.mjs
node v3/semantic-closure-2-8-saturation.mjs
```

`current-release-suite-check.mjs`, già parte della semantic current suite, importa questi gate: non è stato creato un workflow parallelo.

### Modello 10M + 1M

`semantic-closure-2-8-saturation.mjs` esegue deterministicamente:

- **10.000.000 simulazioni** su combinazioni di ciclo rischio, stabilità evidenza, producer AI, lineage/cycle e semantic lifecycle event;
- **1.000.000 mutazioni negative** su 11 failure family dichiarate;
- discovery sulle prime 900.000 mutazioni;
- holdout sulle ultime 100.000;
- target kill-rate = 100%;
- target new normalized family nel holdout = 0.

Questa è bounded model evidence. Non dimostra completezza del fault vocabulary e non converte un volume alto in probabilità di correttezza.

## Livelli

| Livello | Cosa falsifica |
|---|---|
| syntax | parsing e import |
| semantic current | authority, procedure contract, projection/UI, epistemic, static security, saturation |
| runtime current | persistence, RBAC, evidence, readback, E2E runtime |
| targeted closure | finding 2.8 e regressioni causali/temporali |
| browser exact-head | journey reale sul server e DOM |
| release check | stable rail + candidate current |

## Regola mutation

Una mutazione utile rompe **un invariante indipendente**. Il kill-rate vale soltanto rispetto agli operatori dichiarati. Se una nuova failure family emerge, va aggiunta al vocabolario invece di aumentare il numero di seed per nasconderla.

Compression mutant: rimuovere un owner/guard/binding necessario deve riaprire almeno una signature. Test e prodotto non possono essere allentati nello stesso commit per ottenere verde.

## Exact-head

Il colore appartiene allo SHA eseguito. Dopo una correzione, il verde del commit precedente è genealogia. PR acceptance richiede gli artifact/check della PR HEAD corrente; `skipped` significa non eseguito, non passed.

## Browser / accessibilità

I journey automatizzati sono E2 repository evidence e non sostituiscono review umana di usabilità, VoiceOver/NVDA, zoom/reflow/contrast/focus o verifica fisica degli export.

## Evidence / security

I test verificano identity/version binding, authorization, checksum, XML/PDF/ZIP shape e limitation. Non attestano autenticità esterna, applicabilità legale, effectiveness, security del deployment o assurance indipendente.
