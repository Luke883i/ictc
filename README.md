[![ROA Research Programme](https://img.shields.io/badge/ROA-Research_Programme-1f6feb)](https://github.com/Luke883i/academics)
[![Programme Role](https://img.shields.io/badge/role-COMPLIANCE_VERTICAL-6f42c1)](https://github.com/Luke883i/academics#repository-map)

<!-- roa-programme-header:v1 hub=Luke883i/academics framework=Luke883i/ROA role=COMPLIANCE_VERTICAL -->

> **Contesto di programma.** ICTC partecipa al [ROA Research Programme](https://github.com/Luke883i/academics), con riferimento teorico a [ROA](https://github.com/Luke883i/ROA). L'appartenenza indica coordinamento, **non** conformità teorica dimostrata, validazione indipendente o readiness produttiva. Le autorità di questo repository restano locali.

# ICTC — Integrated Compliance Tower Control

ICTC è un **sistema locale di governance della conoscenza di compliance**. Collega fonti, requisiti, oggetti aziendali, rischi, azioni correttive, richieste di verifica, decisioni umane ed evidenze, preservando provenienza, autorità, versione e limiti delle affermazioni. L'identità e lo scopo canonici sono in [PRODUCT](docs/PRODUCT.md).

**Maturità:** candidate. Per le versioni correnti prevale [release-identity.json](v3/release-identity.json). Una CI verde, un receipt o una proposta AI **non** dimostrano conformità legale, efficacia dei controlli, autenticità esterna, assurance indipendente o deployment di produzione.

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

`v3/public/` (HTML/CSS/JS) -> `v3/server.mjs` (HTTP, identità, permessi, handler) -> `v3/runtime-store.mjs` / `v3/store.mjs` -> persistenza SQLite rafforzata. Le letture usano proiezioni autorizzate; le scritture producono esiti/receipt e richiedono verifica su readback. Il benchmark enterprise PostgreSQL è un substrate distinto, non una prova sostitutiva del runtime SQLite standard.

**Identità di release:** `v3/release-identity.json` resta l'autorità della release. Il journey corrente è `2.2-sequential-onto-epistemic`, la costituzione è `C0.1`. La UI usa **Native Semantic Lattice 3.2**: `active-experience.js` è il composition root e la proiezione globale `semantic-composition-runtime.js` è **annotation-only**, non un secondo owner business.

**Evidenze e export:** PDF, XML, Markdown e ZIP sono rappresentazioni dello stesso dossier autorizzato; non estendono le autorizzazioni di lettura o l'assurance.

**Osservato != vero; proposto != deciso; riferimento != applicabilità; mapping != conformità; completato != verificato; evidenza != conclusione; approvazione interna != assurance indipendente.** L'AI può assistere entro la policy configurata, ma non acquisisce autorità decisionale umana.

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

Leggi [CONTRIBUTING](CONTRIBUTING.md), [GOVERNANCE](GOVERNANCE.md) e [AGENTS](AGENTS.md). Ogni PR dichiara intento, owner corrente, predicati positivi e negativi, percorso utente interessato, diff effettivo, verifiche eseguite **sulla stessa HEAD**, rischi residui e rollback. Prima di creare un nuovo layer, dimostra perché un owner esistente non possa assorbire la responsabilità.

Il **contributor** propone e testa; il **reviewer** verifica diff, predicati ed evidenze; il **maintainer** governa l'integrazione; l'**operatore del deployment** e gli **organi decisionali aziendali** mantengono le responsabilità esterne di loro competenza. Questa è una distinzione operativa, non una dichiarazione che ICTC disponga già di reviewer indipendenti o di una nuova organizzazione.

`.github/CODEOWNERS` indirizza la review ma **non impone da solo approvazioni**. Verifica ruleset e protezione live di GitHub prima di dichiarare review indipendente obbligatoria. `GOV-01F` è un controllo compensativo, non branch protection server-side.

Per vulnerabilità usa [SECURITY](SECURITY.md), non issue pubbliche. Valgono [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) e licenza [MIT](LICENSE).
