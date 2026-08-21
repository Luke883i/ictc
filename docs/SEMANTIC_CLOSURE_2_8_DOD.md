# Semantic Closure 2.8 — audit consolidato, DoD e falsificazione

Status: candidate slice
Date: 2026-08-21
Base: `main@a38db0261fb1298fda6617bcc7ab6f3f7a1dae75`

## Scopo

La slice converte finding di secondo ordine in invarianti riusabili. Non aggiunge un nuovo processo, un nuovo owner o un nuovo motore di verità. La compressione target è: **meno eccezioni semantiche, più binding espliciti, più fail-closed, meno dipendenza da ordine implicito o nomi accidentali**.

`done` in questo documento significa **closure della slice**. Non significa production readiness, conformità legale, fine dello sviluppo o maturità verticale completa di RC/AR.

## Finding consolidati e decisione

| Finding | Causa | Mutazione applicata | Falsificatore |
|---|---|---|---|
| contract/runtime drift RN activation | contratto richiedeva rationale non raccolta dal prodotto | contratto corrente allineato al checkpoint umano reale; `reasonRequired=false` | `semantic-closure-2-8-runtime-check` |
| residual vecchio oscura nuovo inherent | selezione residual assoluta | review effettiva = review temporalmente più recente tra inherent/residual | runtime check + saturation |
| trattamento vecchio trapassa il ciclo | treatment non bound alla review | nuovi treatment con `assessmentSha256`; legacy valido solo se posteriore alla review corrente | runtime check + saturation |
| external evidence osservata ma non stabile | `observedAt` bastava per `usable` | external `usable` solo con `observedVersion` o digest | reference/runtime check |
| AI semantics dipendente dal nome action | regex/fallback | registry esatto di compatibilità per action AI note; forward contract resta `epistemicEffects` | causality check |
| handoff semanticamente piatto | predicate generico su ogni arco | predicate intent-specifico sui 24 archi | causality/cross-create check |
| draft-cycle amplification | nessun bound lineage | lineage esplicita, max depth 8, reject su processo già visitato | cross-create + saturation |
| semantic finalizer fuori C0.1 | enhancer 2.7 poteva terminare dopo flush iniziale | lifecycle iniziale coalesced e copertura context/projection events; C0.1 ultimo converger | UI check |
| projection commit non governato direttamente | listener C0.1 incompleto | `ictc:projection-committed` entra nel lifecycle | UI check |
| OutcomeEnvelope doctrine letterale non più AS-IS | documentazione stratificata | boundary riformulato: canonical read projections + write envelope/receipt; mai raw persistence entity | ADR/docs check umano + saturation vocabulary |
| mutation volume può mascherare vocabolario stretto | conteggi usati senza dichiarare fault vocabulary | 11 famiglie nominate, discovery/holdout e limitation esplicita | saturation 2.8 |

## DoD globale

- **G1 Authority conservation** — nessun nuovo owner business/UI/persistence; zero widening di AI authority.
- **G2 Temporal closure** — nuova base decisionale non può essere oscurata da stato/decisione di un ciclo precedente.
- **G3 Evidence identity** — external evidence utilizzabile è version-bound; observed-only resta registrabile ma non decision-grade.
- **G4 Causal closure** — output AI noto non può apparire come osservazione umana per effetto del naming legacy.
- **G5 Reticular boundedness** — ogni cross-process draft conserva intent/provenance, non trasferisce authority e non può ciclare indefinitamente.
- **G6 Constitutional convergence** — ogni evento semantico della UI termina nel lifecycle C0.1.
- **G7 Documentation parity** — README, architecture, epistemic contract, ADR, testing e development descrivono lo stesso AS-IS.
- **G8 Falsification** — 10.000.000 simulation cases + 1.000.000 mutants; 100% kill nel vocabolario dichiarato; holdout 100.000 senza famiglia nuova.
- **G9 Exact-head acceptance** — la slice è promuovibile solo se i check della PR HEAD corrente sono verdi; un SHA precedente non soddisfa il DoD.

## DoD intermedi

### A — Contratto / runtime

- ogni requisito dichiarato dalla slice ha un equivalente runtime/UI osservabile;
- nessuna rationale obbligatoria viene inventata solo per soddisfare un JSON;
- state model semantico può essere derivato da occurrence log senza fingere un singolo campo stato fisico.

### B — Temporalità / evidenza

- `effectiveRiskReview` sceglie il ciclo corrente per tempo;
- il trattamento nuovo è legato al digest della review;
- il legacy treatment non viene perso, ma non può precedere la review effettiva;
- external observed-only: `usable=false`;
- external version/digest-bound: `usable=true` con limitation esplicita.

### C — Causalità / handoff

- output AI legacy noto: family `proposed`, producer `ai-provider`;
- 24/24 archi cross-process con predicate intent-specifico;
- depth massima = 8;
- target già nella lineage = reject;
- source decision non viene clonata nel target.

### D — UI constitution

- un solo composition root;
- cinque participant costituzionali invariati;
- 2.7 non diventa sesto owner;
- rendered/surface/context/projection-committed richiedono convergence;
- initial install usa coalescing e non un flush prematuro.

