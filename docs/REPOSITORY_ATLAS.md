# REPOSITORY ATLAS — come leggere ICTC

**ID:** ATLAS-0  
**Ruolo:** descrizione canonica della forma del repository e protocollo di orientamento per engineer.  
**Non è:** product authority, runtime authority, release authority, roadmap o live mirror di GitHub.

ICTC è un repository atipico: codice applicativo, contratti semantici, owner map, falsificatori, regression oracle, documenti di lineage e prove di CI convivono nello stesso albero. Il numero di file, i suffissi di versione e la recenza di un documento non indicano da soli cosa sia corrente.

## Mappa fisica minima e DoD engineer-first (AS-IS)

ICTC mantiene **tre oggetti distinti** nello stesso repository: **prodotto** (valore, sette processi e limiti, posseduti da [PRODUCT](PRODUCT.md)); **software** (interfacce, API, autorizzazioni e dati, posseduti dagli [owner architetturali](11_ARCHITECTURE.md) e dal runtime eseguibile); **repository** (sorgenti, workflow, documentazione, review e provenienza, descritti qui e instradati da [START_HERE](START_HERE.md)). Una CI verde prova il proprio perimetro, non la compliance, una validazione umana o il deployment.

| Collocazione | Lettura standard o peculiarità esplicita | Fonte da consultare |
| --- | --- | --- |
| `README.md`, `package.json`, `package-lock.json`, `ictc.sh`, `CHANGELOG.md` | Front door, npm, launcher locale e cronologia release **restano nella root**: sono ingressi pubblici, non scarti. Il precedente shim `ictc-v3.sh` è stato ritirato dal tree corrente; `ictc.sh` resta il supervisor locale canonico. Il suo eventuale ritiro richiede parità di `start/stop/restart/status/logs/doctor/test/audit` e consumer esterni qualificati. | [DEVELOPMENT](DEVELOPMENT.md), [RELEASE](RELEASE.md) |
| `LICENSE`, `LICENSE.md`, `NOTICE.md`, `GOVERNANCE.md`, `SECURITY.md`, `CONTRIBUTING.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md` | Metadati e policy convenzionali. `LICENSE` contiene la licenza MIT; `LICENSE.md` è soltanto un puntatore informativo. `.github/CODEOWNERS` è l'unico file di regole; il puntatore duplicato `CODEOWNERS` in root è stato ritirato. | [Termini](OPEN_SOURCE_TERMS.md), [governance](../GOVERNANCE.md) |
| `v3/`, `v3/public/`, `v3/runtime/` | Software corrente e molti verificatori/fixture **coesistono** nella directory versionata: il nome `v3` non rende automaticamente legacy il contenuto. | [ARCHITECTURE](11_ARCHITECTURE.md), `v3/README.md` |
| `scripts/`, `schemas/`, `.github/workflows/`, `.github/CODEOWNERS` | Strumenti, contratti, automazione e regole di review; i controlli applicabili sono legati alla **exact PR HEAD**. | [TESTING](TESTING.md), [START_HERE](START_HERE.md) |
| `docs/`, `ai/`, `AGENTS.md` | Documentazione corrente e lineage, più assistenza AI facoltativa. I prompt non sono prerequisito dell'onboarding umano né authority di prodotto. | [Documentazione](DOCUMENTATION_STANDARD.md), [START_HERE](START_HERE.md) |
| `v1/`, `app/`, `lib/`, `data/`, `audit/` | Substrati misti: compatibilità, prototipi, seed, strumenti, prove e storia; **non** cancellare sulla base del path, del nome o di un grep vuoto. La vecchia directory tracciata `runtime/blobs/` conteneva soltanto `.gitkeep`, ora ritirato: il blob store crea la root a runtime e l'archiviazione persistente corrente risiede sotto `.ictc/` (salvo override). | [Policy di preservazione](DOCUMENTATION_STANDARD.md) |
| `.devcontainer/`, `.env.example`, `.nvmrc`, `.editorconfig`, `.gitignore` | Ambiente, configurazione esemplificativa e convenzioni di sviluppo; non sono evidenza di un deployment reale. | [CONFIGURATION](CONFIGURATION.md) |

