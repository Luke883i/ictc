# Strategia di test e audit

## Comando completo

```bash
npm test
```

`npm test` concatena i tre livelli canonici `test:contract`, `test:runtime` e `test:enterprise-t`. `./ictc.sh audit` delega a `npm run audit`, che oggi delega allo stesso `npm test`.

## Comandi canonici

| Livello | Scopo | Comando |
|---|---|---|
| Sintassi | Parsing dei moduli runtime/UI/check | `npm run check` |
| Contratto | Contratti prodotto, journey, epistemica, security e assurance | `npm run test:contract` |
| Runtime | Evidenza, replay, persistenza, journey E2E e runtime saturation | `npm run test:runtime` |
| Enterprise T | Saturation, convergence, audit e falsification | `npm run test:enterprise-t` |
| Suite completa | Contratto + runtime + Enterprise T | `npm test` |
| Audit completo | Alias operativo della suite completa | `npm run audit` |
| Release candidate | Gate locale di release attualmente equivalente alla suite completa | `npm run release:check` |
| Authority | Coerenza tra authority matrix e runtime eseguibile | `node v3/authority-contract-check.mjs` |
| Documentazione comandi | Ogni comando normativo documentato deve esistere | `node v3/docs-command-contract-check.mjs` |
| GOV-01F self-test | Provenienza PR/main e direct-push detector | `node v3/governance-free-private-check.mjs --self-test` |

Gli script specializzati presenti in `package.json` possono essere usati per regressioni mirate; la tabella sopra è la superficie normativa minima. Nessun documento deve prescrivere un nuovo script npm prima che lo script esista realmente in `package.json`.

## Journey critiche

- proposta manuale di link o file;
- acquisizione locale, checksum e classificazione proposta;
- review umana della fonte;
- esecuzione di un job di scouting;
- review di un finding;
- creazione di segnalazione o incidente;
- conferma owner e RACI;
- interrogazione dell'assistente senza write authority;
- persistenza dopo riavvio;
- verifica della hash-chain.

## Criterio di accettazione

Una UI non è considerata funzionante se:

- mostra un esito prima di persistenza e readback quando il contratto richiede una scrittura;
- presenta una proposta AI come decisione umana;
- dichiara un controllo nel wiring manifest senza handler e route reali;
- dipende da stato di test nella SOT usata dall'utente;
- non offre focus visibile, nome accessibile o alternativa al movimento.

## Browser e tecnologie assistive

I workflow `browser` e `browser-journeys` forniscono evidenza browser automatizzata sul commit osservato; non sostituiscono test umani con tecnologie assistive. Prima di una release destinata a utenti reali restano necessari, quando applicabili:

- tastiera completa sui browser target;
- VoiceOver su macOS/iOS;
- NVDA su Windows;
- zoom 200% e reflow a 320 CSS pixel;
- contrasto e modalità `prefers-reduced-motion`;
- verifica manuale dei dialoghi e del ritorno del focus.
