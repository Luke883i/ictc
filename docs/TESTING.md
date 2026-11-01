# Strategia di test, mutation e saturation

## Superficie normativa

```bash
npm run docs:check
npm test
npm run release:check
```

`npm test` esegue `test:current`: il documentation lattice check entra nella semantic current rail prima del runtime current. I rail storici restano regressioni/diagnostica e non ridefiniscono `v3/release-identity.json`.

## Prova replicabile di inventario e ritiro conservativo

```bash
npm run repo:inventory
npm run repo:inventory:falsify
npm run repo:retirement:mutations
cat artifacts/repository-inventory.json
cat artifacts/repository-retirement-mutations.json
```

L'inventario censisce e marca **ogni file Git tracciato** nella versione esaminata; i file documentali non dichiarati nel manifest passano a `HOLD_REVIEW`, non a `DELETE`. Il gate garantisce censimento e fail-closed della classificazione, non completezza di reachability runtime, sicurezza di cancellazione, E2E globale o correttezza del contenuto. Il falsificatore copre anche un tentativo di attribuire falsamente `retirement-candidate` a `LICENSE.md`. La seconda prova applica mutazioni semantiche **al modello decisionale di ritiro** su 12 obblighi; distinguere sempre `cases/negatives` da mutazioni fisiche dei sorgenti e verifiche su deployment.

## Feedback per tipo di modifica

Usa prima il falsificatore più vicino al cambiamento; usa poi la rail di convergenza. La tabella orienta, non crea una seconda authority.

| Modifica | Feedback rapido | Prima della PR |
|---|---|---|
| UI/layout/copy locale | `node v3/uiux-converge-0-check.mjs` + gate surface interessato | `npm test` |
| API/handler | `node v3/semantic-api-contract-check.mjs` | `npm run test:current:runtime` |
| AI/provider/egress | `node v3/ai-network-policy-check.mjs` | `npm test` |
| persistence/readback/receipt | `node v3/s3-runtime-reliability-saturation.mjs` | `npm run test:current:runtime` |
| evidence/provenance | `node v3/evidence-check.mjs` | `npm run test:current:runtime` |
| security boundary | `node v3/security-boundary-check.mjs` | `npm run release:check` |
| docs/routing/authority projection | `npm run docs:check` | `npm run docs:saturation` |
| convergence/workbook planning | `node v3/convergence-authority-check.mjs` | `node v3/decide-0-saturation.mjs`, `node v3/trajectory-governance-saturation.mjs`, poi `npm test` |
| adaptive engineering / trajectory intake | `node v3/trama-engineering-check.mjs` | `node v3/trama-engineering-saturation.mjs`, poi `npm test` |
| TRAMA causal qualification | `node v3/trama-causal-qualification-check.mjs` | `node v3/trama-causal-qualification-saturation-1m.mjs`, poi exact-head CI |
| AI information egress | `node v3/ai-information-egress-check.mjs` | `node v3/ai-information-egress-saturation-1m.mjs`, poi network/provider regression + exact-head CI |
| C5 owner/freshness | `node v3/c5-semantic-owner-check.mjs` | `node v3/c5-semantic-owner-saturation.mjs`, `node v3/c5-needs-audit-saturation.mjs`, poi `npm test` |
| enterprise runtime/PostgreSQL orizzontale | `node v3/c3-enterprise-bench-dod-check.mjs` | `npm test` + exact-head `c3-enterprise-runtime-closure` |

Se una modifica locale richiede di leggere o cambiare molte authority non correlate, fermati e verifica prima il routing in `docs/START_HERE.md` e `v3/semantic-owner-contract.json`: la soluzione preferita resta nel proprietario esistente.

## Diagnosi dei failure di contribuibilità

Quando un check rosso è già classificato, riproduci prima il falsificatore locale del suo owner; non allentare il gate insieme al prodotto.

| Failure/check | Route | Riproduzione locale |
|---|---|---|
| `docs-command-contract` | `docs` | `node v3/docs-command-contract-check.mjs` |
| `c5-semantic-owner` | `governance` | `node v3/c5-semantic-owner-check.mjs` |
| `c3-enterprise-runtime` | `enterprise-runtime` | `node v3/c3-enterprise-bench-dod-check.mjs` |
| `enterprise-candidate` | `runtime` | `npm run release:check` |

Il workflow PostgreSQL C3 resta exact-head evidence separata: una riproduzione locale senza PostgreSQL non equivale al canary a due repliche.

## Rail corrente

La composizione UI corrente è **Native Semantic Lattice 3.2**:

```bash
node v3/current-semantic-3-2.mjs
node v3/native-semantic-lattice-3-2-check.mjs
node v3/native-semantic-lattice-3-2-ui-check.mjs
node v3/native-semantic-lattice-3-2-saturation.mjs
node v3/native-semantic-lattice-3-2-stress.mjs
```

C5 rende owner e freshness osservabili senza sostituire la composition authority:

```bash
node v3/c5-semantic-owner-check.mjs
node v3/c5-semantic-owner-saturation.mjs
node v3/c5-needs-audit-saturation.mjs
```

Il sistema documentale corrente è **Documentation Runtime 1.0**:

```bash
npm run docs:check
npm run docs:saturation
```

`docs:check` verifica authority/lifecycle, raggiungibilità degli owner, product truth, community routing, PR contract e package wiring. `docs:saturation` falsifica il modello degli invarianti documentali; il numero di trial non è un numero di contributor study, browser session o code mutation indipendenti.

## Prove per documentazione e ritiro di file

Per modifiche documentali verificare nell'ordine: link e lifecycle del manifest, coerenza con l'owner eseguibile, evidenza positiva del comportamento e un mutante che falsifichi il claim. Per una proposta di ritiro, il censimento `zero inbound` e la somiglianza byte/testo sono soltanto **heuristic review signals**: prima della delete ispezionare import dinamici, caricamenti da URL, workflow, configurazioni esterne e retention di lineage. La prova è un checkout isolato **con rimozione realmente applicata**, seguito dai test target e dalla rail current, senza correggere simultaneamente un gate per far passare una delete erronea. Vedi [DOCUMENTATION_STANDARD](DOCUMENTATION_STANDARD.md) e [REPOSITORY_ATLAS](REPOSITORY_ATLAS.md).

Per lo storage il minimo nearest falsifier include `avvio vergine → persist → stop → riavvio sullo stesso stato → GET /api/runtime/integrity` e readback della revision; la semplice disponibilità HTTP o la validità della catena senza binding non certifica la riapertura. La failure family `state-head-mismatch` osservata nella Fase 1 resta aperta finché non è falsificata dopo una correzione del runtime. I test documentali non la chiudono.

## Livelli

| Livello | Cosa falsifica |
|---|---|
| documentation current | authority, lifecycle, link graph, contributor/community routing, npm wiring |
| syntax | parsing e import |
| semantic current | authority, procedure contract, projection/UI, epistemic, static security, saturation |
| runtime current | persistence, RBAC, evidence, readback, E2E runtime |
| browser exact-head | journey reale sul server e DOM |
| release check | stable rail + candidate current |

I gate Closure 2.8 e delle slice precedenti restano lineage/regression evidence quando richiamati dalle suite correnti; non costituiscono la rail current per il solo fatto di avere un alto volume di mutation trial.

## Regola mutation

Una mutazione utile rompe **un invariante indipendente**. Il kill-rate vale soltanto rispetto agli operatori dichiarati. Se emerge una nuova failure family, va aggiunta al vocabolario invece di aumentare il numero di seed per nasconderla.

Compression mutant: rimuovere un owner/guard/binding necessario deve riaprire almeno una signature. Test e prodotto non possono essere allentati nello stesso commit per ottenere verde.

Il rail C5 esegue 10.000 mutazioni deterministiche del contratto owner/freshness e 10.000 audit sintetici multi-layer di routing. Sono evidence E2 sul modello dichiarato: non sono browser session, contributor study, codice mutato/compilato, deployment test o probabilità di correttezza.

## TRAMA adaptive falsification

`v3/trama-engineering-check.mjs` verifica authority zero, gerarchia/astrazione/composizione di ogni nodo, no-novelty tail N+100, import controllato da iKant/iKant_LE, separazione Enterprise Candidate/E3/E4 e wiring nella rail current. `v3/trama-engineering-saturation.mjs` esegue **1.000.000** casi antagonisti sul kernel, copre le coppie di failure family e applica un deletion oracle. Zero survivor vale solo sul modello dichiarato: non è probabilità di correttezza né evidenza browser, umana, deployment, legale o di minimalità globale.

Se al ceiling 1M emerge una nuova root failure family o novelty, il risultato è `BLOCKED_REMODEL_TAXONOMY`: si amplia il modello prima di proseguire, non il numero di seed per nascondere il finding.

## Topologia GitHub Actions e verdetto same-SHA

La presenza di molti workflow non implica molti verdetti concorrenti. ICTC separa **leaf evidence**, rail specializzate, diagnostica e aggregazione:

- i job/rail required falsificano failure family o ambienti distinti sulla HEAD candidata;
- i check con prefisso `diagnostic /` sono osservazionali e non gating;
- `ictc/actions-census` osserva i check-run della **exact HEAD SHA** e pubblica il singolo aggregate acceptance status, preferendo la provenance del leaf al failure aggregato;
- `GOV-01F` è un controllo compensativo di provenance + required exact-SHA gate, non branch protection;
- il post-merge su `main` valuta il merge SHA separatamente dalla PR head.

Un workflow con un nome storico può restare regression evidence sul codice corrente; il nome non promuove una vecchia release o slice a current authority. Non tutti i workflow hanno gli stessi trigger e non tutti girano a ogni evento.

L'orchestrazione utente/agente è esterna: una correzione crea una nuova HEAD e invalida l'accettazione precedente. L'agente può osservare, materializzare una nuova candidate e diagnosticare; non può trasformare un check in successo né sostituire la decisione di merge.

## Freshness vs coerenza semantica

C5 freshness e documentation freshness sono controlli di **immutabilità relativa**: rilevano che un input/receipt è cambiato o è rimasto uguale. Non dimostrano, da soli, coerenza semantica cross-owner.

Il debito noto è registrato come `D-RSC` in `v3/semantic-owner-contract.json`. Il documentation runtime esercita ora anche le failure family note: legacy authority classificata come current, UI prose che diverge da Home/Process Hub executable owners, OpenAPI che nomina la Suite DEMO sbagliata, PR governance declaration senza corrispondenza nel diff, laundering di GAP-022/CodeQL/legacy residue e confusione fra freshness e consistency.

Questo non è un solver globale di equivalenza semantica. Se emerge un nuovo drift, va aggiunto al vocabolario D-RSC e al falsificatore pertinente. Method/path parity di un'API non implica semantic freshness della descrizione.

CodeQL resta supplemental/conditional: se l'exact-head check è `skipped`, l'evidenza CodeQL è **non eseguita**, non verde. I rail first-party required mantengono il proprio verdetto indipendente.

## Exact-head e freshness

Il colore appartiene allo SHA eseguito. Dopo una correzione, il verde del commit precedente è genealogia. PR acceptance richiede gli artifact/check della exact PR HEAD corrente; `skipped` significa non eseguito, non passed.

Un `SemanticClosureReceipt` aggiunge un secondo vincolo più selettivo: se cambia il digest di un input semantico dichiarato o di una dependency receipt, la closure è stale e deve essere rieseguita. Un cambiamento non dipendente può non invalidare quel receipt, ma non elimina mai l'obbligo exact-head per l'accettazione della PR.

## Browser / accessibilità

I journey automatizzati sono E2 repository evidence e non sostituiscono review umana di usabilità, VoiceOver/NVDA, zoom/reflow/contrast/focus o verifica fisica degli export.

## Evidence / security

I test verificano identity/version binding, authorization, checksum, XML/PDF/ZIP shape e limitation. Non attestano autenticità esterna, applicabilità legale, effectiveness, security del deployment, configurazione server-side di GitHub o assurance indipendente.

## GOV-TRAMA-COMPASS-1 — governance falsification

`node v3/trama-engineering-check.mjs` verifica target enterprise 16 assi / 64 requisiti, profilo a 8 meccanismi / 56 controlli, Bussola generated e separazione delle authority. `node v3/trama-engineering-saturation.mjs` esegue **1.000.000** mutazioni deterministiche, pair coverage, deletion oracle e un tail no-novelty di almeno **100.000** casi.

La qualificazione non trasforma mutation in prova fisica, umana, deployment o GitHub server-side. `docs/ENGINEERING_COMPASS.md` deve essere byte-identica alla projection rigenerata dagli owner correnti; qualunque nuovo SHA riapre l'accettazione.

## GOV-TRAMA-RECONCILE-1

Il convergence gate separa intenzionalmente il falsificatore deterministico dalle due saturation storiche: `convergence-authority-check.mjs` verifica authority/workbook/reconciliation; `decide-0-saturation.mjs` e `trajectory-governance-saturation.mjs` sono leaf native distinti. La separazione non riduce copertura: rende failure e timeout attribuibili e preserva il principio nearest-falsifier-first.


La rail current esegue:

```bash
node v3/trama-reconcile-check.mjs
node v3/trama-reconcile-saturation.mjs
```