### E — Documentazione / assurance

- canonical projection ≠ raw persistence entity;
- read projection ≠ necessariamente literal OutcomeEnvelope schema;
- write OutcomeEnvelope/receipt conserva lineage;
- saturation count ≠ probabilità di correttezza;
- repo CI ≠ deployment assurance.

## DoD locali

Per ogni file modificato valgono insieme:

1. owner esistente preservato;
2. compatibilità retroattiva bounded dichiarata;
3. nessuna nuova equivalenza epistemica;
4. almeno un check che fallisca rimuovendo la correzione;
5. nessun bump schema se non necessario al consumer;
6. limitation aggiornata quando cambia il significato di `usable`, `effective`, `current` o `final`.

## DoD reticolari

### Reticolo business

- arco = intent di creazione draft, non decision transfer;
- predicate specifico per source→target;
- lineage visibile e bounded;
- no self edge, no return su processo già visitato.

### Reticolo epistemico/versionale

- producer e family non possono essere promossi dal solo attore iniziatore;
- review/decisione corrente conserva basis/versione;
- nuova basis produce nuovo lavoro, non retroactive truth rewrite.

### Reticolo evidenza/claim

- evidenza esterna usabile identifica la versione osservata;
- claim conserva limitation;
- export resta `same-as-read`;
- receipt prova il record software, non la verità esterna.

### Inter-reticulum

Nessun arco business, EpistemicStep o EvidenceRef può da solo trasformare proposta → decisione, evidenza → conformità o mapping → efficacia.

## Metriche sfidanti

| Metrica | Target slice |
|---|---:|
| nuovi owner | 0 |
| business processes | esattamente 7 |
| handoff typed | 24 / 24 |
| generic handoff predicate | 0 |
| lineage depth massima | 8 |
| process revisit accettato | 0 |
| semantic UI events coperti | 4 / 4 |
| constitutional participants | 5 invariati |
| external observed-only usable | 0% |
| new risk treatments digest-bound | 100% |
| known legacy AI action classification | 100% proposed + AI producer |
| simulation scenarios | 10.000.000 |
| mutation scenarios | 1.000.000 |
| modeled mutation kill rate | 100% |
| mutation holdout | 100.000 |
| new normalized families in holdout | 0 |

## Mutation vocabulary 2.8

1. `contract-transition-runtime-guard-drift`
2. `reason-required-contract-bypass`
3. `residual-shadowing-new-inherent-cycle`
4. `stale-treatment-leaks-new-risk-cycle`
5. `external-evidence-observed-but-unversioned`
6. `action-ai-producer-misclassified`
7. `cross-procedure-draft-cycle-amplification`
8. `generic-handoff-predicate-semantic-flattening`
9. `unregistered-semantic-finalizer-after-constitutional-flush`
10. `projection-commit-bypasses-experience-lifecycle`
11. `outcome-envelope-doctrine-projection-drift`

La saturation non prova che questa lista sia completa. La metrica utile è la capacità dei falsificatori di uccidere mutazioni indipendenti, non il numero assoluto di iterazioni.

## Checklist di accettazione

- [x] branch da exact main base
- [x] fix temporal/evidence senza nuovo owner
- [x] handoff typed e lineage bounded
- [x] causalità AI legacy pin-nata
- [x] C0.1 copre projection/context commit e initial convergence
- [x] falsificatori mirati aggiunti
- [x] saturation 10M + 1M codificata nel gate current
- [x] README rifatto come mappa logica + tecnologica
- [x] architecture/epistemic/ADR/testing/development allineati
- [ ] exact-head GitHub Actions green sulla PR materializzata

L'ultimo punto non può essere anticipato: diventa `x` solo sul commit HEAD effettivamente eseguito in CI.

## Residual risk / prossime slice

Non vengono nascosti:

- RC e AR restano meno maturi verticalmente di RN/EC/AO/MC/AP; la closure trasversale non equivale a deep fine-tuning completo.
- Il fallback epistemico legacy esiste ancora per compatibilità. Il target successivo è migrare ogni write materialmente epistemica a `metadata.epistemicEffects` esplicito e poi ridurre/eliminare l'inferenza da action name.
- Gli external EvidenceRef version-bound non sono monitorati per remote drift; digest/versione identifica la base osservata ma non prova che la risorsa remota corrente sia identica.
- La selezione transaction-time storica non è implementata.
- `business-surface-convergence-2-7` resta enhancer di compatibilità non-finale; una futura compressione può assorbirne le responsabilità nei participant canonici, ma non è necessario creare un nuovo owner.
- La current release suite conserva molti rail storici. `v3/release-identity.json` resta l'autorità della candidate; la compressione fisica dei rail può essere una slice separata per non mescolare semantic closure e rimozione regressioni.

## Rollback

Rollback atomico per commit: runtime temporal/evidence → causal/handoff → UI convergence → tests/saturation → docs. Non rimuovere i falsificatori mantenendo il comportamento mutato: un rollback deve ripristinare insieme contratto e test del medesimo invariante.
