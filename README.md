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

ICTC preserva queste non-equivalenze:

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

## UI/UX corrente — Semantic Composition 3.1

La costituzione di composizione è **work first, explanation on demand**. Ogni superficie classifica le informazioni come identity, context, attention, decision, action, evidence, consequence, boundary o technical; le primitive sono comuni e gli adapter sono specifici alla natura della superficie.

- Home mostra attività che richiedono intervento, non una dashboard numerica.
- Processi di Compliance usa righe confrontabili, non un card wall informativo.
- Le procedure mostrano header compatto e lavoro prima di KPI, metodo, boundary e trace.
- Evidenze ICTC porta decisioni/evidenze prima di sintesi e postura tecnica.
- EP-01 porta relazioni e ricerca prima di conteggi e dettagli tecnici.
- Admin porta azioni richieste prima di metriche e controlli tecnici.
- Dialoghi mostrano un solo livello introduttivo; opzioni avanzate restano progressive.

`v3/public/ui/semantic-composition-runtime.js` è l'owner della gerarchia informativa; `v3/public/ui/semantic-composition-model.js` ne è il contratto. Il lifecycle C0.1 conserva l'ordine `harmonization → presentation → integrity → journey → annotation`; `presentation` resta esclusiva per la decision presentation.

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
node v3/semantic-composition-3-1-check.mjs
node v3/semantic-composition-3-1-ui-check.mjs
node v3/documentation-composition-3-1-check.mjs
node v3/semantic-composition-3-1-saturation.mjs
```

La saturation 3.1 modella quattro campagne da 10.000.000 trial — tecnica, semantica, UI/UX e documentazione — per un totale di **40.000.000 mutazioni modellate**, con holdout da 100.000 per campagna. È bounded evidence del vocabolario dichiarato, non uno studio utenti, un parere legale, una certificazione di accessibilità o deployment assurance.

## Release e presa in carico

`v3/release-identity.json` resta l'autorità della release. Il profilo corrente conserva `journey = 2.2-sequential-onto-epistemic` e `constitution = C0.1`; Semantic Composition 3.1 modifica la gerarchia informativa senza creare un nuovo processo o una nuova write authority.

**Per prendere in carico il repository parti da `docs/START_HERE.md`.** Lo standard per distinguere documentazione current, operating guide, lineage e generated evidence è `docs/DOCUMENTATION_STANDARD.md`; gli owner correnti sono in `docs/authority-matrix.yaml`.
