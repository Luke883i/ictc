# ICTC C1 — Migrazione fisica integrale `v3/` → `src/`, `public/`, `tests/`

Questa PR contiene il **cutover reale del software**, non una sola proposta documentale. La baseline verificata è `main@e641526114a508e24f86e8554c027d8cd6bbe715` (merge #272). La branch candidata conserva i sette processi e le authority dichiarate. La cancellazione di `v3/` si riferisce alla directory corrente: la storia Git rimane consultabile.

- Trajectory impact: reconciliation
- Convergence slice: C1-COMPAT-CONTRACTION
- Intent digest: c49a9d30d10117f4b50773a160d45cc2986e2115017fdf97e07315a7fd986561
- Exact preimage: CI_BASE
- Exact postimage: CI_HEAD
- Semantic neighborhood / owner set: `docs/PRODUCT.md` (invariato); `docs/authority-matrix.yaml` (owner reindirizzati); `src/bootstrap.mjs`, `src/server.mjs`, `src/store.mjs`, `src/runtime/`, `public/`, `tests/`, `scripts/`, `.github/workflows/`; `docs/convergence/convergence-authority.json` e relativa proiezione workbook.
- Target predicates: zero blob Git sotto `v3/`; entrypoint unico `src/bootstrap.mjs`; contenuto degli asset HTTP e behavior verificati; parser, contratti, write/readback SQLite, API, runtime e browser falsificabili; archive PR8 originale intatto; no implementazioni parallele.
- Negative predicates: rifiutare resurrezione `v3/`, doppio owner, root browser errata, consumer CI inesistente, import Python ambiguo, falso Git preimage, falsi PASS o eliminazioni non autorizzate.
- Material runtime delta: cutover integrale di tutte le directory correnti `v3` verso `src`, `public`, `tests` e `scripts`, con riconciliazione dei loader, fixture, asset, path-sensitive test, CI e import; 22 wrapper storici non mantenuti come runtime parallelo.
- Witness receipt: BLOCKED (exact-head GitHub CI non interamente verde; test locali e Git tree non sostituiscono CI).
- Closure verdict: OPEN (no merge finche i gate non sono verificati su PR HEAD).
- One next action after ACT: convergere i failure effettivi dei workflow #274 senza creare un secondo sistema di verification, poi convalidare main post-merge.
- Adjacent-layer alignment witness: `src/server.mjs` → handler `src/runtime/` → persistence SQLite → `public/` → browser sotto `tests/browser/`; historical tests su preimage Git autentica, test correnti sui path migrati.
- Repository hygiene delta: root minima conservata; `v3/ = 0` nella branch; implementazioni complete storiche conservate soltanto quando coperte da consumer/lineage; nessun auto-delete su zero-import.
- Lossless semantics disposition: UPDATED
- Current semantic input fingerprint: CI_COMPUTED
- TRAMA E2E layers: L0-FERRO+L1-PERSISTENCE+L2-RUNTIME+L3-SEMANTIC+L4-GOVERNANCE+L5-PRODUCT+L6-EXPERIENCE+L7-ENTERPRISE
- Method clusters: UNDERSTAND+EXECUTE+PROTECT+EXPERIENCE+CONTROL+FALSIFY

## Scope, proof e rollback

- **Business:** sette processi RN, EC, AO, MC, AP, RC, AR e decisioni umane; nessuna nuova capacita legale o compliance auto-certificata.
- **Software:** Node ESM, UI vanilla, HTTP e SQLite preservati; asset sotto `public/`, moduli sotto `src/`, regressioni sotto `tests/`.
- **Repository:** root priva di `v3/`, history e archive preservati, CI ancorata alla HEAD, cicli negativi e readback. Un controllo storico si esercita nella sua vera revisione, senza riscrivere un falso preimage per ottenere il PASS.
- **Non-goal:** E3-HUMAN, E3-GOV, E4-DEPLOY non si chiudono con un test repository. Non equiparare 10M model-mutants a mutazioni fisiche.
- **Rollback:** revert commit di migrazione e verificare `npm test` e l'identita della precedente `main` prima di riaprire modifiche; nessun force-push.

La PR rimane draft finche il gate exact-head `enterprise-candidate` e i workflow di prodotto/CI pertinenti non sono verdi. Dopo il merge verificare di nuovo la nuova main, inclusa `v3/ = 0`.