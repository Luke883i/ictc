# Strategia di test e audit

## Comando unico

```bash
./ictc.sh audit
```

Equivale a installazione deterministica, suite funzionale e tre audit separati.

## Livelli

| Livello | Scopo | Comando |
|---|---|---|
| Repository contract | File, script e superfici obbligatorie | `npm run contract` |
| Schema | Contratti JSON Schema | `npm run schema:check` |
| Linguaggio | Label anti-overclaim | `npm run labels:check` |
| Epistemico | Invarianti degli envelope | `npm run epistemic:check` |
| Wiring | Controlli UI collegati al runtime | `npm run wiring:check` |
| Dominio | Regole e proiezioni | `npm run verify` |
| E2E | API e percorsi principali su runtime isolato | `npm run e2e` |
| Runtime audit | Scritture, readback, receipt, restart e security headers | `npm run audit:runtime` |
| Accessibilità | Struttura, nomi, focus, motion, target e contrasto | `npm run audit:a11y` |
| Documentazione | Link, comandi e runbook | `npm run audit:docs` |
| Visuale | Render reale quando disponibile, fallback dichiarato | `npm run visual` |

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

Il validator automatico non sostituisce test con screen reader. Prima di una release destinata a utenti reali eseguire almeno:

- tastiera completa su Chromium, Firefox e Safari;
- VoiceOver su macOS/iOS;
- NVDA su Windows;
- zoom 200% e reflow a 320 CSS pixel;
- contrasto e modalità `prefers-reduced-motion`;
- verifica manuale dei dialoghi e del ritorno del focus.
