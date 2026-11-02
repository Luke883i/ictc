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

## Falsificazione

`npm run docs:check` verifica il repository reale. `npm run docs:saturation` falsifica il modello degli invarianti. Il gate deve uccidere almeno: entrypoint mancante, doppia authority, prompt storico promosso a product truth, owner irraggiungibile, link rotto, drift degli assi di versione, security routing pubblico, PR contract incompleto, manifest divergente, stale current rail e package wiring rimosso.

Un alto numero di trial è bounded model evidence; non equivale a code mutation indipendenti, browser session, contributor study, branch protection o deployment assurance.