Il check confronta authority, owner correnti, remediation registry, legacy census, Compass e critical path. La saturation attraversa 8 campagne L0→L7 (ferro, persistence, runtime, semantic, governance, product, experience, enterprise), **3.000.000** casi, 64 failure family, tutte le 2.016 coppie e una coda no-novelty da **100.000** casi. Questi numeri qualificano il modello semantico: non sono browser session, human study, deployment evidence o prova formale di minimalità globale.

Un candidate path legacy non è un failure per nome. Il failure è una classificazione assente o una responsabilità blocking ancora corrente.

Il legacy census è vincolato al tree committed dell'exact HEAD con `git ls-tree -r --name-only HEAD`: mutable index, file untracked e artefatti transitori creati da test precedenti non possono cambiare la governance truth dello stesso commit.


## Strategic AS-IS convergence campaigns

`GOV-ASIS-CONVERGENCE-1` aggiunge tier **scoped** 100k / 1M / 10M per AS-IS ratchet, Enterprise Candidate target, authority topology, document/governance coherence e cognitive order cross-surface. Non cambia i tier generici TRAMA 1k / 100k / 1M.

Il ceiling strategico 10M non autorizza brute force: survivor o nuova failure family richiedono remodelling. La saturazione semantica chiude solo quando `M+10k` non aggiunge nuove root family; la compressione chiude solo quando `N+10k` non trova un set di meccanismi più piccolo senza perdita. Mutation count resta model evidence, mai prova fisica, umana, deployment o legale.


### HUMAN-REALITY-RUNTIME-1

`node v3/human-reality-runtime-check.mjs` verifica il value object `decisionContext` come estensione authority-zero dei checkpoint umani esistenti: 20 primitive H01–H20 preservate, 10 assi strutturati, outcome neutrality, binding audit/epistemic, retention nelle projection e assenza di store/writer/SOT paralleli.

`node v3/human-reality-runtime-saturation-10m.mjs` esercita 32 failure family dalla finalità umana fino al binding runtime/evidence, tutte le 496 coppie, cross-layer compositions, deletion oracle e pairwise no-loss compression dei 10 assi. I trial sono evaluator calls del modello semantico, non browser session, persone, casi legali o mutazioni fisiche del codice. La qualifica usata per questa slice esegue il comando con 10.000.000 trial, 1.000.000 di holdout e seed distinti per ciclo; l'accettazione locale richiede 10 cicli completi con zero survivor/novel family.


### UIUX-656-ABSORB-1

`node v3/uiux-656-absorption-check.mjs` verifica la riconciliazione lossless dei 656 finding screenshot-derived: 656/656 mapping primario, 22/22 superfici, 12/12 root-cause, 10 meccanismi, owner canonici e nessuna nuova composition/write authority.

`node v3/uiux-656-absorption-saturation-10m.mjs` esercita 32 failure family da linguaggio business e densità dei record fino a responsive/accessibilità e governance owner, includendo tutte le 496 coppie, cross-layer composition, deletion oracle e no-loss compression dei 10 meccanismi. I trial sono evaluator calls del modello semantico: non sono browser session, human study, deployment evidence o code mutant compilati.

## Copertura E2E: unità di misura e limite di inferenza

Un indicatore riproducibile deve dichiarare il **denominatore** prima del risultato. Per misurare una copertura E2E del prodotto, enumerare le transizioni nei [sette journey](04_USER_JOURNEYS.md), il ruolo che le può compiere, lo stato iniziale, la mutazione attesa, il readback e il receipt; per ciascuna transizione eseguire il test sulla medesima revisione, registrando PASS, FAIL o SKIP. Non usare il numero di test, le operazioni [OpenAPI](openapi.yaml), i trial del modello o i path citati nei sorgenti come sostituti del denominatore di scenari eseguiti.

Un censimento automatico di path API nei test è soltanto una **proxy statica di tracciabilità**: la presenza testuale del path non prova il metodo HTTP, l'autorizzazione, l'esecuzione o l'asserzione di readback. Se manca un catalogo esaustivo di scenari eseguiti, il valore `E2E coverage %` è **non misurabile**; riportare separatamente la proxy con regola di matching, numero di operazioni, limiti e revisione. La verifica di riavvio della stessa directory SQLite è uno scenario distinto dal bootstrap su stato vergine.

## Ricevuta E2E delimitata della Fase 7

`node v3/e2e-coverage-7x3-check.mjs` scrive `artifacts/e2e-coverage-7x3.json`: 21 casi = 7 processi canonici × 3 ruoli. Ogni caso esegue una richiesta HTTP reale su server e SQLite isolati, verifica identità di ruolo, proiezione per processo, integrità e lettura auditor. La percentuale risultante misura **solo questa matrice di proiezione/readback**, non i lifecycle business, le UI browser o le 121 operazioni OpenAPI. Gli impedimenti a Chromium nell'ambiente di esecuzione sono `BLOCKED`, non PASS.

