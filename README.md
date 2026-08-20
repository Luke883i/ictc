# ICTC

ICTC è un sistema operativo di compliance per registrare lavoro, decisioni, evidenze e relazioni attraverso **sette Processi di Compliance bounded**, mantenendo separati fatti registrati, proposte AI, review umane e conclusioni che richiedono autorità esterna.

ICTC non è una certificazione, un parere legale, un auditor autonomo né un security perimeter. Un controllo presente, un mapping, un hash o un receipt non dimostrano da soli conformità, applicabilità, efficacia o sufficienza probatoria.

## Il prodotto

La navigazione canonica è **Home / Processi di Compliance / Evidenze ICTC**. Da **Evidenze ICTC**, admin e auditor possono inoltre aprire **EP-01 · Reticolo epistemico**, una meta-procedura trasversale che non diventa un ottavo processo business.

I sette Processi di Compliance sono:

| Codice | Processo di Compliance | Oggetto operativo |
|---|---|---|
| RN-01 | Monitoraggio normativo | monitoraggi, fonti, requisiti e decisioni di fonte |
| EC-01 | Eventi e segnalazioni | fatti originati, chiarimenti, formulazioni e stato evento |
| AO-01 | Inventario | sistemi e oggetti nel perimetro |
| MC-01 | Controlli e copertura | standard, requisiti e proposte di mapping |
| AP-01 | Azioni correttive | azioni, owner, scadenze e stato |
| RC-01 | Rischi compliance | rischi, valutazioni e trattamento |
| AR-01 | Questionari e verifiche | casi di assurance, domande, risposte e review |

Ogni processo può creare un record iniziale compatibile in un altro processo tramite il contratto cross-process, senza bypassare RBAC, policy o normalizzatore del target.

> Nota di compatibilità: identificatori tecnici storici come `procedureRegistry`, `procedureId`, nomi file `procedure-*` e campi API versionati restano invariati finché una migrazione esplicita non li sostituisce. Nel linguaggio utente e nella documentazione corrente il dominio business è **Processi di Compliance**.

## Come leggere ICTC

L'esperienza distribuisce la complessità in strati. La superficie operativa segue l'ordine **Identità → Azione → Lavoro → Evidenza/Traccia → Limite**: prima dice in quale Processo di Compliance sei e quale compito puoi svolgere, poi mostra il lavoro nativo; contesto, tracciabilità, dati raw e limiti restano raggiungibili senza interrompere il task primario. Le transizioni visuali sono un enhancement: stato, History e semantica della navigazione restano indipendenti dal movimento e rispettano `prefers-reduced-motion`.

La composizione UI corrente ha un solo root applicativo (`installActiveExperience`). Il contratto **C0.1** ordina le responsabilità finali come **harmonization → presentation → integrity → journey → annotation**. L'ordine non dipende da timer, profondità di microtask o side-channel tardivi: harmonization normalizza frame e linguaggio; presentation possiede in modo esclusivo la decisione visuale; integrity rinforza invarianti; journey guida senza creare una seconda authority decisionale; annotation classifica intent, authority ed effetto probatorio dei controlli dopo il journey. Il lifecycle coalesca gli eventi, tratta la reentrancy come replay nello stesso flush e fallisce chiuso se non converge. Il contratto è descritto in `docs/PROCEDURE_AUTHORITY_CONSTITUTION_C0_2026-08-19.md`.

Un contatore di attenzione è un **segnale operativo**, non un giudizio favorevole: zero elementi da vedere significa soltanto che la proiezione corrente non espone attenzione aperta sotto quel contatore. Non significa conformità, efficacia, completezza o assenza di rischio. All'interno di ciascun Processo di Compliance lo stesso subject non viene contato due volte nel totale di attenzione soltanto perché appartiene anche a una sottocategoria, per esempio `ready-for-review` o `review-due`.

**Evidenze ICTC** risponde, in quest'ordine, a quattro domande: cosa è osservabile, come ICTC lo dimostra, quale evidenza manca e cosa ICTC non conclude. Il metodo di prova è esplicito: **pratica → evidenza → limite**. Decisioni, runtime, requisiti esterni di deployment, standard dichiarati, riferimenti ed export sono livelli successivi.

