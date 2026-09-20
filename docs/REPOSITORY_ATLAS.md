# REPOSITORY ATLAS — come leggere ICTC

**ID:** ATLAS-0  
**Ruolo:** descrizione canonica della forma del repository e protocollo di orientamento per engineer.  
**Non è:** product authority, runtime authority, release authority, roadmap o live mirror di GitHub.

ICTC è un repository atipico: codice applicativo, contratti semantici, owner map, falsificatori, regression oracle, documenti di lineage e prove di CI convivono nello stesso albero. Il numero di file, i suffissi di versione e la recenza di un documento non indicano da soli cosa sia corrente.

## Reticolo di lettura

| Livello | Domanda | Fonte principale | Regola |
|---|---|---|---|
| L0 · Root | Che cos'è ICTC e quali limiti ha? | `README.md` | massimo orientamento, minimo dettaglio |
| L1 · Atlas | Che tipo di repository sto guardando e come lo devo leggere? | questo documento | spiega la forma, non sostituisce gli owner |
| L2 · Authority | Chi possiede questa classe di verità? | `docs/START_HERE.md`, `docs/authority-matrix.yaml`, `docs/documentation-manifest.json` | route-by-question, non route-by-recency |
| L3 · Executable | Dove viene prodotto davvero l'effetto? | `v3/server.mjs`, `v3/store.mjs`, `v3/runtime/`, `v3/public/`, owner specifici | codice/runtime prevalgono sulle descrizioni storiche |
| L4 · Evidence & lineage | Perché esiste, come viene falsificato, cosa resta non provato? | `docs/TESTING.md`, `docs/DEVELOPMENT.md`, `docs/PROJECT_TRAJECTORY.md`, PR/CI GitHub | prova e storia non diventano automaticamente authority |

## Classi di verità

| Classe | Owner / fonte | Da non confondere con |
|---|---|---|
| live Git facts | Git/GitHub: branch, HEAD, PR, check correnti | snapshot committato o testo di una PR |
| product intent | `docs/PRODUCT.md` | README, roadmap o prompt |
| architecture AS-IS | `docs/11_ARCHITECTURE.md` + runtime eseguibile | TO-BE o benchmark |
| release identity | `v3/release-identity.json` | package lineage o label UI |
| documentation routing | `docs/START_HERE.md` + manifest | data del file |
| development planning | `docs/convergence/convergence-authority.json` | live merge pointer |
| history / rationale | `docs/PROJECT_TRAJECTORY.md` + Git/PR history | current runtime truth |
| external evidence | E3/E4 human, governance, deployment | test repository o CI verde |

Quando due fonti sembrano discordare, non usare "più recente" come criterio generale. Identifica prima la classe di verità, poi il suo owner.

## Specificità da conoscere prima di leggere il codice

1. **Sette processi, non otto.** EP-01 è trasversale e non è un business process.
2. **Registrare non significa concludere.** `observed`, `proposed`, `decided`, evidence, mapping, closure e assurance restano semanticamente distinti.
3. **Standard runtime e enterprise substrate sono distinti.** Il percorso standard usa RuntimeStore/SQLite; C3 contiene un substrate PostgreSQL per il runtime orizzontale. L'uno non prova automaticamente l'altro.
4. **Public DEMO non è deployment standard.** È una eccezione sintetica, anonima e read-only con boundary dedicata.
5. **Le versioni nel nome dei file non sono un resolver di authority.** Molti file restano come lineage, compatibility o regression oracle.
6. **Mutation/saturation misurano sensibilità del modello dichiarato.** Il volume dei trial non è probabilità di correttezza, deployment assurance o studio umano.
7. **CI verde non auto-certifica il mondo esterno.** Branch protection, IdP, scanner, collector, HA, operabilità e comprensione umana richiedono evidenze distinte.

## Metodo ingegneristico

Il workflow operativo è posseduto da `docs/DEVELOPMENT.md`. In forma compressa:

`observe -> bound -> owner -> falsifier -> minimal change -> adversarial mutation -> exact-head evidence -> human merge`

La slice è **semantica**, non semplicemente un gruppo di file. Una modifica preferisce l'owner esistente; un nuovo layer richiede evidenza che nessun owner corrente possa assorbire la responsabilità senza creare ambiguità.

Il pattern storico produttivo è:

`expansion -> falsification -> compression -> new capability`

La storia e gli anti-pattern sono in `docs/PROJECT_TRAJECTORY.md`.

## Perché i workflow hanno questa forma

I file in `.github/workflows/` sono **canali eseguibili di evidenza**, non servizi applicativi e non authority equivalenti. La loro stratificazione riflette failure family nate in epoche diverse e ambienti che conviene mantenere isolati.

