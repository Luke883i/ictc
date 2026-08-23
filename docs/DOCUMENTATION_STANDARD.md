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

## Falsificazione

`npm run docs:check` verifica il repository reale. `npm run docs:saturation` falsifica il modello degli invarianti. Il gate deve uccidere almeno: entrypoint mancante, doppia authority, prompt storico promosso a product truth, owner irraggiungibile, link rotto, drift degli assi di versione, security routing pubblico, PR contract incompleto, manifest divergente, stale current rail e package wiring rimosso.

Un alto numero di trial è bounded model evidence; non equivale a code mutation indipendenti, browser session, contributor study, branch protection o deployment assurance.
