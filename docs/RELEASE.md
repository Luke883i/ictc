# ICTC — procedura di rilascio e DoD semantica

**Classificazione:** guida operativa E2, non fonte autonoma di product/release authority. Le versioni correnti sono possedute da `v3/release-identity.json` e `package.json`; l'identità del prodotto da `docs/PRODUCT.md`; lo stato dei gap da `v3/gaps.json`; il piano da `docs/convergence/convergence-authority.json`; i fatti Git, le approvazioni e i ruleset sono live su GitHub. La presente guida **non** autorizza una release.

## Obiettivo ontologico finale

ICTC deve meritare un rilascio attraverso una catena attribuibile: **software verificato → runtime osservato → prodotto delimitato → repository revisionabile → delivery exact-SHA attestata → decisione umana autorizzata → ambiente operativo verificato**. Una proprietà osservata in un livello non può promuoversi automaticamente negli altri. Una CI verde prova soltanto gli obblighi esercitati, non l'efficacia in produzione o una conclusione di compliance.

**V.1 Experimental** è qui il nome di un *profilo di rilascio proposto*, non una nuova versione SemVer: l'AS-IS rimane ICTC `1.8.0`, `releaseStage: candidate`. **Enterprise Candidate** distingue la postura ingegneristica E2 del workflow `enterprise-candidate` dall'effettiva decisione di promuovere il prodotto. Nessuna delle due qualificazioni viene autoassegnata dal checker.

## Derivazione retrograda dal rilascio

### Misurare la copertura E2E senza false equivalenze

Il denominatore deve precedere il numeratore: una **operazione OpenAPI**, un **scenario utente**, un **workflow** e una **mutazione** non sono la stessa unità. Un riferimento letterale a un URL in un test è un indice di tracciabilità statica; il rapporto `operazioni con URL citata / operazioni dichiarate` **non** misura la copertura E2E. La vera copertura richiede, per ciascun scenario dichiarato, esecuzione reale della catena `UI/API → autorizzazione → transizione → persistenza/readback → receipt/limitazione` su stato deterministico, con esito e revisione identificabili.

Prima di chiamare una percentuale «E2E runtime verificata», registrare elenco degli scenari, perimetro, ruolo, metodo, risultato, eventuali skip, denominatore e test receipt. Dove ciò non è disponibile, riportare `E2E coverage: not measurable` e mantenere separata l'eventuale proxy statica. [Testing](TESTING.md) è l'owner della tassonomia di verifica.

| Piano | DoD globale | Sottosistema di evidenza | Falsificatore |
|---|---|---|---|
| G8 | GO/NO-GO attribuibile e non autocertificato | E3-GOV, E3-HUMAN, E4 | `--require-release` deve fallire senza prove indipendenti |
| G7 | candidato esatto e revisionabile | diff, provenance, rollback, review | PR exact-HEAD e gate di delivery |
| G6 | sicurezza e catena di evidenza separate | trust boundary, scanning, identity | rail security e gap esterni distinti |
| G5 | documentazione e projection senza autorità duplicate | `START_HERE`, manifest, Compass | `npm run docs:check` |
| G4 | esecuzione reale verificata | bootstrap isolato, `/api/health`, integrity, sette procedure | `release-readiness-e2-runtime.mjs` |
| G3 | capacità software e decisionale governata | procedure adapter, RBAC, store, AI | `npm test`, runtime/security rail |
| G2 | repository chiuso sul piano dei riferimenti statici | import locali e chiamate script CI | `release-readiness-e2-check.mjs` |
| G1 | identità e limiti di prodotto espressi correttamente | release identity, PRODUCT, gap truth | `release-readiness-e2-check.mjs` |

**12 DoD intermedi e 24 locali**: definizioni, parent ID, predicati e risultati computabili sono restituiti in JSON da `v3/release-readiness-e2-check.mjs`; non vengono duplicati come una seconda authority. Gli identificativi L01–L24 coprono processi, versioni, import, workflow, owner, decisioni, HTTP runtime, documentazione, sicurezza, review ed evidenze esterne.

### Metriche e criteri di accettazione