| Classe | Perché esiste | Come leggerla |
|---|---|---|
| convergenza corrente | esercita semantic/runtime/browser/launcher sul candidato corrente | produce leaf evidence sulla HEAD, ma non possiede la release identity |
| rail specializzata / regression oracle | conserva una failure family, un ambiente o una prova costosa/specifica | il nome può essere storico; se gira sulla HEAD corrente prova quella HEAD, non riattiva una vecchia release |
| diagnostica | raccoglie informazione utile senza diventare blocker | i check `diagnostic /` sono riportati ma non entrano nel verdetto required |
| aggregazione exact-head | osserva i check dello stesso SHA e ne pubblica il verdetto stabile | `ictc/actions-census` è il singolo aggregate status authority; i leaf restano la provenance del failure |
| post-merge evidence | riesegue evidenza sul commit entrato in `main` | è separata dalla pre-merge acceptance perché il merge produce un nuovo SHA |

Perciò **molti workflow non significano molte autorità di merge**. Alcuni workflow sono required leaf quando il loro trigger si applica, altri sono diagnostici, altri esistono solo su `main` o su dispatch. Non tutti girano a ogni evento. Il conteggio dei file workflow è una fotografia volatile e non va fissato nella documentazione come metrica di maturità o complessità.

La topologia evita anche un mega-workflow unico: le prove restano isolate per ambiente e failure family, mentre l'aggregazione avviene dopo, sullo stesso SHA. `GOV-01F` osserva provenance e gate exact-SHA come controllo compensativo; non crea branch protection server-side.

## PR come slice semantica: il loop same-SHA

Una PR ICTC è una **unità di esecuzione semantica bounded**: può toccare uno o molti file, e può essere runtime, test, governance o documentazione, ma deve avere una responsabilità falsificabile unica.

```text
utente/agente formula la slice
        ↓
branch dedicato → commit Hn
        ↓
PR descrive intent / owner / boundary
        ↓
GitHub esegue leaf e rail applicabili su Hn
        ↓
ictc/actions-census osserva gli stessi check di Hn
        ↓
failure → nuova modifica → Hn+1 → il verde di Hn diventa genealogia
        ↓
required exact-head convergenti
        ↓
merge umano/autorizzato
        ↓
main riceve Mn → post-merge evidence su Mn
```

L'**utente-agente orchestra esternamente** questo ciclo: legge Git/GitHub, propone/modifica la candidate head, interpreta i failure e decide quando chiedere nuova evidenza. Non è CI authority, non assegna da sé il verde e non acquisisce merge authority. GitHub esegue e registra i check; il repository definisce i contratti; il merge resta un'azione umana/autorizzata.

Questo è un **repository execution loop**, non il runtime applicativo ICTC. “Same-SHA” significa che le evidenze usate per accettare una PR devono riferirsi alla stessa HEAD candidata. Un nuovo commit crea un nuovo SHA e riapre l'accettazione; il merge commit su `main` è un altro SHA e viene osservato separatamente.

## Perché restano molti branch

Un branch Git è un **puntatore nominato e mutabile** a un commit. La fotografia immutabile è lo SHA; il branch è l'etichetta accanto alla fotografia.

Per leggere i branch residui, il modello più utile è:

```text
t-3        t-2        t-1        t0
H3         H2         H1         main
↑          ↑          ↑
branch     branch     branch
(label)    (label)    (label)
```

Molti branch storici possono quindi essere letti come segnalibri di candidate state precedenti. Non sono automaticamente lavoro attivo, current authority o debito. Alcuni nomi `scratch`, `tmp` o `noop` sono residui di test/tooling e **non devono ricevere significato semantico**. Uno stesso branch può anche essere riutilizzato e avanzare: per la fotografia storica precisa usare sempre il PR head SHA / commit graph, non il nome del branch.

La retention del branch è opzionale: eliminare un branch dopo il merge non elimina la storia canonica già conservata da commit e PR. Mantenerlo può aiutare l'archeologia; cancellarlo può ridurre rumore. In entrambi i casi `main` e gli owner correnti restano la fonte per l'AS-IS. Anche il numero di branch è quindi una fotografia volatile, non un KPI.

## Debito di coerenza del repository — D-RSC

Il runtime core può essere più coerente della sua meta-descrizione. ICTC tratta questo scarto come **Repository Semantic Coherence Debt (D-RSC)**: drift o ambiguità fra authority dichiarate, documentazione/API current, governance evidence ed executable owner. La proiezione machine-readable è `v3/semantic-owner-contract.json#repositoryCoherenceDebt`; non è un secondo gap register, una roadmap o una runtime authority.