Le mappature a benchmark e standard dichiarati — per esempio WCAG 2.2, WAI-ARIA APG, ISO 9241-210, ISO 37301, NIST CSF 2.0, NIST SSDF ed EU AI Act — descrivono pratiche adottate, evidenze disponibili e limiti. Non sono certificazioni, conclusioni di applicabilità, percentuali di conformità o assessment dell'organizzazione/deployment.

**EP-01 · Reticolo epistemico** presenta la stessa proiezione revision-bound in tre modi: `Esplora`, `Flat / raw`, `Proto-grafo`. In Esplora il percorso è **Quadro → Gruppi → Relazioni → Atomo**. Le letture AI restano visivamente e semanticamente separate dai record business.

Il profilo **Onto-Compliance Horizon v1** è un contratto di design e assurance: controlla che gerarchia visuale, Processo di Compliance dichiarato e autorità epistemica dicano la stessa cosa. Il profilo **Visual Grace / Lexical / Epistemic v1** aggiunge proporzione, leggibilità, lessico canonico e convergenza del reticolo come osservabili testabili. Nessuno dei due introduce un nuovo processo, score o verdetto di compliance.

## Autorità epistemica

La regola centrale è semplice: **registrare non significa concludere**.

- una osservazione descrive ciò che è stato acquisito;
- una proposta AI resta `proposed`;
- una review o decisione umana è registrata come azione distinta;
- ogni statement conserva producer, input, timestamp, limiti e receipt quando previsti;
- la sola presenza di evidenza non produce un verdetto legale o di compliance.

L'AI è opzionale. In EP-01 l'inferenza richiede un'esplicita attivazione umana per ogni run; le derivazioni L1–L4 citano i basis atom e i riferimenti impiegati e non promuovono autonomamente stato umano.

## Persistenza e integrità AS-IS

Il runtime canonico è `v3/server.mjs`. La persistenza locale corrente è **SQLite** (`state.sqlite`) tramite `v3/sqlite-state-persistence.mjs`, con WAL, `synchronous=FULL` e foreign keys abilitate.

Il modello distingue responsabilità diverse:

- `snapshot`: stato canonico corrente, mutabile per revisione;
- `audit`: ledger append-only hash-linked delle mutazioni;
- `subject_payload`: payload content-addressed;
- `subject_version`: versioni semantiche append-only;
- `epistemic_step`: step epistemici append-only legati alla revisione/audit.

Un vecchio `state.json`, se presente, è solo sorgente di import legacy e viene archiviato dopo la migrazione. ICTC non deve essere descritto come event store completo: lo snapshot corrente non è ricostruito esclusivamente dal ledger audit.

I receipt e i binding di digest rilevano incoerenze entro il modello software verificato; non equivalgono a firma qualificata, trusted timestamp o non-ripudio contro un attore capace di riscrivere storage e catena.

## Evidenze ed export

I fascicoli oggetto-specifici mantengono **lo stesso perimetro di lettura** (`same-as-read` nel contratto tecnico): un export non espande mai l'autorizzazione di lettura. Un'unica proiezione canonica alimenta:

- **PDF** stampabile con intestazione ICTC;
- **XML** strutturato;
- **Markdown** leggibile;
- **ZIP** completo con JSON, graph, claims, decisioni, audit, receipt, PDF/XML/Markdown e checksum SHA-256.

Il receipt di tracciabilità (`lineage` nel formato tecnico) riporta, quando disponibili, revisione, timestamp, actor/role, subject, `previousHash`, event hash, digest input/result/state, semantic manifest ed epistemic-step binding. È evidenza tecnica di ciò che ICTC ha registrato, non attestazione della verità sostanziale del contenuto.

## Avvio locale

Richiede Node.js 22 o successivo. Installa una volta le dipendenze:

```bash
npm ci
```

### Modalità standard

Avvia ICTC sul runtime locale canonico `.ictc/runtime`:

```bash
./ictc.sh start
```

Per non aprire automaticamente il browser:

```bash
./ictc.sh start --no-open
```

