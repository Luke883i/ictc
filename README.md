# ICTC — Integrated Compliance Tower Control

ICTC è un **sistema locale di governance della conoscenza di compliance**. Organizza fonti, requisiti, oggetti aziendali, rischi, azioni, richieste di verifica, decisioni umane ed evidenze senza trasformare il software in un motore autonomo di conclusioni legali o di conformità.

La navigazione canonica è **Home / Processi di Compliance / Evidenze ICTC**. EP-01 è una vista trasversale sulle relazioni registrate e non costituisce un ottavo processo business.

## Cosa governa

| Codice | Processo | Oggetto di lavoro |
|---|---|---|
| RN-01 | Monitoraggio normativo e fonti | fonti, pubblicazioni e cambiamenti da verificare |
| EC-01 | Incidenti e quasi incidenti | fatti, chiarimenti, versioni e decisioni relative a un evento |
| AO-01 | Inventario di sistemi e oggetti | sistemi, servizi, dati, fornitori, processi, policy e controlli |
| MC-01 | Standard e Controlli | standard, requisiti, perimetro e mapping |
| AP-01 | Azioni correttive | impegni di remediation fino alla verifica di chiusura |
| RC-01 | Rischi di compliance | scenari, valutazioni, trattamenti e riesami |
| AR-01 | Questionari e verifiche | richieste, response set, evidenze e approvazioni interne |

**EP-01 · Reticolo epistemico** rende esplorabili versioni, basi e relazioni tra decisioni, fonti ed evidenze. Non crea applicabilità, autorità decisionale o conclusioni di conformità.

## Regole costituzionali

```text
osservato ≠ vero nel mondo
proposto ≠ deciso
perimetro di lavoro ≠ applicabilità giuridica
mapping ≠ conformità / efficacia
completato ≠ chiuso e verificato
evidenza ≠ conclusione
rating ≠ probabilità oggettiva
approvazione interna ≠ assurance indipendente
integrità software ≠ autenticità esterna
CI verde ≠ deployment assurance
```

L'AI può preparare, cercare, riassumere o proporre. I checkpoint che producono decisioni business restano umani e autorizzati.

## Architettura AS-IS

```text
browser
  v3/public · HTML/CSS/JavaScript vanilla
        ↓ HTTP JSON
v3/server.mjs
        ↓
v3/runtime/* · domain · enterprise · ai
        ↓
v3/store.mjs
        ↓
v3/sqlite-state-persistence.mjs
        ↓
state.sqlite
  snapshot          stato corrente mutabile/versionato
  audit             ledger hash-linked append-oriented
  subject_payload   payload content-addressed
  subject_version   storia semantica append-oriented
  epistemic_step    causalità e authority append-oriented
  command_result    replay/idempotenza durevole
```

Il runtime richiede Node.js `>=22.16.0`, usa `node:sqlite`, `PRAGMA journal_mode=WAL` e `PRAGMA synchronous=FULL`. ICTC non è un event store completo: lo snapshot corrente non viene ricostruito esclusivamente dall'audit ledger.

Il default bind è `127.0.0.1:4173`. TLS, IdP, secret management, backup/restore, malware scanning, monitoring, HA e hardening host restano responsabilità del deployment.

## UI/UX corrente — Native Semantic Lattice 3.2

La regola corrente è **work first, explanation on demand**, con composizione locale delle superfici e annotazione globale minima.

- `active-experience.js` è l'unico composition root e installa gli owner locali 3.2 prima dell'annotazione globale.
- `native-workspace-3-2.js` aggrega il bootstrap tecnico di Proof, EP-01, Admin, GRC e dialoghi; non possiede business write authority.
- `semantic-composition-runtime.js` è **annotation-only**: classifica surface/authority metadata e non riscrive copy business, non riordina DOM locale e non installa gli owner locali.
- Home mostra una proposition aziendale unica e una attention queue limitata a 5 elementi.
- Processi di Compliance usa una capability matrix responsive **3 → 2 → 1** con sette card e copy distinto tra catalogo e workspace.
- Le procedure mantengono lavoro e decisione prima di KPI, metodo, boundary e trace.
- Evidenze ICTC apre con il **Reticolo epistemico** e mantiene secondari decisioni/tracciabilità, metodo, integrità, verifiche esterne ed export.
- EP-01 porta ricerca e relazioni prima di summary/compression e dettagli tecnici.
- Admin esplicita gli effetti della disponibilità operativa senza trasformarla in applicabilità normativa.

Il lifecycle costituzionale resta **C0.1** con ordine `harmonization → presentation → integrity → journey → annotation`; il journey corrente resta `2.2-sequential-onto-epistemic`.

Il design system mantiene tre assi distinti: `uiComposition = 3.2`, `workspaceChrome = 3.3` e `uiPresentation = 3.4`. La closure 3.4 è l'effetto visuale finale AS-IS caricato dopo il chrome 3.3, ma resta una **effective transitional presentation closure** da assorbire nei veri owner: non è un nuovo business/design-system owner permanente.

## Evidenze ed export

Evidenze ICTC collega pratica, decisione, evidenza e limite nel perimetro autorizzato. Gli export **PDF, XML, Markdown e ZIP** sono rappresentazioni dello stesso dossier autorizzato e non ampliano RBAC o scope. Receipt, digest e hash provano proprietà del record software entro il modello ICTC, non firma qualificata, trusted timestamp, autenticità esterna o non-ripudio.

## Avvio

```bash
npm ci
./ictc.sh start
```

Demo sintetica:

```bash
./ictc.sh demo
```

Operazioni comuni:

```bash
./ictc.sh status
./ictc.sh logs
./ictc.sh doctor
./ictc.sh stop
./ictc.sh restart
```

## Verifica

```bash
npm test
npm run release:check
node v3/current-semantic-3-2.mjs
node v3/native-semantic-lattice-3-2-check.mjs
node v3/native-semantic-lattice-3-2-ui-check.mjs
node v3/ui-finetuning-3-4-check.mjs
node v3/native-semantic-lattice-3-2-saturation.mjs
node v3/native-semantic-lattice-3-2-stress.mjs
```

La saturation 3.2 esegue **10.000.000 trial di falsificazione del vocabolario modellato** su 220 famiglie dichiarate. Non sono 10 milioni di mutazioni del codice o browser session. Lo stress 3.2 esercita invece il contratto eseguibile C0.1 di ordinamento/validazione dei participant su un milione di casi deterministici. Browser journey ed exact-head CI restano evidenze separate.

## Release e presa in carico

`v3/release-identity.json` resta l'autorità della release. Il profilo corrente conserva `journey = 2.2-sequential-onto-epistemic` e `constitution = C0.1`; Native Semantic Lattice 3.2 modifica composizione e gerarchia informativa senza creare un nuovo processo o una nuova write authority. Il registry documentale registra separatamente `workspaceChrome = 3.3` e `uiPresentation = 3.4` per rappresentare l'AS-IS senza promuovere la closure transitoria a lineage permanente.

La branch protection server-side e gli altri gate indipendenti/deployment non possono essere auto-prodotti dal repository: restano blocker esterni quando non disponibili.

**Per prendere in carico il repository parti da `docs/START_HERE.md`.** Gli owner correnti sono in `docs/authority-matrix.yaml`; lo standard documentale è `docs/DOCUMENTATION_STANDARD.md`.