- `missingStaticImports=0`, `missingWorkflowRefs=0`, `localDoD=24/24`; nessuna soglia percentuale compensa un predicato mancante.
- Runtime E2: bind `127.0.0.1`, stato temporaneo isolato, HTTP 200, `integrity.ok=true` (o `valid=true`), procedure effettivamente abilitate `7/7`; il test elimina lo stato temporaneo.
- Falsificazione: 30 mutazioni materiali dei fatti semantici derivati dai sorgenti, una per famiglia e sei composte; 1.000.000 schedulazioni semantiche deterministiche, seed `0x51ee0b1a`, 100.000 holdout, sopravvissuti 0. È prova di **modello compilato**, non 1M rewrites di codice né proof di assenza universale.
- Selezione: 1.000 combinazioni bounded di copertura × owner × affidabilità dell'evidenza; un solo candidato ammissibile nel modello (`C9-0-9`), senza pretesa di ottimalità universale.
- Release gate: il solo `E2 PASS` **non concede** rilascio; `--require-release` deve produrre exit nonzero. Non si sostituiscono evidenze E3/E4 con valori hardcoded, mock, CI o file compilati localmente.

## Checklist operativa, responsabilità e blocchi

1. **Maintainer / reviewer:** verificare commit e Git tree esatti, PR diff, owner e rollback. Una PR merged non è un release tag, una review indipendente né una configurazione di branch protection.
2. **Ingegneria:** eseguire `node v3/release-readiness-e2-gate.mjs`, `node v3/release-readiness-e2-mutation-1m.mjs`, `npm run docs:check`, `npm test`, `npm run release:check` sulla medesima candidate; salvare exit code, seed, SHA e ricevute. Per una release usare il workflow C2 SBOM/provenance/attestazione exact-SHA, non un pacchetto ricreato altrove.
3. **Owner del prodotto:** verificare esattamente RN-01, EC-01, AO-01, MC-01, AP-01, RC-01, AR-01; EP-01 resta trasversale. Mapping, scoring e prova integrità non sono conformità giuridica.
4. **Security/ops/IdP:** collaudare scanning, identità/deprovisioning, chiavi, backup/restore, osservabilità e attivazione dei controlli sul deployment. Sono evidenze esterne, non documenti che il repo possa firmare autonomamente.
5. **Human reviewer / governance:** attestare review realmente indipendente e ruleset preventivi applicabili a `main`; verificare GAP-022 osservando GitHub, non `CODEOWNERS` o GOV-01F compensativo.
6. **Utenti rappresentativi:** raccogliere validazione di comprensione, task, accessibilità assistiva (GAP-012). I browser test non rappresentano consenso umano.
7. **Release authority:** decidere GO/NO-GO solo dopo risoluzione o eccezione formalmente autorizzata e tracciata di GAP-007/009/012/014/020/021/022; non autocertificare l'eccezione con una stringa CI.
8. **Deployment operator:** verificare il medesimo artefatto attestato, ambiente, smoke e rollback dopo approvazione; produrre ricevute attribuibili E4.

## C2 — provenance e attestazione del candidato esatto

Il controllo C2 del repository parte dall'**exact candidate** (checkout della exact PR HEAD) e produce nello stesso job l'archivio candidato tramite `git archive`, **CycloneDX** SBOM, manifest di provenance e digest degli input/output. Il subject corrisponde allo SHA e al tree SHA del candidato, non a una ricostruzione indipendente.

La firma e l'attestazione repository-bounded usano **GitHub OIDC** e **Sigstore** in modalità keyless con action pin immutabili. Il workflow esegue la verifica `gh attestation verify` sul subject e sul repository prima della ricevuta canonica C2; build provenance, SBOM attestation, `package.json`, `package-lock.json`, archivio e digest sono collegati all'exact checkout.

**merge non equivale a release**: CI, firma, verifica C2 e merge non sono approvazione umana, deployment attestato, Enterprise Candidate o Enterprise Ready. F-06/C2 è repository-terminal E2 dopo POST-216 ACT, ma i rail E3/E4 restano separati. Nessuna procedura qui crea una seconda pipeline SBOM o un canale alternativo di signing.

## Comandi realmente presenti

```bash
npm ci --ignore-scripts
npm run docs:check
npm test
npm run release:check
node v3/release-readiness-e2-gate.mjs
node v3/release-readiness-e2-mutation-1m.mjs
# Per falsificare esplicitamente il GO/NO-GO, creare una ricevuta runtime separata:
ICTC_RELEASE_RUNTIME_WITNESS=/tmp/ictc-release-e2-witness.json node v3/release-readiness-e2-runtime.mjs
ICTC_RELEASE_RUNTIME_WITNESS=/tmp/ictc-release-e2-witness.json node v3/release-readiness-e2-check.mjs --require-release
# L'ultimo comando deve uscire con codice 3; rimuovere la ricevuta temporanea.
```