## PR239: qualificazione controfattuale individuale e denominatore E2E

`npm run docs:causal` censisce i documenti Markdown/RST/TXT Git tracciati e fuori da `docs/documentation-manifest.json`, ricava per ciascuno SHA-256, titolo, classe descrittiva, riferimenti statici e link relativi, esegue in copia isolata la **rimozione fisica di quel singolo file**, lancia `node scripts/documentation-lattice-check.mjs`, ripristina il file e registra l'esito in `artifacts/document-causal-qualification.json`. La classificazione è **documentale e source-level**, non una review umana del contenuto né la dimostrazione dell'assenza di consumer esterni. La prova misura quanto l'oracolo documentale attuale si accorge della mancanza: un test che passa dopo la rimozione è un GAP di rilevazione, **non** un permesso di cancellazione. La disposition di ogni file resta `HOLD_REVIEW`. Non si modificano manifest o owner senza una decisione separata.

`npm run e2e:denominator` legge il documento owner `docs/04_USER_JOURNEYS.md`, estrae nove varianti di journey dichiarate (sette processi, incluse le tre varianti RN-01), e censisce 53 passi numerati. La ricevuta `artifacts/e2e-journey-denominator.json` distingue i 21 readback HTTP processi×ruoli già eseguibili dal **percorso completo** azione→decisione umana→persistenza→readback→receipt. Nessun test parziale è promosso a prova del passo integrale. Il numeratore full-step non è attestato automaticamente e la copertura E2E globale di prodotto rimane `null`; il documento contiene inoltre interazioni UI/negative path/ruoli non necessariamente enumerati nei 53 passi. Questo è un **denominatore di lavoro dichiarato**, non un test globale passato.

La saturazione di `v3/trama-engineering-saturation.mjs` ha una propria superficie e un proprio oracolo di no-novelty. I risultati non si possono estendere per inferenza alla saturazione globale del repository. Analogamente, una campagna di 10M scenari modellistici non è una campagna di 10M patch fisiche eseguite contro gli owner runtime.

### Qualificazione documentale di ogni file fuori manifest — limiti dell'oracolo

`npm run docs:check` esamina ora i target di collegamenti Markdown relativi da **tutti** i documenti sotto `docs/`, non solo dal gruppo autoritativo del manifest. Questo verifica la conservazione dei riferimenti osservabili senza attribuire ai materiali storici una nuova authority.

`npm run docs:causal` rimuove fisicamente, uno alla volta in copia isolata, i documenti fuori manifest, ripristina ogni byte e registra una ricevuta per file. La prova negativa fallisce quando un documento destinazione di un link Markdown osservato non è intercettato da `docs:check`. Nel candidato PR239 la rilevazione è salita da 3 a 17 su 149; **132 non intercettati non significano 132 documenti inutili**. Gli import non letterali, la compatibilità esterna, le citazioni non Markdown e l'utilizzo umano richiedono prove separate. L'autorità documentale resta `docs/documentation-manifest.json`; zero file eliminati o deprecati automaticamente.

### PR239 — first-party references and a second live HTTP coverage slice

`node scripts/executable-doc-reference-check.mjs --falsify` now supplies an
**independent** first-party consumer gate: enumerate explicit `docs/*.md` references
from executable `v3/` sources and GitHub workflow files; require every referenced
file to exist, and physically remove/restore each off-manifest target in an
isolated copy to demonstrate failure when a real consumer edge is lost.
This does **not** alter document authority or broaden `docs:check` into a
runtime-source parser. The combined bounded evidence currently includes 17
unregistered documents protected by Markdown links and 13 by first-party
executable literals (six overlap): **24 distinct targets**, leaving 125
outside both bounded oracles. Those 125 remain `HOLD_REVIEW`, NOT safe deletes.
Dynamic paths, human usage, external references, legal retention and history
are not excluded by either oracle; a single unrelated test passing does not
prove the absence of dependencies.

`node v3/e2e-guide-7x3-check.mjs` executes 21 additional live HTTP views
(seven existing procedure guides × admin/user/auditor), validating the canonical
process identifier, source authority, presence of human transition checkpoints,
and three negative paths for placeholders/unknown procedures. It is a
**different 21-cell slice** than the existing bootstrap 7×3 probe. These two
read-only slices do not establish end-to-end completion of any of the 53
documented business journey steps; no global E2E percentage is claimed.