**Reticolo di accettazione, non nuova authority.** Il DoD engineer-first è la congiunzione di: **G-P** identità e limiti del prodotto ricostruibili; **G-S** software avviabile e falsificabile; **G-R** topologia e owner intelligibili; **G-M** modifica minima e rollback dimostrabili; **G-E** verifiche exact-head e governance/human evidence appropriate. Il [percorso operativo](DEVELOPMENT.md) esercita G-S e G-M, [PRODUCT](PRODUCT.md) possiede G-P, questo Atlas e [START_HERE](START_HERE.md) orientano G-R, mentre [TESTING](TESTING.md) e [GOVERNANCE](../GOVERNANCE.md) delimitano G-E. La presenza della mappa **non promuove** alcun DoD a PASS: servono run, ricevute e, dove previsto, test con ingegneri senza preconoscenza.

**Eccezioni/stop condition:** il manifest non elenca necessariamente ogni file tracciato; una PR merged non è una release; il controllo compensativo GOV-01F non impone branch protection server-side; nessun rename o safe-delete è richiesto soltanto per uniformare i nomi. Prima di spostare file, identificare consumer statici, dinamici, URL e rollback. I dettagli di questi obblighi restano negli owner esistenti, non in un nuovo inventario normativo.


## Percorso di lettura in tre minuti

Il lettore non deve ricostruire la cronologia delle PR per sapere dove intervenire. Si procede in ordine: **prodotto** (`PRODUCT.md`) → **software** (`11_ARCHITECTURE.md`, `v3/bootstrap.mjs`, `v3/server.mjs`) → **repository** (`START_HERE.md`, `authority-matrix.yaml`) → **falsificatore** (`TESTING.md`) → **ricevuta exact-head**.

| Obiettivo operativo | Radice canonica | Prima controprova | Stato da non inferire |
| --- | --- | --- | --- |
| Cambiare testo/layout visibile | `v3/public/` + owner C5 | percorso `ui` di `START_HERE.md` | una screenshot non prova usability |
| Cambiare API o permessi | `v3/server.mjs`, `docs/openapi.yaml` | percorso `api` | OpenAPI non prova invocazione E2E |
| Cambiare persistenza | `v3/store.mjs`, SQLite | percorso `persistence` e riapertura | HTTP 200 non prova integrita al riavvio |
| Modificare test o workflow | `tests/`, `v3/*-check.mjs`, `.github/workflows/` | `TESTING.md`, CI su SHA esatto | un workflow non e branch protection |
| Rimuovere un file storico | owner dichiarato e consumer statici/dinamici | rimozione reale in sandbox e rollback | zero import non prova inutilizzo |

Per il **primo task completo**, seguire l'[esercizio di manutenzione](DEVELOPMENT.md) prima di consultare la stratigrafia storica. Questo Atlas descrive la forma: non sostituisce alcun owner.

## Razionalizzazione e archiviazione: decisioni basate sui consumer

Il principio **storicamente valido + integro + disallineato** è un *trigger di riesame*, non una licenza di eliminazione. Il [Documentation Standard](DOCUMENTATION_STANDARD.md) mantiene la regola fail-closed; il registro resta il manifest esistente, non una seconda lista di verità.

