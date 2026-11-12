# ICTC Documentation Standard

## Scopo

La documentazione ICTC deve consentire a un contributor che non conosce il prodotto di ricostruire rapidamente **identità → autorità → architettura → dominio → UI → test → review/release**, senza inferire quale documento storico sia ancora valido.

## Due dimensioni obbligatorie

Ogni documento registrato dichiara due assi indipendenti in `documentation-manifest.json`:

**Lifecycle**
- `current` — authority AS-IS;
- `operating` — istruzioni operative correnti;
- `policy` — regole repository/community;
- `lineage` — storia ed evidence di evoluzione;
- `source-input` — input originari, non AS-IS;
- `roadmap` — futuro intenzionale;
- `generated` — output derivato, mai authority hand-edited.

**Mode**
- `explanation` — contesto e ragioni;
- `how-to` — percorso operativo;
- `reference` — contratto consultabile;
- `policy` — regole normative del repository.

La separazione evita di confondere “perché esiste” con “cosa è authoritative oggi”.

## Registry e authority

- `docs/START_HERE.md` è l'entrypoint documentale canonico.
- `docs/documentation-manifest.json` è il registry machine-readable di lifecycle, mode, topic e assi di versione.
- `docs/authority-matrix.yaml` assegna gli owner sostanziali/eseguibili.
- Il manifest **non sostituisce** product, architecture, epistemic, UI o runtime authority.

La data più recente non conferisce autorità. PR, audit, DoD o prompt non diventano current perché contengono una formulazione più nuova: l'owner deve essere dichiarato e raggiungibile dalla mappa canonica.

## Inventario Git e quarantena logica (distinti dal manifest)

`npm run repo:inventory` produce una **ricevuta derivata** in `artifacts/repository-inventory.json`: ogni path tracciato da Git ha hash SHA-256, dimensione, categoria, fonte della classificazione, stato di utilizzo proiettato da `repositoryPurposeCensus()` e disposizione conservativa. Questa ricevuta non possiede alcuna authority né sostituisce il manifest dei documenti. Il numero di documenti non registrati è un debito di classificazione, non una prova di superfluità.

- `PROTECT_AUTHORITY`: documento dichiarato authoritative nel manifest; conservazione obbligata.
- `PRESERVE_REGISTERED`: documento registrato e non authoritative; preservare la lineage o gli obblighi associati.
- `HOLD_CONSUMERS`: software/test/workflow plausibilmente consumato; non si dichiara assenza di consumer dal nome.
- `HOLD_REVIEW`: funzione non adeguatamente provata; nessuna eliminazione/quarantena automatica.

Per passare da `HOLD` a proposta di ritiro occorrono prova dei consumer statici/dinamici, API/URL pubbliche, workflow, fixture, storia delle PR, compatibilità, owner e rollback. Una successiva review deve comprovare la conservazione semantica e ripetere i test con il file realmente tolto in un checkout isolato. La sola presenza di un'etichetta come `legacy`, `AI`, `generated` o di un import zero non prova eliminabilità. La **quarantena logica** è una classe di revisione; non rinomina né interrompe i consumer.

Le mutazioni di `repo:retirement:mutations` verificano un oracolo di dodici obblighi in memoria: 10M trial e 1M falsificazioni negative non sono 10M patch applicate al repository e non certificano la cancellabilità dei singoli file.

## Residuo post-#275: DoD retrogrado e confini di prova

**G-QUAL**: il repository migrato e verificabile senza etichette di funzione generiche,
senza documenti invisibili al manifest, senza una nuova authority o eliminazioni inferite dal nome.
Questa e una **DoD di qualificazione delle informazioni**, non una dichiarazione di
completezza della sicurezza, del deployment o dell'assenza di consumer esterni.

