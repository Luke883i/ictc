# ICTC

ICTC è un sistema operativo di compliance per registrare lavoro, decisioni, evidenze e relazioni attraverso **sette procedure aziendali bounded**, mantenendo separati fatti registrati, proposte AI, review umane e conclusioni che richiedono autorità esterna.

ICTC non è una certificazione, un parere legale, un auditor autonomo né un security perimeter. Un controllo presente, un mapping, un hash o un receipt non dimostrano da soli conformità, applicabilità, efficacia o sufficienza probatoria.

## Il prodotto, oggi

La navigazione canonica è **Home / Processi / Postura Standard & Security ICTC**. Da Processi, admin e auditor possono inoltre aprire **EP-01 · Reticolo epistemico**, una meta-procedura trasversale che non diventa un ottavo processo business.

Le sette procedure sono:

| Codice | Procedura | Oggetto operativo |
|---|---|---|
| RN-01 | Monitoraggio normativo | monitoraggi, fonti, requisiti e decisioni di fonte |
| EC-01 | Eventi e segnalazioni | fatti originari, chiarimenti, formulazioni e stato evento |
| AO-01 | Inventario | sistemi e oggetti nel perimetro |
| MC-01 | Controlli e copertura | standard, requisiti e proposte di mapping |
| AP-01 | Azioni correttive | azioni, owner, scadenze e stato |
| RC-01 | Rischi compliance | rischi, valutazioni e trattamento |
| AR-01 | Questionari e verifiche | casi di assurance, domande, risposte e review |

Ogni procedura può creare un record iniziale compatibile in un'altra procedura tramite il contratto cross-procedure, senza bypassare RBAC, policy o normalizzatore del target.

## Come leggere ICTC

L'esperienza distribuisce la complessità in strati. La superficie operativa mostra prima ciò che serve per agire; contesto, tracciabilità, dati raw e limiti sono disponibili tramite disclosure progressive. Le transizioni visuali sono un enhancement: stato, History e semantica della navigazione restano indipendenti dal movimento e rispettano `prefers-reduced-motion`.

**Postura Standard & Security ICTC** risponde, in quest'ordine, a tre domande: cosa è osservabile, quale evidenza manca, cosa ICTC non conclude. Decisioni, runtime, requisiti esterni di deployment, riferimenti ed export sono livelli successivi.

**EP-01 · Reticolo epistemico** presenta la stessa proiezione revision-bound in tre modi: `Esplora`, `Flat / raw`, `Proto-grafo`. In Esplora il percorso è **Quadro → Gruppi → Relazioni → Atomo**. Le letture AI restano visivamente e semanticamente separate dai record business.

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

Richiede Node.js 22 o successivo.

```bash
npm ci
./ictc.sh start --no-open
```

Il server ascolta normalmente su `127.0.0.1:4173`. Un bind di rete richiede le condizioni di sicurezza previste dal runtime; TLS e protezione del deployment restano responsabilità dell'operatore.

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
node v3/authority-contract-check.mjs
node v3/docs-command-contract-check.mjs
```

I journey browser server-backed e gli artifact commit-bound sono eseguiti in GitHub Actions sullo stesso HEAD della PR. I saturation test producono evidenza bounded sullo spazio generato; non provano l'assenza universale di difetti.

## Identità della candidate

`v3/release-identity.json` è la fonte cross-documenti. Le dimensioni restano separate perché descrivono contratti diversi:

- package: `1.8.0`;
- semantica: `1.2-market-candidate`;
- esperienza: `1.9-experience-candidate`;
- refinement: `1.9.1-pre-candidate`;
- profilo epistemico: `2.0-epistemic-lattice-pre-candidate`;
- journey/convergenza: `2.1-procedure-journey-semantic-exploration-pre-candidate`.

## Sviluppo e documentazione

**Se è la prima volta nel repository, parti da `docs/START_HERE.md`.** È una mappa verso gli owner correnti, non una nuova autorità.

Prima di cambiare un'autorità leggere `AGENTS.md` e `docs/authority-matrix.yaml`. Le guide operative principali sono:

- `docs/START_HERE.md` — percorso minimo per orientarsi senza ricostruire la storia delle PR;
- `docs/DEVELOPMENT.md` — sviluppo locale e flusso PR;
- `docs/TESTING.md` — suite e falsificatori;
- `docs/11_ARCHITECTURE.md` — AS-IS eseguibile e limiti;
- `docs/PROJECT_TRAJECTORY.md` — storia delle generazioni, non autorità runtime;
- `docs/PR60_GLOBAL_DOD.md` — convergenza e Definition of Done della candidate;
- `SECURITY.md` — boundary e responsabilità di deployment.

La documentazione storica rimane utile per tracciabilità progettuale, ma in caso di conflitto l'autorità corrente è quella dichiarata in `docs/authority-matrix.yaml` e verificata dai gate eseguibili.