Questa modalità **non inserisce dati demo**. È la modalità da usare per uno stato operativo reale o per una runtime vuota che vuoi popolare manualmente.

### Modalità demo PMI

Avvia ICTC con il dataset sintetico **Meccanica Selene S.r.l. · DEMO**:

```bash
./ictc.sh demo
```

Oppure senza apertura automatica del browser:

```bash
./ictc.sh demo --no-open
```

La modalità demo usa di default `.ictc/demo-runtime-v2` e gli stessi owner, normalizzatori, SQLite store e projection del prodotto standard. Non esiste un database demo parallelo. Il corpus sottostante mantiene **700 record primari di stress — 100 per ciascuno dei sette Processi di Compliance —** più record sintetici di contesto, ma tali record non costituiscono il racconto positivo dell'adozione. La vista positiva corrente è il cohort **operating-year** di Meccanica Selene, dal **1 luglio 2025 al 30 giugno 2026**, selezionato con densità non uniforme coerente con la natura di ciascuna procedura; i record rimanenti sono marcati `stress-corpus` e servono alla falsificazione.

Nel cohort operating-year i conteggi attesi sono RN 8, EC 17, AO 60, MC 34, AP 25, RC 20 e AR 13. Il **deep fine-tuning RN/EC/AO/MC/AP** è il profilo verticale più profondo corrente; **RC e AR restano regression-covered** e procedure business canoniche mentre maturano le rispettive slice verticali. Questa differenza di maturità è esplicita e non riduce il catalogo business da sette a cinque procedure.

In demo:

- ogni business record è marcato `synthetic-demo`;
- le decisioni umane sono attribuite a persone DEMO;
- lo scheduler operativo è disabilitato, quindi i monitoraggi sintetici storici non avviano attività autonome;
- il banner persistente dichiara sempre che dati e risultati sono sintetici;
- admin e auditor ricevono nel bootstrap la projection read-only `demoAudit`, che verifica coerenza locale/intermedia/globale del dataset e dei contatori;
- `demoAudit.verdict = coherent` significa soltanto che gli invarianti dichiarati del dataset sintetico risultano coerenti. Non significa conformità, applicabilità legale, efficacia dei controlli, certificazione o assurance indipendente.

Sono mantenute anche due forme compatibili dello stesso avvio:

```bash
./ictc.sh start --demo-seed
./ictc.sh start -demoseed
```

Non usare `ICTC_RUNTIME_DIR` per puntare il seed demo a una runtime reale esistente: il seed rifiuta uno stato business non-demo, ma la separazione delle directory resta una responsabilità operativa importante.

### Operazioni sul launcher

```bash
./ictc.sh status
./ictc.sh logs
./ictc.sh doctor
./ictc.sh stop
./ictc.sh restart
```

`ICTC_PORT`, `ICTC_HOST`, `ICTC_STATE_DIR` e `ICTC_RUNTIME_DIR` possono essere usati come override espliciti. Il server ascolta normalmente su `127.0.0.1:4173`. Un bind di rete richiede le condizioni di sicurezza previste dal runtime; TLS e protezione del deployment restano responsabilità dell'operatore.

## Verifica

La suite corrente è la superficie normativa per la candidate in sviluppo:

```bash
npm test
npm run release:check
```

Per diagnosi mirata:

```bash
npm run test:current:semantic
npm run test:current:runtime
node v3/experience-constitution-check.mjs
node v3/experience-constitution-saturation.mjs
node v3/uiux-onto-epistemic-check.mjs
node v3/uiux-onto-epistemic-saturation.mjs
node v3/demo-outcome-audit-check.mjs
node v3/demo-outcome-saturation.mjs
node v3/authority-contract-check.mjs
node v3/docs-command-contract-check.mjs
node v3/onto-compliance-horizon-check.mjs
node v3/onto-compliance-saturation.mjs
node v3/visual-grace-lexical-epistemic-check.mjs
node v3/visual-grace-lexical-epistemic-saturation.mjs
```

I journey browser server-backed e gli artifact commit-bound sono eseguiti in GitHub Actions sullo stesso HEAD della PR. I saturation test producono evidenza bounded sullo spazio generato; non provano l'assenza universale di difetti.