| Predicato necessario | Witness verificabile | Quando e FAIL |
| --- | --- | --- |
| Q1 · Denominatore Git stabile | `git ls-files`, `npm run repo:inventory` | path perso, `v3/` riapparsa, receipt differente |
| Q2 · Root semantica, 13/13 | `scripts/repository-inventory.mjs` classi esplicite | `repository:other` o `SAFE_DELETE` su contratti, launcher o policy |
| Q3 · Documenti, 151/151 | `docs/documentation-manifest.json`, `npm run docs:check` | file non registrato, lifecycle assente o authority promossa |
| Q4 · Retention non equivale a ritiro | gate documentali preesistenti sul cohort `post275-residual` | consumer omesso, blocco trasformato in permesso di cancellazione |
| Q5 · Mutazioni e falsificatori | `npm run docs:saturation`, `npm run repo:inventory:falsify` | classe falsa accettata, survivor non riportato |
| Q6 · Software e CI exact-HEAD | `npm test`, workflow GitHub sulla stessa SHA | fallimento, test incompleto o prova da SHA precedente |

**Reticolo**: G-QUAL = Q1 AND Q2 AND Q3 AND Q4 AND Q5 AND Q6.
Q3 dipende dall'esistenza fisica della fonte, dal lifecycle distinto dalla authority
umana e dal manifest canonico; Q4 dipende da consumer statici, dinamici, storici
ed esterni, e continua a rifiutare cancellazioni senza attestazioni.
La registrazione del cohort rimuove l'ambiguita *unregistered* ma non certifica
che la sua descrizione sia un fatto runtime corrente. Ogni file del cohort resta
non-authoritative; la modifica di un lifecycle richiede review contestuale.

Le tredici categorie root distinguono package/lock, launcher, licenze, configurazioni,
API, authority-map e lineage UI. Sono **ruoli dell'inventario**, non assegnazioni
di nuovi owner. Le 151 fonti gia non registrate alla baseline #275 sono
classificate nel manifest preesistente: 127 `lineage`, 17 `operating`,
4 `roadmap`, 3 `source-input`, sempre `authoritative: false`.
Il cohorte `post275-residual` conserva i vecchi oracle e le preimage senza
introdurre un secondo registro o riscrivere gli archivi storici.

**Limiti epistemici:** Q1-Q5 non provano assenza di caller esterni, non convalidano
l'efficacia dei controlli e non autorizzano rimozione. Le campagne su modelli
non sono milioni di patch fisiche; `NO_NOVELTY` nel set mutazionale prefissato
non dimostra saturazione di tutte le possibili failure family.

## Verifica della semantica interna e portabilità del checkout

La coerenza documentale non si riduce alla presenza del file o a un link valido. Il gate già canonico `scripts/documentation-lattice-check.mjs` confronta i sette processi descritti da `docs/PRODUCT.md` con `src/runtime/procedure-contracts.mjs` e gli adapter effettivi; confronta inoltre l’identità della release, la distinzione tra proiezione intermedia e risposta HTTP, i riferimenti `public/` e le importazioni CSS/JavaScript correnti con i byte eseguibili. Un mismatch documentale o software è una **controprova**, non una nuova fonte di verità. I relativi mutanti fisici sono eseguiti da `tests/verification/semantic-document-source-falsification.mjs` in una worktree temporanea.

Il contratto root esistente `scripts/repository-contract.mjs` verifica anche la portabilità dei nomi del filesystem osservato: collisioni insensibili a maiuscole, nomi di dispositivo riservati, Unicode non normalizzato, segmenti incompatibili con Windows e symlink non qualificati. La falsificazione fisica è `tests/verification/repository-path-portability-falsification.mjs`. I due verificatori sono collegati al workflow documentale esistente, non rappresentano una seconda governance. Nessuna di queste prove autorizza un `DELETE` o dimostra consumer esterni assenti; i percorsi generati/ignorati non sono inclusi nel denominatore di portabilità.

## Product truth e lineage

`docs/PRODUCT.md` è l'autorità corrente per identità, scope e confini del prodotto. `docs/00_PROMPT_CLARIFICATION.md` è `source-input`; documenti TO-BE/roadmap restano futuro intenzionale. Quando una decisione di lineage diventa AS-IS, si aggiorna l'owner current e si conserva il documento storico come evidence, senza duplicare l'autorità.

## Regole di scrittura

