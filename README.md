<!-- programme-header:v2 -->
> **ROA Research Programme · A-OSP ecosystem** — [Author & programme hub](https://github.com/Luke883i/academics) · [ROA theory](https://github.com/Luke883i/ROA) · [CORA assurance](https://github.com/Luke883i/cora). Every repository is independently readable. Membership does not imply formal derivation, shared runtime, scientific validation, certification, or production readiness. Repository-local code, evidence, and governance remain authoritative.

# ICTC — Integrated Compliance Tower Control

**Purpose:** ICTC manages compliance knowledge, applicable requirements, risk, work, attributable human decisions and evidence, without substituting for legal interpretation or independently certifying compliance. **Provisional, not measured CORA-Score:** Dev_CORA **4/5**, Bonifica_CORA **4/5**; the indicative axes are defined in [CORA's rubric](https://github.com/Luke883i/cora#cora-score--indicative-assurance-bands-not-a-product-certification).


ICTC è un **sistema locale di governance della conoscenza di compliance**. Collega fonti, requisiti, oggetti aziendali, rischi, azioni correttive, richieste di verifica, decisioni umane ed evidenze, preservando provenienza, autorità, versione e limiti delle affermazioni. L'identità e lo scopo canonici sono in [PRODUCT](docs/PRODUCT.md).

**Governare la conoscenza** significa rendere ogni affermazione operativa rintracciabile alla sua fonte, alla versione osservata, al contesto e all'owner autorizzato, distinguendo proposta, accertamento, decisione e riesame. In ICTC non e un giudizio automatico di conformita: e un percorso verificabile da *fonte/requisito* a *oggetto, rischio o azione*, fino a *evidenza, decisione umana e successiva revisione*.

- **Prodotto:** le sette procedure e la vista Evidenze ICTC rendono consultabili lavoro, limiti del claim e responsabilita; [PRODUCT](docs/PRODUCT.md) ne governa lo scopo, non il repository.
- **Software:** `src/bootstrap.mjs` → `src/server.mjs` → handler/policy → store SQLite, con autorizzazioni, versioni, receipt e readback; [ARCHITECTURE AS-IS](docs/11_ARCHITECTURE.md) descrive il comportamento, che va verificato in runtime.
- **Repository:** `src/`, `public/`, `tests/`, `scripts/`, `docs/` e `.github/workflows/` permettono modifica, falsificazione e rilascio su Git SHA; [START_HERE](docs/START_HERE.md) individua l'owner e [TESTING](docs/TESTING.md) l'oracle.

L'AI puo aiutare a interpretare richieste, localizzare owner, generare proposte e controesempi, ma **non** decide l'applicabilita legale, approva stati business, crea nuove autorita software o attesta che un merge sia sicuro. La sua attivita di manutenzione resta soggetta agli stessi test, review, provenance e controllo umano degli altri contributi.

## Valore per le imprese — cosa ICTC aiuta a governare

**Rispettare le norme. Governare rischi e costi.** ICTC collega fonti, requisiti, rischi, controlli e interventi: aiuta imprese e PMI a **organizzare la risposta agli obblighi applicabili** e a usare con criterio le risorse. Non determina da solo quali norme siano applicabili né certifica la conformità. Le decisioni, le verifiche e le approvazioni rimangono umane.

- **Per chi:** organizzazioni e ruoli che devono ricostruire obblighi, responsabilità e lavoro di compliance; il [perimetro canonico](docs/PRODUCT.md) precisa capacità e limiti.
- **Cosa offre oggi:** Home per orientare, sette processi di compliance per lavorare, Evidenze ICTC per ricostruire decisioni e provenienza; due voci del catalogo sono solo placeholder informativi.
- **Come funziona:** [software AS-IS](docs/11_ARCHITECTURE.md) locale Node.js/SQLite e [API](docs/openapi.yaml), con limiti di runtime, fiducia e deployment documentati.
- **Come si mantiene:** [repository e ownership](docs/START_HERE.md), [test](docs/TESTING.md), [primo cambiamento falsificabile](docs/DEVELOPMENT.md) e governance ordinaria.

## Da zero: tre percorsi (senza prerequisiti AI)

| Domanda | Punto di ingresso | Verifica sul software |
| --- | --- | --- |
| **Prodotto:** destinatari, capacità e limiti | [PRODUCT](docs/PRODUCT.md) → [user journey](docs/04_USER_JOURNEYS.md) | Sette processi e due placeholder; nessuna applicabilità legale automatica. |
| **Software:** runtime, API e dati | [ARCHITECTURE AS-IS](docs/11_ARCHITECTURE.md) → [DEVELOPMENT](docs/DEVELOPMENT.md) → [CONFIGURATION](docs/CONFIGURATION.md) | `src/bootstrap.mjs`, `src/server.mjs`, SQLite; verificare contro codice e [OpenAPI](docs/openapi.yaml). |
| **Repository:** modifiche, test e delivery | [START_HERE](docs/START_HERE.md) → [Atlas](docs/REPOSITORY_ATLAS.md) → [TESTING](docs/TESTING.md) | [Manifest](docs/documentation-manifest.json), [owner matrix](docs/authority-matrix.yaml), [Actions](.github/workflows/), exact HEAD. |

Per esercire: [OPERATIONS](docs/OPERATIONS.md). `AGENTS.md` e TRAMA sono specializzazioni per l'uso di assistenti AI, **non prerequisiti** per comprendere, installare o modificare ICTC. La responsabilità delle decisioni e dei gate rimane agli owner e alla governance ordinaria.

**Maturità:** candidate. Per le versioni correnti prevale [release-identity.json](src/contracts/release-identity.json). Una CI verde, un receipt o una proposta AI **non** dimostrano conformità legale, efficacia dei controlli, autenticità esterna, assurance indipendente o deployment di produzione.


## Navigazione progressiva — cinque prospettive

Prima lettura: **capisci il valore**, avvia la DEMO, individua l'owner e verifica una modifica. Queste sono scorciatoie verso le fonti canoniche, non cinque nuove autorita. Per l'esercizio pratico usa [DEVELOPMENT](docs/DEVELOPMENT.md).

<details>
<summary><strong>Prodotto</strong> — destinatari, processi, limiti</summary>

[PRODUCT](docs/PRODUCT.md) governa le sette procedure e i due placeholder. Nessuna certificazione legale automatica; [user journeys](docs/04_USER_JOURNEYS.md).
</details>

<details>
<summary><strong>Software</strong> — runtime, dati, superfici</summary>

Node.js ESM, UI vanilla e SQLite: ingresso `src/bootstrap.mjs`, HTTP `src/server.mjs`, store `src/store.mjs`. [Architettura AS-IS](docs/11_ARCHITECTURE.md), [OpenAPI](docs/openapi.yaml), [configurazione](docs/CONFIGURATION.md).
</details>

<details>
<summary><strong>Repository</strong> — ownership e primo cambiamento</summary>

[START_HERE](docs/START_HERE.md) instrada il task; [Atlas](docs/REPOSITORY_ATLAS.md) distingue `src/` corrente e `v3/` ritirato, `tests/legacy/` storico e `scripts/`. [DEVELOPMENT](docs/DEVELOPMENT.md) esercita modifica e rollback.
</details>

<details>
<summary><strong>Governance</strong> — PR, sicurezza, responsabilita</summary>

[CONTRIBUTING](CONTRIBUTING.md), [GOVERNANCE](GOVERNANCE.md), [SECURITY](SECURITY.md). CODEOWNERS e CI non equivalgono a review indipendente o branch protection.
</details>

<details>
<summary><strong>Evidenza e DoD</strong> — prove e lacune</summary>

[TESTING](docs/TESTING.md) definisce gli oracle; [GAP_REGISTER](docs/GAP_REGISTER.md) separa debiti interni da E3/E4. Nessuna receipt autorizza eliminazioni o decisioni umane.
</details>

## Contesto di programma (non autorità di prodotto)

[![ROA Research Programme](https://img.shields.io/badge/ROA-Research_Programme-1f6feb)](https://github.com/Luke883i/academics)
[![Programme Role](https://img.shields.io/badge/role-COMPLIANCE_VERTICAL-6f42c1)](https://github.com/Luke883i/academics#repository-map)

<!-- roa-programme-header:v1 hub=Luke883i/academics framework=Luke883i/ROA role=COMPLIANCE_VERTICAL -->

> **Contesto di programma.** ICTC partecipa al [ROA Research Programme](https://github.com/Luke883i/academics), con riferimento teorico a [ROA](https://github.com/Luke883i/ROA). L'appartenenza indica coordinamento, **non** conformità teorica dimostrata, validazione indipendente o readiness produttiva. Le autorità di questo repository restano locali.

## Che cosa governa

| Codice | Processo business |
| --- | --- |
| RN-01 | Monitoraggio normativo e fonti |
| EC-01 | Incidenti e quasi incidenti |
| AO-01 | Inventario di sistemi, servizi, dati, fornitori e oggetti organizzativi |
| MC-01 | Standard, requisiti, perimetro e mapping |
| AP-01 | Azioni correttive e verifica di chiusura |
| RC-01 | Rischi di compliance e riesami |
| AR-01 | Questionari, richieste di evidenza e approvazioni interne |

La navigazione principale è **Home / Processi di Compliance / Evidenze ICTC**: Home presenta al massimo **3 priorità**; il catalogo dei processi usa **one-row-per-procedure / row-list**. **EP-01 · Reticolo epistemico** è una vista trasversale sul reticolo epistemico e non costituisce un ottavo processo business. La superficie visibile «Normativa & Compliance» rende consultabili riferimenti, ma non determina autonomamente l'applicabilità legale.

## Avvio locale

Requisiti: Node.js **>=22.16.0**, npm e una copia locale del repository.

```bash
npm ci --ignore-scripts
npm start
# apri http://127.0.0.1:4173
```

Il bind predefinito è su loopback. Non esporre pubblicamente il profilo standard senza i controlli di identità, proxy, segreti e rete richiesti dal runtime. Come launcher locale alternativo: `./ictc.sh start --no-open`. Vedi [DEVELOPMENT](docs/DEVELOPMENT.md).

Per la **DEMO sintetica e isolata**, usa `npm run demo`. `ICTC_PUBLIC_DEMO=1` è un profilo separato, anonimo e in sola lettura, riservato esclusivamente a dati sintetici; non è il profilo di deployment standard. Per il trasporto su Render DEMO servono `ICTC_HOST=0.0.0.0` e `ICTC_ALLOW_NETWORK_BIND=1`; il server usa `demo-runtime-3-0` e nel profilo pubblico `ICTC_TRUSTED_PROXY_SECRET` deve restare non impostato. Requisiti e limiti sono in [ARCHITECTURE](docs/11_ARCHITECTURE.md) e [RELEASE](docs/RELEASE.md).

## Verifiche prima di una proposta

```bash
npm run docs:check
npm test
npm run release:check
```

Parti dal falsificatore più vicino al cambiamento: [START_HERE](docs/START_HERE.md) collega le modifiche agli owner e ai test. Questi sono **comandi da eseguire**, non attestazioni di passaggio in un ambiente specifico. Browser, sicurezza e verifiche di delivery hanno workflow distinti. Un milione di trial sul modello non equivale a un milione di mutazioni del codice o test con utenti.

## Architettura e limiti delle evidenze

`public/` (HTML/CSS/JS) -> `src/server.mjs` (HTTP, identità, permessi, handler) -> `src/runtime-store.mjs` / `src/store.mjs` -> persistenza SQLite rafforzata. Le letture usano proiezioni autorizzate; le scritture producono esiti/receipt e richiedono verifica su readback. Il benchmark enterprise PostgreSQL è un substrate distinto, non una prova sostitutiva del runtime SQLite standard.

**Identità di release:** `src/contracts/release-identity.json` resta l'autorità della release. Il journey corrente è `2.2-sequential-onto-epistemic`, la costituzione è `C0.1`. La UI usa **Native Semantic Lattice 3.2**: `active-experience.js` è il composition root e la proiezione globale `semantic-composition-runtime.js` è **annotation-only**, non un secondo owner business.

**Evidenze e export:** PDF, XML, Markdown e ZIP sono rappresentazioni dello stesso dossier autorizzato; non estendono le autorizzazioni di lettura o l'assurance.

**Osservato != vero; proposto != deciso; riferimento != applicabilità; mapping != conformità; completato != verificato; evidenza != conclusione; approvazione interna != assurance indipendente.** L'AI può assistere entro la policy configurata, ma non acquisisce autorità decisionale umana.

## Percorsi verificabili per ricostruire ICTC

- **Capire il prodotto:** [PRODUCT](docs/PRODUCT.md) definisce sette processi, due placeholder e i limiti; le [user journey](docs/04_USER_JOURNEYS.md) descrivono i percorsi operativi.
- **Ricostruire il software:** [Repository Atlas](docs/REPOSITORY_ATLAS.md) distingue current, lineage, entrypoint e prove; [Architecture AS-IS](docs/11_ARCHITECTURE.md) collega componenti, stato e boundary; [START_HERE](docs/START_HERE.md) indirizza dall'intento all'owner e al falsificatore.
- **Esercire, verificare, contribuire:** [OPERATIONS](docs/OPERATIONS.md), [DATA_AND_STORAGE](docs/DATA_AND_STORAGE.md), [TESTING](docs/TESTING.md) e [CONTRIBUTING](CONTRIBUTING.md). Prima di usare un asset storico come fonte current, controllare [lifecycle e authority](docs/DOCUMENTATION_STANDARD.md).

**Limite della mappa:** un import non provato non autorizza la cancellazione; un riferimento storico non rende current un file. Il contratto di preservazione e ritiro è in [DOCUMENTATION_STANDARD](docs/DOCUMENTATION_STANDARD.md); PR e commit spiegano la genealogia, mentre gli owner del `main` descrivono l'AS-IS.

## Dove trovare la fonte giusta

| Domanda | Fonte iniziale canonica |
| --- | --- |
| Scopo e limiti del prodotto | [PRODUCT](docs/PRODUCT.md) |
| Come orientarsi nel repository | [REPOSITORY_ATLAS](docs/REPOSITORY_ATLAS.md) |
| Dove modificare codice e documenti | [START_HERE](docs/START_HERE.md) e [authority matrix](docs/authority-matrix.yaml) |
| Come funziona il runtime attuale | [ARCHITECTURE AS-IS](docs/11_ARCHITECTURE.md) |
| Quali documenti sono current, policy o storici | [Manifest](docs/documentation-manifest.json) e [standard](docs/DOCUMENTATION_STANDARD.md) |
| Perché l'architettura si è evoluta | [PROJECT_TRAJECTORY](docs/PROJECT_TRAJECTORY.md) |
| Quali test esistono e quali sono i loro limiti | [TESTING](docs/TESTING.md) |
| Quale evidenza manca ancora | [GAP_REGISTER](docs/GAP_REGISTER.md) e [RELEASE](docs/RELEASE.md) |

## Contribuire e fare review

Come ingegnere leggi [CONTRIBUTING](CONTRIBUTING.md) e [GOVERNANCE](GOVERNANCE.md). Per contributi tramite assistente AI, consulta anche [AGENTS](AGENTS.md): non è una seconda authority del prodotto. Ogni PR dichiara intento, owner corrente, predicati positivi e negativi, percorso utente interessato, diff effettivo, verifiche eseguite **sulla stessa HEAD**, rischi residui e rollback. Prima di creare un nuovo layer, dimostra perché un owner esistente non possa assorbire la responsabilità.

Il **contributor** propone e testa; il **reviewer** verifica diff, predicati ed evidenze; il **maintainer** governa l'integrazione; l'**operatore del deployment** e gli **organi decisionali aziendali** mantengono le responsabilità esterne di loro competenza. Questa è una distinzione operativa, non una dichiarazione che ICTC disponga già di reviewer indipendenti o di una nuova organizzazione.

`.github/CODEOWNERS` indirizza la review ma **non impone da solo approvazioni**. Verifica ruleset e protezione live di GitHub prima di dichiarare review indipendente obbligatoria. `GOV-01F` è un controllo compensativo, non branch protection server-side.

Per vulnerabilità usa [SECURITY](SECURITY.md), non issue pubbliche. Valgono [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) e licenza [MIT](LICENSE).