| Finding | Stato nella candidate ATLAS-1 | Significato / closure |
|---|---|---|
| F1 · authority-map fossilization | resolved-in-candidate | `ui_wiring` e `schemas` sono ora esplicitamente `legacy-lineage-debt`; i current owner restano v3/UI/API runtime |
| F2 · current-doc semantic drift | resolved-in-candidate | README/START_HERE sono riallineati a Home max 3 e Process Hub one-row-per-procedure |
| F3 · OpenAPI semantic freshness | resolved-in-candidate | `/api/demo/evidence-lattice` descrive Suite 3.0; 2.2 resta deprecated generator lineage |
| F4 · PR declaration/diff mismatch | mitigated-open | il template richiede coerenza fra dichiarazione di trajectory/workbook e diff reale; il precedente storico non viene riscritto |
| F5 · preventive server governance | blocked-external | resta `GAP-022 / E3-GOV`; GOV-01F è compensating e non può auto-creare branch protection |
| F6 · security evidence bounded | evidence-bounded | CodeQL conta solo se eseguito con successo sulla exact SHA; `skipped` resta “not executed” e non invalida per osmosi gli altri rail required |
| F7 · legacy tooling residue | open | script/literal legacy vanno ritirati o marcati senza scambiarli per runtime corrente |
| F8 · freshness ≠ semantic consistency | in-remediation | freshness digest rileva cambiamento, non accordo fra owner; il documentation runtime aggiunge falsificatori per le failure family oggi note |

**Regola:** `fresh` è necessario, non sufficiente. Una proiezione current deve anche essere confrontata con l'executable owner della semantica che descrive. Una route HTTP presente non rende automaticamente fresca la sua descrizione OpenAPI.

### Negative controls dell'audit

L'audit corrente non ha trovato, nella superficie osservata, una seconda business write authority, un ottavo processo, un AI decision path autonomo, un evidente quarantine bypass, un selector cross-tenant non membership-bound, un export che allarghi RBAC o un percorso standard che promuova il benchmark PostgreSQL a production proof. Questi sono **bounded observations**, non prove formali di assenza: una nuova failure family o un nuovo path deve poterle riaprire.

D-RSC non ingloba i rail esterni: E3-HUMAN, E3-GOV ed E4-DEPLOY restano esterni. In particolare F5 è un link al GAP-022 canonico, non un duplicato.

## Inferenza assistita da AI

Un AI assistant può accelerare software archaeology, dependency tracing, confronto di authority, mining delle PR e falsificazione di ipotesi. Il suo output resta un'analisi/proposta, non repository authority.

Per inferire **lo stato corrente** del repository, il minimo connettore esterno raccomandato è un **GitHub connector in sola lettura** con accesso almeno a:

- default branch e HEAD;
- contenuti del repository;
- PR e commit history;
- check/status correnti quando si fanno claim di accettazione.

La sequenza iniziale consigliata è:

1. risolvere `main` e la sua HEAD da Git/GitHub;
2. leggere `README.md` -> questo Atlas -> `docs/START_HERE.md`;
3. risolvere l'owner della domanda tramite authority matrix/manifest;
4. ispezionare owner eseguibile e falsificatore più vicino;
5. usare PR/history per spiegare il *perché*, mai per sovrascrivere l'AS-IS;
6. separare fatti osservati, inferenze, debito e proprietà esterne non verificabili.

Write access, creazione PR e merge **non sono necessari** per la comprensione del repository. Se il connector GitHub non è disponibile, l'assistente può lavorare su un checkout locale ma deve dichiarare non verificati i live Git facts.

## Trappole ricorrenti

- `latest file` != `current authority`;
- `PR body` != `main`;
- `version suffix` != `runtime profile`;
- `hash/receipt` != `external authenticity`;
- `mutation count` != `correctness probability`;
- `workflow present` != `server-side enforcement`;
- `C3 implemented` != `standard runtime migrated`;
- `browser/CI evidence` != `representative-human or deployment evidence`.

## Dove andare dopo

- Devi **capire il prodotto**: [PRODUCT](PRODUCT.md).
- Devi **capire il runtime**: [Architecture](11_ARCHITECTURE.md), poi `v3/server.mjs`.
- Devi **modificare qualcosa**: [START_HERE](START_HERE.md).
- Devi **capire chi possiede una semantica**: [Authority matrix](authority-matrix.yaml).
- Devi **capire perché il repo è arrivato qui**: [Project trajectory](PROJECT_TRAJECTORY.md).
- Devi **capire come si sviluppa**: [Development](DEVELOPMENT.md).
- Devi **capire cosa prova un test**: [Testing](TESTING.md).
- Devi **capire release e profilo corrente**: `v3/release-identity.json`.
- Devi **capire security/deployment boundary**: `SECURITY.md` e gli owner runtime indicati dalla authority matrix.

## Claim boundary

ATLAS-0 possiede soltanto la descrizione della **forma del repository e del protocollo di lettura**. Non duplica né amplia product, runtime, security, release, convergence o legal/compliance authority. I live Git facts restano di Git/GitHub; history e PR restano lineage; E3/E4 restano evidenze esterne.