- Un concetto current ha un solo owner canonico; gli altri documenti linkano l'owner invece di riscriverlo come verità autonoma.
- I DoD di slice dichiarano scope, finding, invarianti, metriche, gate e limiti; non diventano automaticamente authority architetturale o di prodotto.
- README espone il prodotto e il percorso minimo; START_HERE espone il grafo degli owner e i percorsi contributor/community.
- I documenti storici non devono essere necessari per avviare, testare o modificare il runtime corrente.
- Naming tecnico legacy può restare nel codice; il linguaggio current user-facing segue `03_ENDUSER_LANGUAGE.md`.
- Generated evidence e file sotto `artifacts/` sono derivati e non authority.
- Un link rotto verso un owner current è un defect documentale, non un problema editoriale minore.
- GitHub settings e deployment controls non possono essere auto-certificati da Markdown o CI locale.

## Assi di versione

Product release, UI composition, journey, constitution e documentation runtime sono assi distinti. Aggiornare uno non implica gli altri. Il manifest li registra con owner e valore corrente per impedire che una versione di slice venga promossa implicitamente a versione globale del prodotto.

## DoD documentale

La documentazione è matura quando:

- tutte le authority current/policy/operating registrate sono raggiungibili entro due link da `docs/START_HERE.md`;
- ogni authority topic è univoco;
- product, architecture, epistemic contract, end-user language, testing e release identity hanno owner espliciti;
- source-input/roadmap/lineage/generated non possono diventare authority current per implicazione;
- `npm run docs:check` è nella rail semantic current;
- contributor, PR, support e security hanno route separate e verificabili;
- nessun generated artifact è indicato come file da modificare manualmente.

## Contratto di ricostruibilità e ritiro lossless

La navigazione segue `README → START_HERE/ATLAS → owner canonico → componente/handler → falsificatore → ricevuta`. Ogni documento **current/operating/policy** deve rendere identificabili: destinatario e task, scopo e limiti, owner sostanziale, prerequisiti, ingressi e output, versione/provenienza pertinente, riferimento agli esecutori e test (dove esistono), stato probatorio. I documenti `lineage`, `source-input`, `roadmap` e `generated` espongono invece ruolo temporale e limiti; non ricevono current authority da un hyperlink.

Per il software un singolo README per ogni file sarebbe rumore. La tracciabilità delle foglie è una **proiezione ricostruibile** da import, URL, entrypoint, contratti, test, workflow, metadati Git/PR e riferimenti dinamici; non un nuovo writer o registry di verità. Mantenere distinti `IMPORTS/READS/EXECUTES`, `DYNAMIC-LOAD/STATIC-URL`, `DOCUMENTS/PROVES` e `CO-CHANGED/MENTIONS`. Ogni edge inferito registra provenienza, esatto SHA, metodo, confidenza e limiti.

**Regola fail-closed per la cancellazione:** `UNREFERENCED` significa soltanto *nessun riferimento osservato con i metodi applicati*, non `SAFE_DELETE`. Un candidato alla rimozione deve superare: (1) controllo authority, retention, external entry e URI statiche; (2) risoluzione dei path dinamici e dei consumer; (3) trasferimento lossless di eventuali claim unici; (4) rimozione reale in sandbox e test sia positivi sia negativi; (5) riesame della failure family e CI sulla stessa HEAD; (6) rollback riproducibile. Se una condizione è ignota, classificare `UNKNOWN / HOLD`, non eliminare.

I metadati storici di una PR suggeriscono accoppiamenti e finalità, ma non provano la sicurezza di una delete. Un punteggio statistico può **ordinare la revisione**; non può sostituire il veto deterministico sulle superfici esposte, sull'autorità e sulle prove di non-uso. Non alterare assieme prodotto e oracolo per creare un falso verde.

## Igiene enterprise-candidate del primo ingresso (non cancellazione della lineage)

