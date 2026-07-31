# Audit runtime

## Domanda verificata

La webapp funziona come vertical slice locale e le operazioni dichiarate sono collegate a un runtime reale?

## Comando

```bash
npm run audit:runtime
```

oppure:

```bash
./ictc.sh audit
```

## Metodo

L'audit crea una directory SOT temporanea tramite `ICTC_RUNTIME_DIR`, avvia il server e verifica:

1. health e security headers;
2. bootstrap di tutti gli `OutcomeEnvelope`;
3. ledger iniziale coerente;
4. input negativi e sessione AI senza write authority;
5. inserimento fonte → persistenza → readback → receipt;
6. review fonte → proiezione attiva;
7. job scouting → finding con materialità indeterminata;
8. review umana del finding;
9. evento → RACI proposta → conferma owner;
10. assistente limitato alla capsula;
11. manifest read-only della documentazione e del codice;
12. hash-chain dopo le scritture;
13. arresto, riavvio e ricostruzione dalla stessa SOT.

Il test non modifica `runtime/` dell'utente. L'evidenza viene scritta in `artifacts/runtime-audit.json`.

## Cosa dimostra

- API e funzioni di dominio eseguono le journey principali;
- le scritture producono eventi e receipt;
- la proiezione riflette le decisioni dopo readback;
- il ledger sopravvive al riavvio;
- l'assistente non acquisisce write authority;
- la UI statica è servita con CSP e header di base.

## Cosa non dimostra

- autenticazione e autorizzazione enterprise;
- isolamento multi-tenant;
- sicurezza di rete;
- scanning malware;
- performance a 1.000 utenti;
- completezza normativa;
- correttezza giuridica;
- compatibilità con tutte le tecnologie assistive.

## Browser reale

Il controllo visuale usa il browser quando l'ambiente lo consente e registra esplicitamente `real-browser` o `fallback-static`. Un fallback non deve essere descritto come visual regression browser-based.

## Esito audit del 31 luglio 2026

### Runtime verificato

L'audit automatico ha superato 17 controlli end-to-end:

- health e informazioni runtime;
- header di sicurezza e caricamento della UI;
- costruzione delle viste esclusivamente da `OutcomeEnvelope`;
- isolamento della SOT di test;
- contratti negativi sulle API;
- sessione AI read-only;
- inserimento manuale di una fonte con persistenza, readback e receipt;
- review umana della fonte e aggiornamento della proiezione;
- scouting che produce una proposta senza promozione autonoma;
- review di un finding;
- creazione di una segnalazione con owner e RACI;
- conferma dell'owner con readback;
- capsula AI delimitata e priva di write authority;
- manifest read-only della documentazione e del codice;
- verifica della hash-chain;
- riavvio del server e ricostruzione dello stato persistito.

### Accessibilità verificata

Il validator statico e comportamentale ha superato 87 controlli. La baseline copre:

- struttura semantica, lingua, titolo, viewport, skip link e landmark principali;
- nomi accessibili per pulsanti, dialoghi e campi;
- associazione tra label e input;
- navigazione da tastiera e shortcut documentata;
- focus visibile e target minimi;
- stato `aria-current` della navigazione;
- stato espanso/nascosto dell'assistente;
- riduzione automatica e manuale del movimento;
- contrasto delle coppie principali della palette;
- assenza di handler inline incompatibili con la CSP;
- wiring dei risultati di ricerca, dei dettagli e della modalità link/file.

Questi controlli costituiscono una baseline automatica. Non sostituiscono una verifica manuale con tecnologie assistive reali, in particolare VoiceOver, NVDA e TalkBack.

### Audit visuale

Nell'ambiente di esecuzione corrente Chromium viene avviato, ma una policy organizzativa impedisce l'accesso a URL locali e file locali. Il render browser reale non è quindi attestato localmente. Il controllo ha prodotto un fallback statico deterministico e ha registrato esplicitamente la modalità `fallback-static`.

Il workflow `ictc-visual` installa Playwright e Chromium in GitHub Actions e tenta il render browser reale. Una release non deve presentare il fallback come prova di compatibilità browser.

### Completezza della beta

| Capacità | Stato | Evidenza |
|---|---|---|
| Avvio locale e controllo processo | implementata | `./ictc.sh start/status/stop` |
| Dashboard e drill-down epistemico | implementata | UI + `OutcomeEnvelope` |
| Inserimento manuale di link/file | implementato nella beta locale | API, blob locale, checksum, receipt |
| Review umana delle fonti | implementata | evento append-only e proiezione |
| Scouting | simulazione deterministica implementata | proposta senza promozione autonoma |
| Segnalazioni, owner e RACI | vertical slice implementata | API, ledger e readback |
| Assistente locale session-scoped | implementato come assistente deterministico | capsula UI e nessuna scrittura |
| Integrità e ricostruzione | implementate | hash-chain e restart audit |
| Parsing profondo PDF/DOC | parziale | il file viene conservato, non interpretato completamente |
| Scheduler persistente e acquisizione remota | non implementati | previsti per la fase enterprise |
| Diff normativo semantico reale | non implementato | presente solo il contratto di dominio |
| Ciclo completo di risposta a incidente | parziale | manca orchestrazione di notifiche, comunicazioni e closure review |
| Autenticazione, tenant e autorizzazioni enterprise | non implementati | esplicitamente fuori dalla beta |
| Provider LLM esterno governato | non implementato nel runtime pubblicato | solo contratto locale e deterministico |
| Storage e osservabilità enterprise | non implementati | file locali adatti al PoC |

### Espressività della webapp

Punti di forza verificati:

- le etichette descrivono lo stato della catena e non proclamano conformità;
- ogni oggetto consente di aprire provenienza, produttore, input, limiti e receipt;
- ricerca, tracce ASCII e dettaglio condividono la stessa proiezione runtime;
- la UI separa proposta AI, review umana e verifica deterministica;
- le azioni principali restituiscono stato di persistenza e readback.

Limiti ancora visibili:

- la home usa un seed dimostrativo e non ancora dati istituzionali acquisiti in tempo reale;
- non sono presenti serie temporali reali di freschezza e copertura;
- le viste dedicate a direzione, auditor e owner sono ancora proiezioni dello stesso workspace;
- manca una vista strutturata dell'intero ciclo di vita dell'incidente;
- internazionalizzazione e personalizzazione organizzativa non sono ancora implementate.

### Chiarezza della documentazione

La documentazione ora espone un percorso unico:

```bash
./ictc.sh start
```

Il README spiega requisiti, avvio, verifica, arresto, configurazione e limiti. `docs/OPERATIONS.md` descrive il ciclo operativo; `docs/TESTING.md` distingue test, audit e visual validation; `docs/ACCESSIBILITY.md` documenta baseline e verifiche manuali ancora necessarie.

Il comando consigliato prima di una PR è:

```bash
./ictc.sh audit
```

che esegue test funzionali, audit runtime, accessibilità e documentazione.
