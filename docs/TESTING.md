# Strategia di test

## Livelli

| Livello | Scopo | Comando |
|---|---|---|
| Repository contract | File, script e superfici obbligatorie | `npm run contract` |
| Schema | Contratti JSON Schema | `npm run schema:check` |
| Linguaggio | Label anti-overclaim | `npm run labels:check` |
| Epistemico | Invarianti degli envelope | `npm run epistemic:check` |
| Wiring | Controlli UI collegati al runtime | `npm run wiring:check` |
| Dominio | Regole e proiezioni | `npm run verify` |
| E2E | API e percorsi principali | `npm run e2e` |
| Visuale | Gerarchia e render | `npm run visual` |

## Journey critiche

- proposta manuale di una fonte;
- acquisizione e classificazione proposta;
- review umana della fonte;
- esecuzione di un job di scouting;
- review di un finding;
- creazione di una segnalazione o incidente;
- conferma owner e RACI;
- interrogazione dell'assistente senza write authority;
- verifica della hash-chain.

## Criterio di accettazione

Una UI non è considerata funzionante se mostra un esito prima di persistenza, readback e receipt quando il contratto richiede una scrittura.
