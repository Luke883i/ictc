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