`--require-release` è intenzionalmente **NO-GO** senza autorizzazione esterna verificata. Gli script storici `npm run visual`, `git:handshake` e `release:manifest` non sono comandi definiti nel `package.json` corrente: non usarli come criteri di certificazione.

## Release evidence v2 — oracoli indipendenti e decisione condizionale (A1–A5)

L'owner resta il **gate E2 corrente**, non nasce un nuovo release authority o workflow. Le osservazioni sono distinte:

- **A1 — Falsificazione del codice:** `node v3/release-readiness-e2-product-mutants.mjs` copia la codebase in una directory temporanea, muta **10 file/superfici reali in serie** (health, registry, integrità, versione, documento, sicurezza), esegue il gate vero dopo ogni mutazione e cancella la copia. Ogni mutante deve essere *ucciso*. È un campione avversariale bounded, non un milione di patch.
- **A2 — Priorità:** `selectConvergentPolicy()` valuta 1.000 candidate, applica vincoli e frontiera di Pareto, poi sceglie per ordine dichiarato: integrità dell'evidenza esterna, riuso degli owner, copertura e costo. Non presuppone un solo candidato ammissibile e non pretende ottimalità universale.
- **A3 — Stato dinamico:** `L21–L23` non impongono più che i gap rimangano aperti: una chiusura o mitigazione è accettabile soltanto se il relativo esito è verificato da un soggetto esterno; la chiusura testuale da sola fallisce. Il gate E2 standard non può autocertificare il verificatore.
- **A4 — Runtime:** il health readback usa la stessa registry costituzionale per l'atteso e confronta **insieme esatto, unicità, cardinalità, versione e integrità**. I duplicati che preservano il numero totale non superano più lo smoke.
- **A5 — Decisione:** `evaluateReleaseEligibility()` esplicita i criteri per `GO_ELIGIBLE_PENDING_HUMAN_EXECUTION` solo con candidate exact-SHA/tree/digest, attestazioni E3/E4 indipendentemente verificate, gap chiusi o eccezioni verificate, identità separate per autore, reviewer e release authority. **È un predicato di eleggibilità, non un'azione di pubblicazione.** I test positivi usano un verificatore *fixture*, non credenziali o attestazioni vere. In assenza di verificatore esterno, `--require-release` rimane `NO_GO` (exit 3).

`v3/release-readiness-e2-mutation-1m.mjs` rimane disponibile come **lineage del modello astratto**, ma non è più prova bloccante del prodotto: il milione di schedulazioni bitmask è tautologico rispetto ai bit attesi. La rail corrente usa i mutanti materiali e i controesempi E3/E4 verificabili; il legacy non viene eliminato per preservare la provenienza delle precedenti campagne. Nessun GO è stato osservato su un deployment reale.

```bash
node v3/release-readiness-e2-gate.mjs
node v3/release-readiness-e2-decision-check.mjs
node v3/release-readiness-e2-product-mutants.mjs
# Verifica negativa: senza attestazione esterna, anche un witness reale NON autorizza il rilascio.
# Creare il witness runtime con lo script sopra e rieseguire il comando --require-release.
```

## Esito AS-IS e confine TO-BE

All'ultima ricognizione l'AS-IS conserva `releaseStage=candidate`, `enterpriseCandidate=false`, `enterpriseReady=false`. Restano aperti `GAP-007`, `GAP-009`, `GAP-012`, `GAP-014`, `GAP-020`, `GAP-021`, `GAP-022`. Il DoD E2 può essere verde e il rilascio restare correttamente **BLOCKED**. S4-A6-CLOSE, C1/C3/C4 e S5-CANDIDATE-SEAL mantengono authority nella convergenza e non sono chiusi da questa guida.

La release, qualora autorizzata in futuro, richiede SemVer, changelog, tag/asset esatto, attestazione, note di incompatibilità, migrazioni, ricevute post-merge/post-deploy e rollback verificato; il suo contratto non viene soddisfatto dalla sola creazione di una PR.

## Misura E2E parziale — candidato Fase 7

Il test `v3/e2e-coverage-7x3-check.mjs` misura il sottoinsieme HTTP per sette processi e tre ruoli; non può promuovere la copertura E2E complessiva a 100%. Mancano denominatore esaustivo di transizioni business e attestazione di completamento UI/processo. Il gate di release resta vincolato alle prove effettive exact-HEAD e a evidenze indipendenti E3/E4.