Il profilo C0.1 conserva **10.000 scenari baseline** e aggiunge **100.000 ulteriori simulazioni**: 40.000 casi normali, 40.000 stress re-entranti e 20.000 edge mutant. Le 14 failure family aggiuntive raggiungono **M=114** e un holdout esatto fino a **1114 = M+1000** non produce nuove famiglie normalizzate; tutti i 20.000 mutant edge campionati vengono uccisi. Il numero di scenari, il mutation kill rate e il no-novelty sono parametri di falsificazione bounded, non probabilità di correttezza né assurance indipendente.

Il profilo demo-outcome esegue 10.000 scenari con seed pseudocasuale univoco e riproducibile attraverso classi di stress dichiarate, più 10.000 mutazioni negative. La convergenza e l'holdout dimostrano soltanto che, nel vocabolario e negli operatori testati, non emerge una nuova classe normalizzata: non sono una prova di rappresentatività universale delle PMI italiane o di correttezza sostanziale dei singoli giudizi di compliance.

Nel profilo Onto-Compliance storico, `M+100` significa nessuna nuova signature misurata nel holdout dichiarato e `G+100` nessuna ulteriore compressione sicura nello spazio di operatori dichiarato. Nel profilo Visual Grace / Lexical / Epistemic, ciascuna famiglia usa discovery pseudocasuale riproducibile e un holdout distinto **M+10000** senza nuova classe di anomalia normalizzata né violazione del target corrente. Questi stop non sono teoremi di correttezza, minimalità, gradevolezza universale o conformità.

## Identità della candidate

`v3/release-identity.json` schema 2.0 è la fonte cross-documenti. Distingue ciò che è **corrente** dalla lineage storica:

- product version: `1.8.0`;
- release stage: `candidate`;
- semantic contract: `1.2-market-candidate`;
- experience contract: `1.9-experience-candidate`;
- epistemic contract: `2.0-epistemic-lattice-pre-candidate`;
- journey contract: `2.2-sequential-onto-epistemic`;
- constitution contract: `C0.1`;
- assurance profile Onto-Compliance Horizon: `1.0` candidate;
- assurance profile Visual Grace / Lexical / Epistemic: `1.0` candidate.

La lineage conserva refinement `1.9.1-pre-candidate`, journey `2.1-procedure-journey-semantic-exploration-pre-candidate` e constitution `C0` come storia informativa, non come identità corrente concatenata.

## Sviluppo e documentazione

**Se è la prima volta nel repository, parti da `docs/START_HERE.md`.** È una mappa verso gli owner correnti, non una nuova autorità.

Prima di cambiare un'autorità leggere `AGENTS.md` e `docs/authority-matrix.yaml`. Le guide operative principali sono:

- `docs/START_HERE.md` — percorso minimo per orientarsi senza ricostruire la storia delle PR;
- `docs/DEVELOPMENT.md` — sviluppo locale e flusso PR;
- `docs/TESTING.md` — suite e falsificatori;
- `docs/11_ARCHITECTURE.md` — AS-IS eseguibile e limiti;
- `docs/PROCEDURE_AUTHORITY_CONSTITUTION_C0_2026-08-19.md` — C0.1: root, fasi, authority, reentrancy e regole per le successive mutazioni delle procedure;
- `docs/ONTO_COMPLIANCE_HORIZON_V1.md` — contratto visuale/ontologico/epistemico e stop M/G bounded;
- `docs/VISUAL_GRACE_LEXICAL_EPISTEMIC_AUDIT.md` — lessico canonico, grazia visuale, prova delle Evidenze ICTC e stop M+10000;
- `docs/PROJECT_TRAJECTORY.md` — storia delle generazioni, non autorità runtime;
- `docs/PR60_GLOBAL_DOD.md` — convergenza Journey 2.1 già materializzata, mantenuta come lineage/regressione;
- `SECURITY.md` — boundary e responsabilità di deployment.

La documentazione storica rimane utile per tracciabilità progettuale, ma in caso di conflitto l'autorità corrente è quella dichiarata in `docs/authority-matrix.yaml` e verificata dai gate eseguibili.