L’ordine di prima lettura del README è **valore e destinatario → primo percorso operativo → evidenza e limiti CTO**. Product, runtime, governance, release, documentazione e history conservano rispettivamente gli owner correnti; riferimenti a PR e versioni ritirate appartengono a CHANGELOG, PROJECT_TRAJECTORY o ad archivi classificati e non devono apparire come stato corrente nella prima lettura. Il README presenta i limiti e collega gli owner: non è un registro di stato aggiornato automaticamente a ogni merge.

Il repository contiene la **licenza MIT canonica in `LICENSE`**, un **puntatore di compatibilità `LICENSE.md`** e un **NOTICE descrittivo non restrittivo**. Il secondo file non costituisce una seconda licenza: è consumato da verifiche e inventario, quindi nessuna rimozione senza prova di compatibilità esterna e aggiornamento coordinato degli owner. Analogamente, **SBOM e attestazioni candidate sono artefatti generati dal workflow C2 exact-HEAD**, non file sorgente da duplicare manualmente. Il repository deve indicarne il percorso di prova e dichiarare quando la disponibilità hosted è sconosciuta.

Il controllo documentale deve rifiutare sia la falsa promozione di attestazione/enterprise-ready sia l’inversione della prima lettura. La deduplicazione dei testi non autorizza perdita di path, ID, provenance, contratti o storia conservata dal manifest.

## Reticolo DoD retrogrado per minimalità e standard

**G-MIN — repository minimo, standard e manutenibile senza perdere funzioni o verità:** `G-MIN = G-UNDERSTAND AND G-CURRENT AND G-LEGACY AND G-ASSURANCE AND G-GOVERNANCE` (composizione AND, non media). Ciascun requisito si riferisce agli owner preesistenti:

| DoD intermedio | DoD locale / prova | Stato che non si può inferire |
| --- | --- | --- |
| `G-UNDERSTAND` | README distingue valore/limiti, prodotto, software e repository; START_HERE instrada a owner, task, test e rollback; docs:check riconosce i legami | Comprensione umana senza test indipendente |
| `G-CURRENT` | Entrypoint Node, SQLite, API e npm effettivi verificati dal root contract e dalla suite current | Correttezza enterprise o deployment esterno |
| `G-LEGACY` | Ogni sacca riceve `PRESERVE`, `REPAIR`, `ARCHIVE_LOGICAL`, `RETIRE_PHYSICAL` oppure `HOLD`, con evidenza consumer e retention | `INTEGRO` o `UNREFERENCED` non autorizzano delete |
| `G-ASSURANCE` | Mutazione fisica di documentazione e root contract respinta; test positivo, Git tree, rollback e CI exact-head | Campioni e trial sintetici non provano equivalenza universale |
| `G-GOVERNANCE` | Reviewer indipendente, required checks vincolanti su main e onboarding osservato | Un commento, workflow verde o GOV-01F non sostituiscono protezione server-side |

**Catena di dipendenze:** classificazione storica → prova di uso corrente → contrasto con owner → scelta della riparazione minima → controprova negativa → commit reversibile → CI sulla HEAD → decisione governata → eventuale ritiro fisico. Non materializzare il nodo successivo se quello precedente è `UNKNOWN` o `REFUTED`.

Per il bundle AI PR #8 la disposizione è `PRESERVE` nell'archivio fisico `audit/archive/ictc-agent-bundle/`: i 33 blob Git restano identici e la verifica d'integrità rimane eseguibile; la compatibilità con il precedente URL resta `HOLD_CONSUMERS`, senza attestare l'assenza di consumer esterni o autorizzare delete. Per la root toolchain obsoleta è ammessa una `REPAIR` in place, mantenendo diagnostica legacy. Gli audit sono proiezioni, non creano un secondo inventario canonico.

## Falsificazione

`npm run docs:check` verifica il repository reale. `npm run docs:saturation` falsifica il modello degli invarianti. Il gate deve uccidere almeno: entrypoint mancante, doppia authority, prompt storico promosso a product truth, owner irraggiungibile, link rotto, drift degli assi di versione, security routing pubblico, PR contract incompleto, manifest divergente, stale current rail e package wiring rimosso.

Un alto numero di trial è bounded model evidence; non equivale a code mutation indipendenti, browser session, contributor study, branch protection o deployment assurance.