| Superficie da riesaminare | Osservazione sul main del 4 novembre 2026 | Decisione attuale |
| --- | --- | --- |
| `ai/ictc-agent-bundle/` | Handoff sigillato PR #8; integrity/selftest sono prove storiche, doctor usa riferimenti obsoleti; il contratto corrente produce una diagnosi separata | **HOLD_CONSUMERS**; [guida storica e comandi correnti](AI_AGENT_BUNDLE.md); preservare sorgente sigillato e verificare consumer prima del ritiro |
| `scripts/repository-contract.mjs` | Il contratto originario richiedeva `server.mjs` root, due workflow assenti e npm script storici | Riparazione mirata per verificare i current owner; legacy resta diagnostica |
| `scripts/schema-check.mjs`, `scripts/ui-wiring-check.mjs`, `scripts/verify.mjs` | **C1-2 · Legacy tooling / F7**: check storici; il primo verifica seed/schema legacy, il secondo richiede `server.mjs` root mancante, il terzo confronta release e domain storici. La sorgente `v3/runtime/model.mjs` riporta `services:2`, mentre `v3/server.mjs` imposta `projected.experience.services=7` nella proiezione HTTP. | **HISTORICAL_DIAGNOSTIC_HOLD_CONSUMERS**: non sono attivati dagli npm script current né dai workflow come comandi standalone; `scripts/repository-contract.mjs` li censisce e rifiuta una promozione silenziosa. Nessuna cancellazione o certificazione runtime; la raggiungibilità dinamica/esterna resta sconosciuta. |
| `app/`, `lib/`, `v1/` | Codice di compatibilità e verificatori possono ancora leggerli | **HOLD_CONSUMERS**, niente rename/cancellazione indiscriminata |
| Fixture DEMO Suite 2.2 | La DEMO 3.0 può ancora leggerle per regressione | **PRESERVE_COMPATIBILITY** |
| `audit/` e lineage Git storica | I contratti audit attivi rimangono nel tree. Cinque ricevute di campagna `MAIN115` e i due file `dist/` di handoff generato sono conservati negli oggetti della [preimage Git immutabile](https://github.com/Luke883i/ictc/tree/26ac705e331511fe1d8f1db93b8167ad795e506a), non duplicati nel working tree corrente. Il bundle sigillato PR #8 resta invariato sotto `ai/ictc-agent-bundle/`; la generazione output avviene sotto `artifacts/`. | **RETIRE_PHYSICAL_CANDIDATE**, con prova CI exact-head e review di consumer esterni ancora richiesta. Nessuna inferenza di eliminabilità per altri audit/legacy. |
| `v3/public/grc-v2.css` e `grc-workspace.css` | Duplica CSS byte-identici; il secondo ha un import corrente osservato | **HOLD_PUBLIC_URL** per il primo; nessuna delete senza prova URL |

**C1-3c · Archeologia V2 verificabile, senza ritiro fisico.** I sei documenti campionati sono rimasti nei loro **percorsi pubblici originali**, con byte identici ai blob Git della rispettiva commit storica; il gate di ritiro già esistente ripete il confronto su tutta la cronologia locale. Le associazioni commit/PR sono osservazioni storiche di GitHub, non una nuova fonte di autorità né certificazioni CI delle relazioni PR. Perché questi file esistono:

| Provenienza storica osservata | Documenti originali preservati | Ruolo, da non promuovere a AS-IS |
| --- | --- | --- |
| PR [#1](https://github.com/Luke883i/ictc/pull/1) | [Validation report v2](23_VALIDATION_REPORT_V2.md), [Blueprint v2](24_BLUEPRINT_V2_ITALIANO.md) | Evidenza della foundation/beta e del progetto originario; non sostituisce [architettura corrente](11_ARCHITECTURE.md). |
| PR [#2](https://github.com/Luke883i/ictc/pull/2) | [Saturazione v2](17_SATURATION_V2.md) | Perimetro e limiti del primo ciclo; non certifica saturazione attuale. |
| PR [#46](https://github.com/Luke883i/ictc/pull/46) | [Convergenza GRC V2](V2_GRC_CONVERGENCE.md), [DoD GRC V2](V2_GRC_DOD.md) | Disegno e acceptance storica del layer GRC; le checkbox storiche non provano il prodotto corrente. |
| PR [#59](https://github.com/Luke883i/ictc/pull/59) | [Reticolo epistemico V2.0](V2_0_EPISTEMIC_LATTICE_CONVERGENCE.md) | Decisioni di progettazione EP-01; la vista attuale è definita dai [current owner](PRODUCT.md). |

Il reticolo di accettazione è **origine Git + ruolo e autorità + conservazione integrale + consumer + rollback + falsificazione + governance** (AND, non media). Il classificatore concede al massimo una **archiviazione logica presso lo stesso path** quando la lineage risulta verificata; mantiene `HOLD_REVIEW` per ogni decisione fisica, con URL esterne, consumo dinamico, retention e owner umani non dimostrati. `scripts/document-retirement-gate-check.mjs --falsify` emette le ricevute e rifiuta origine alterata, falsi permessi di cancellazione e modifiche fisiche in copie temporanee; il [Documentation Standard](DOCUMENTATION_STANDARD.md) conserva la regola normativa. Nessun file viene rinominato, spostato o cancellato da questa slice.

Una classificazione attuale non si propaga per somiglianza: consumer statici, caricamenti dinamici, URL, workflow, test di regressione, provenienza, rollback e review vanno qualificati **per singola sacca**. L'assenza di import non è assenza di consumer esterni. La struttura fisica cambia solo dopo queste prove e senza nuovi owner.

### C1-3d · Separazione fisica verificabile: primo gruppo TRAMA

La prima migrazione **di implementazioni** riguarda sei verificatori e **non** il runtime di produzione: i byte applicativi di controllo escono dal primo livello di `v3/` e sono concentrati in `v3/tests/`; i vecchi path restano adapter `import` di una riga, senza una seconda logica. `scripts/test-boundary-migration-check.mjs --falsify` vincola le sei implementazioni ai blob sorgenti di `preimage commit dcf90ae2 (non current-main authority)`, ammettendo soltanto modifiche di profondità nei riferimenti relativi. La workflow TRAMA exact-head esercita i vecchi ingressi e produce `artifacts/c1-3d-test-boundary.json`; il rollback è il revert dei commit di migrazione.

**Denominatore e metriche al preimage:** 1.419 file Git, 1.044 in `v3/`, 678 al suo primo livello; 447 nomi compatibili con una possibile funzione di test/verifica, **non** 447 file già qualificati spostabili. I sei originali totalizzano 63.079 byte, gli adapter circa 824 byte: la riduzione prevista del *payload di implementazione direttamente in `v3/`* è 62.255 byte, mentre i 678 path di primo livello restano disponibili. La nuova directory aggiunge sei file tracciati e il verificatore ne aggiunge uno: **il numero totale di file aumenta**, non diminuisce. I 441 candidati rimanenti necessitano qualificazione individuale, test rappresentativi e riesame degli entrypoint esterni.

**DoD locale = separazione reale AND compatibilità dei comandi AND identità semantica del sorgente AND falsificazione fisica AND reversibilità AND CI exact-head.** Questa migrazione può chiudere il solo gruppo TRAMA; non chiude l'intera C1-3d né autorizza l'eliminazione degli adapter. La componente CI del lavoro rimane nel perimetro C1-3e. Documento normativo: [Documentation Standard](DOCUMENTATION_STANDARD.md); istruzioni operative: [v3/README](../v3/README.md) e [Testing](TESTING.md).


### C1-3d · Tranche post-#256 — quattro famiglie ulteriori

Il successivo gruppo **non estende il runtime**: sette verificatori `gov-intent-assurance-*`, cinque `public-demo-*`, due `epistemic-lattice-*` e due `demo-suite-3-0-*` sono ricollocati in `v3/tests/`; gli originali in `v3/` restano adapter ESM stabili. La provenienza originale dei sedici file è il commit storico `14d39211e51a` della PR #256 (non puntatore live a main); i sei TRAMA precedenti restano vincolati alla distinta preimage `dcf90ae2`. Oltre alle correzioni degli import relativi, quattro controlli GOV richiedono l'adeguamento deterministico della root calcolata da `import.meta.url`. L'identità del sorgente trasformato, 44 alterazioni fisiche temporanee e sei confronti esecutivi old/new sono obblighi del **verificatore esistente**, non attestazioni automatiche di passaggio. Lavoro di runtime prodotto, decisioni, autorizzazioni, retention e consumer esterni sono esclusi dalla migrazione. Nessuna rimozione di adapter è autorizzata. Il DoD C1-3d globale e la contrazione CI C1-3e restano **OPEN**, così come le altre famiglie ancora non qualificate.

## Reticolo di lettura

| Livello | Domanda | Fonte principale | Regola |
|---|---|---|---|
| L0 · Root | Che cos'è ICTC e quali limiti ha? | `README.md` | massimo orientamento, minimo dettaglio |
| L1 · Atlas | Che tipo di repository sto guardando e come lo devo leggere? | questo documento | spiega la forma, non sostituisce gli owner |
| L2 · Authority | Chi possiede questa classe di verità? | `docs/START_HERE.md`, `docs/authority-matrix.yaml`, `docs/documentation-manifest.json` | route-by-question, non route-by-recency |
| L3 · Executable | Dove viene prodotto davvero l'effetto? | `v3/server.mjs`, `v3/store.mjs`, `v3/runtime/`, `v3/public/`, owner specifici | codice/runtime prevalgono sulle descrizioni storiche |
| L4 · Evidence & lineage | Perché esiste, come viene falsificato, cosa resta non provato? | `docs/TESTING.md`, `docs/DEVELOPMENT.md`, `docs/PROJECT_TRAJECTORY.md`, PR/CI GitHub | prova e storia non diventano automaticamente authority |

## Ingresso standard per ingegnere esterno (senza AI)

La conoscenza di ICTC **non è subordinata alla governance AI**. Un ingegnere enterprise con risorse illimitate può ricostruire ed esercire il prodotto mediante standard del software engineering, senza leggere prompt, conversazioni AI o workbook di traiettoria:

1. **Prodotto e installazione:** `README.md`, `docs/PRODUCT.md`, `docs/DEVELOPMENT.md`, `docs/CONFIGURATION.md`. Avvio con Node 22, `npm ci`, `./ictc.sh start --no-open`.
2. **Architettura verificabile:** `docs/11_ARCHITECTURE.md`, `docs/openapi.yaml`, `v3/bootstrap.mjs`, `v3/server.mjs`, `v3/store.mjs`, `v3/runtime/` e `v3/public/`; il PostgreSQL enterprise C3 ha owner distinti. Confrontare descrizioni e codice, senza chiamare reale una capacità soltanto progettata.
3. **Qualità, sicurezza e operatività:** `docs/TESTING.md`, `SECURITY.md`, `docs/OPERATIONS.md`, `docs/DATA_AND_STORAGE.md`, `.github/workflows/` e `.github/CODEOWNERS`; GitHub ruleset e production deployment sono prove esterne.
4. **Contribuzione:** `CONTRIBUTING.md`, review di diff, test e receipt exact-head. `docs/START_HERE.md` accelera l'orientamento per dominio, ma non sostituisce le interfacce standard sopra.
5. **Archeologia e deprecazione:** `npm run repo:inventory` genera `artifacts/repository-inventory.json` su tutto il tree Git tracciato; `npm run repo:retirement:mutations` testa la disciplina decisionale. I path senza prova non vengono cancellati o promossi implicitamente.

**Elementi atipici gestiti in forma standard:** molte centinaia di test specialistici e workflow sono una stratigrafia da misurare, non una giustificazione di release; documenti *lineage/TO-BE* non sono codice corrente; prompt e `AGENTS.md` sono regole per assistenti, non la costituzione necessaria alla lettura del prodotto; TRAMA, Bussola e workbook sono proiezioni di processo a authority zero. Gli owner runtime e i gate riproducibili restano ispezionabili con strumenti comuni (`git`, Node, SQL, HTTP, Actions). La traccia AI non conferisce un privilegio di interpretazione.

**Censimento non significa ritiro:** l'inventario attesta presenza, hash e classificazione di superficie; `document:unregistered` è una coda esplicita di esame, non sinonimo di allucinazione o obsolescenza. `software:candidate` e `verification:candidate` sono euristiche di path, non prove di esecuzione o di inutilità. Finché import dinamici, URL esterne, configurazioni, fixture, storia semantica e consumer terzi non sono esclusi mediante prove locali e indipendenti, ogni disposizione rimane `HOLD_*`. Nessun file è in quarantena fisica né dichiarato eliminabile da questo censimento. I documenti legali `LICENSE.md` e `NOTICE.md` e la configurazione di esempio `.env.example` sono radici di metadati esplicite nel contratto esistente: il fatto che non abbiano import di codice non è prova di inutilità.

## Audit ex novo: bias e controprove del primo ingresso

Il percorso standard è **Product → Software → Repository**. Le fonti sono owner e verificatori esistenti, non conversazioni AI. Questa è una verifica di leggibilità del repository, non una valutazione E3-HUMAN con ingegneri rappresentativi.

| Bias/errore tipico | Controprova | Limite |
| --- | --- | --- |
| Anchoring/authority halo del programma di ricerca | README apre con ICTC e instrada ai tre piani prima del contesto ROA | La presenza del link non prova comprensione umana |
| Automation bias o prerequisiti AI impliciti | CONTRIBUTING/DEVELOPMENT/START_HERE consentono la via non-AI; AGENTS è solo per agenti | La PR deve comunque rispettare CI e governance |
| Confirmation bias dai test verdi | Confrontare journey dichiarati con HTTP, persistenza, receipt e casi non attestati | CI non sostituisce E3/E4 |
| Proliferazione documentale = proliferazione delle autorità | Manifest registra authority/lifecycle; repository inventory censisce i file, separando HOLD da DELETE | I consumer esterni non sono esauriti dal grep |
| Normalcy bias operativo | Confrontare `npm start`, SQLite e identità locale con CONFIGURATION/SECURITY/OPERATIONS | Il deployment enterprise resta prova esterna |

Il percorso va verificato con un oracolo strutturale falsificabile e con un cold-start reale. Se il package registry è irraggiungibile o la review umana non è stata effettuata, dichiarare la prova incompleta invece di certificarla.

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

## Archeologia verificabile: PR, main e snapshot

Le PR sono **evidenza di traiettoria**, non la descrizione normativa del prodotto corrente. Per ciascuna candidate registrare: `PR #`, stato/merge SHA, base/head, file aggiunti/modificati/rimossi, owner coinvolti, motivazione, prove CI sulla exact HEAD, reversibilità e assorbimento nella fonte current. Il contenuto di una PR, anche merged, non prevale sull'owner eseguibile e sul contratto canonico del `main`. Un branch non è un identificatore temporale immutabile.

Nella fotografia GitHub del **2026-11-01**, risultano 234 PR chiuse, di cui 219 merged; la merged **#238** è il commit `b0150d60…`, con tree `7f12c222…`. Lo ZIP analizzato nelle fasi di audit precedenti aveva lo **stesso tree**, non necessariamente lo stesso file `.git` o lo stesso contesto di deploy. Questi numeri sono una ricevuta storica: per lo stato live rieseguire la ricognizione GitHub, non copiare il conteggio in un registry di autorità.

Tre tracce di co-cambiamento utili per l'analisi d'impatto: #235/#236 condividono cinque file Home, #233/#237 sette file Processi, #231/#232 sei file release. **Co-change è una probabilità di relazione da indagare**, non un arco `IMPORTS`, non una dipendenza attuale e non un vincolo permanente alla rimozione. Associare sempre alla PR il suo significato distinto: assorbimento, correzione, nuova capability, test, documentazione o retirement.

## Inferenza di raggiungibilità ed eliminabilità

Una mappa di dipendenze utile è un **multigrafo tipizzato**: `IMPORTS`, `CALLS`, `READS`, `DYNAMIC-LOADS`, `WORKFLOW-EXECUTES`, `STATIC-URL`, `EXTERNAL-ENTRY`, `DOCUMENTS`, `PROVES`, `CO-CHANGED`, `RETAINED-FOR-LINEAGE`. Ogni arco deve dichiarare **origine, target, metodo di estrazione, versione/HEAD, confidenza e controprova**. `MENTIONS` e `CO-CHANGED` sono indizi, non prova di raggiungibilità esecutiva. I file sotto `v3/public/` sono anche servibili via HTTP senza import statico: l'assenza di inbound nel grafo ESM è insufficiente.

La fixture `v3/runtime/demo-suite-2-2-fixture.mjs` carica dodici file `.b64` con nomi costruiti dinamicamente: un'analisi che vede zero archi statici può sbagliare l'inferenza di eliminabilità. Una rimozione simulata in checkout isolato ha prodotto `ENOENT`. La duplicazione byte-per-byte di due CSS non dimostra identità di contratti URL. Per trasformare un candidato in ritiro applicare il [contratto documentale](DOCUMENTATION_STANDARD.md): verificare ingressi esterni, generazione dinamica, storia/retention, diff semantico e controprove reali, poi la CI exact-head. Uno stato `UNKNOWN` blocca la delete massiva.

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
