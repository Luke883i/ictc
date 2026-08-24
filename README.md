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
osservato != vero nel mondo
proposto != deciso
perimetro di lavoro != applicabilità giuridica
mapping != conformità / efficacia
completato != chiuso e verificato
evidenza != conclusione
rating != probabilità oggettiva
approvazione interna != assurance indipendente
integrità software != autenticità esterna
CI verde != deployment assurance
```

L'AI può preparare, cercare, riassumere o proporre. I checkpoint che producono decisioni business restano umani e autorizzati.

## Architettura AS-IS

```text
browser (v3/public · HTML/CSS/JavaScript vanilla)
  -> v3/server.mjs
  -> v3/runtime/* · domain · enterprise · ai
  -> v3/store.mjs
  -> v3/sqlite-state-persistence.mjs
  -> state.sqlite
```

Lo snapshot corrente è mutabile/versionato; audit e version history sono append-oriented. ICTC non è un event store completo: lo snapshot non viene ricostruito esclusivamente dall'audit ledger. Il runtime richiede Node.js `>=22.16.0`; TLS, IdP, secret management, backup/restore, malware scanning, monitoring, HA e hardening host restano responsabilità del deployment.

## UI/UX corrente

La information composition corrente resta **Native Semantic Lattice 3.2** con regola **work first, explanation on demand**. `active-experience.js` è l'unico composition root; gli owner locali governano gerarchia e compressione; `semantic-composition-runtime.js` resta annotation-only.

Il workspace chrome canonico resta **3.3** (`design-tokens.css` + `workspace-chrome-3-3.css`). L'output visuale corrente include inoltre la **presentation closure 3.4**, caricata come final cascade transitorio e registrata separatamente: è effective AS-IS, non un nuovo business/design-system owner e resta un target di contrazione.

- Home mostra proposition e attention queue limitata a 5 elementi, con CTA compatte.
- Processi di Compliance usa una capability matrix responsive **3 -> 2 -> 1** con sette card.
- Le procedure mantengono lavoro e decisione prima di KPI, metodo, boundary e trace.
- Evidenze ICTC apre con il **Reticolo epistemico**; decisioni, tracciabilità, integrità, verifiche esterne ed export restano nello stesso dossier senza trasformare evidenza in conclusione.
- EP-01 porta ricerca e relazioni prima di summary/compression e dettagli tecnici.

Il lifecycle costituzionale resta **C0.1** con ordine `harmonization -> presentation -> integrity -> journey -> annotation`; il journey corrente resta `2.2-sequential-onto-epistemic`.

## Design system e debito visuale

Il design system usa Inter/System UI, superfici business chiare, testo navy, indigo brand, teal accent e status separati. Header e footer usano la famiglia `--chrome-*`; landing e Home action consumano token condivisi. Il footer corrente espone `ICTC · MIT · Repository · Condizioni`: `Candidate` è assente.

La closure 3.4 conserva oggi alcuni override finali sopra generazioni CSS precedenti. Questa stratigrafia è **debito esplicito**, non target architetturale. I test correnti devono proteggere gli invarianti osservabili e non richiedere che una causa legacy resti presente soltanto per dimostrare che una regola successiva la sovrascrive.

## Evidenze ed export

Gli export **PDF, XML, Markdown e ZIP** sono rappresentazioni dello stesso dossier autorizzato e non ampliano RBAC o scope. Receipt, digest e hash provano proprietà del record software entro il modello ICTC, non firma qualificata, trusted timestamp, autenticità esterna o non-ripudio.

## Avvio e verifica

```bash
npm ci
./ictc.sh start
npm test
npm run docs:check
npm run docs:saturation
npm run release:check
node v3/current-semantic-3-2.mjs
node v3/ui-finetuning-3-4-check.mjs
```

Le saturation dichiarate sono **falsificazioni del vocabolario modellato** e non browser session, user study o assurance indipendente. Browser journey, CI exact-head e setting server-side restano evidenze separate.

## Release e presa in carico

`v3/release-identity.json` resta l'autorità cross-document della release. `uiComposition=3.2`, `workspaceChrome=3.3` e `uiPresentation=3.4` sono assi distinti nel registry documentale: la separazione registra l'AS-IS senza promuovere la closure transitoria a owner permanente.

La branch protection server-side e gli altri gate indipendenti/deployment non possono essere auto-prodotti dal repository: restano blocker esterni quando non disponibili.

**Per prendere in carico il repository parti da `docs/START_HERE.md`.** Gli owner correnti sono in `docs/authority-matrix.yaml`; lo standard documentale è `docs/DOCUMENTATION_STANDARD.md`.
