# ICTC Documentation Standard

## Scopo

La documentazione ICTC deve consentire a un informatico che non conosce il prodotto di ricostruire rapidamente **identità → autorità → architettura → dominio → UI → test → release**, senza dover inferire quale documento storico sia ancora valido.

## Classi

Ogni documento appartiene logicamente a una sola classe:

1. **entrypoint** — `README.md`, `docs/START_HERE.md`;
2. **current authority** — documenti nominati da `docs/authority-matrix.yaml` o owner eseguibili indicati da essi;
3. **current operating guide** — `docs/TESTING.md`, `docs/DEVELOPMENT.md`, sicurezza/deployment e DoD della slice corrente;
4. **lineage / historical evidence** — audit, closure e report di slice precedenti; spiegano perché il sistema è arrivato allo stato corrente ma non ridefiniscono owner, lessico o release;
5. **generated evidence** — artefatti prodotti da script/test; non si modificano a mano.

La data più recente non conferisce autorità. Un documento non diventa current perché contiene una formulazione più nuova: deve essere raggiungibile dalla mappa canonica o dichiarato nell'authority matrix.

## Percorso di presa in carico

Ordine obbligatorio consigliato:

`README.md` → `docs/START_HERE.md` → `docs/authority-matrix.yaml` → `docs/11_ARCHITECTURE.md` → `docs/02_EPISTEMIC_CONTRACT.md` → `docs/03_ENDUSER_LANGUAGE.md` → DoD slice corrente → `docs/TESTING.md` / `docs/DEVELOPMENT.md`.

## Regole di scrittura

- Un concetto current ha un solo owner canonico; gli altri documenti lo linkano invece di riscriverlo.
- I DoD di slice dichiarano scope, finding, invarianti, metriche, gate e limiti; non diventano automaticamente authority architetturale.
- Gli audit storici devono restare descrittivi e non essere necessari per avviare, testare o modificare il runtime corrente.
- README espone il prodotto e il percorso minimo, non la cronologia completa di ogni iterazione.
- START_HERE espone la mappa degli owner correnti e il percorso di modifica/falsificazione.
- Naming tecnico legacy può restare nel codice; la documentazione current deve dichiarare la traduzione business quando il termine è user-facing.
- Generated evidence e file sotto `artifacts/` sono derivati e non authority.

## DoD documentale

La documentazione è navigabile quando:

- esiste un solo entrypoint dichiarato per la presa in carico (`docs/START_HERE.md`);
- ogni authority current importante è raggiungibile entro due passaggi dall'entrypoint;
- UI composition, linguaggio, architettura, testing e release identity hanno owner espliciti;
- i documenti storici non sono necessari per individuare l'owner corrente;
- i comandi canonici `npm test`, `npm run release:check` e i gate della slice corrente sono raggiungibili dalla mappa;
- nessun generated artifact è indicato come file da modificare manualmente.

## Mutation vocabulary

Il gate documentale deve uccidere almeno: start path mancante, doppia current authority, documento storico promosso a current, owner non collegato, comando di test non collegato, release identity non collegata, DoD corrente non collegato, architettura non collegata, generated artifact hand-edited e naming non classificato.
