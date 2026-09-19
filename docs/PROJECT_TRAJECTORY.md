# Traiettoria del progetto ICTC

Questo documento è **lineage progettuale**, non autorità dell'AS-IS e non live mirror di GitHub. In caso di conflitto prevalgono l'owner della classe di verità, il runtime eseguibile e i fatti Git osservati. Una PR open/draft, un file più recente o un alto numero di mutation trial non diventano current truth per recenza.

## Lettura per epoche

La storia completa delle singole PR resta in Git/GitHub. Questa pagina comprime la genealogia in movimenti ingegneristici utili a capire perché gli owner correnti hanno questa forma.

### E1 · Fondazione e falsificazione
Le prime generazioni costruiscono API, RBAC, monitoring, incidenti, evidenza e runtime iniziale. La crescita rende visibile presto un rischio ricorrente: una capability dichiarata o un test interno non equivalgono a readiness esterna.

### E2 · Workbench e canonicalizzazione
Il prodotto amplia i journey e introduce persistenza, audit, procedure, identity/security boundary e strutture GRC. La varietà funzionale viene progressivamente ricondotta a owner, registry e contratti condivisi.

### E3 · Kernel semantico e sette procedure
Si stabilizzano esattamente sette business procedure, la centralità della decisione umana, SQLite/WAL come persistenza standard, SubjectVersion/EpistemicStep e una direzione unica per write authority, readback e receipt. EP-01 resta vista trasversale, non ottavo processo.

### E4 · Experience, epistemic lattice e demo isolata
Experience convergence, reticolo epistemico, journey reali delle sette procedure, demo sintetica isolata e role guidance spostano il focus dalla sola correttezza del dominio alla comprensibilità operativa.

### E5 · Stratigrafia di presentation e retirement
L'accumulo di enhancer, finalizer e late CSS resolver produce debito di ownership. La risposta diventa compressione: owner locali, composition root unico, annotation-only globale e retirement dei layer concorrenti.

### E6 · Truth, reliability e assurance boundaries
Capability truth, temporalità epistemica, runtime reliability e browser evidence rafforzano la distinzione tra repository proof ed evidenze umane, di governance o deployment.

### E7 · Convergence governance e owner compression
Workbook, target scope, reality rehearsal, semantic-owner contract e convergence authority rendono esplicito che Git possiede i live merge facts mentre i file committati possiedono planning durevole e osservazioni, non un contatore live.

### E8 · Capacity, delivery, demo e runtime-semantic convergence
Il repository separa runtime standard e substrate enterprise C3/PostgreSQL, disciplina bootstrap/PaaS, Public DEMO read-only, provider AI e semantic owner/freshness.

## Pattern da preservare

`expansion -> falsification -> compression -> new capability`

- **Expansion** crea una capacità o un'ipotesi utile.
- **Falsification** cerca failure family, collisioni di authority, regressioni e claim eccessivi.
- **Compression** elimina duplicazioni, riduce owner concorrenti e rende esplicito il boundary.
- **New capability** riparte quando la responsabilità precedente è leggibile e falsificabile.

## Anti-pattern osservati

1. **Late presentation ownership.** Enhancer/finalizer/resolver tardivi accumulano autorità implicita.
2. **Post-merge truth reconciliation.** Un file committato che tenta di essere live mirror di Git crea lag e PR di riconciliazione.
3. **Stacked topology churn.** Ref/branch/tooling churn può produrre molte modifiche senza equivalente incremento di prodotto.
4. **Mutation-count inflation.** Molti trial non compensano un oracle correlato o una failure family assente.
5. **Same-circuit assurance.** Modello, implementazione, oracle e closure nello stesso circuito non creano indipendenza.
6. **Second-source repair.** Correggere una proiezione aggiungendo una nuova authority sposta il problema invece di chiuderlo.

## Stratigrafia Git

La traiettoria ha lasciato molti branch nominati perché le slice sono state sviluppate come candidate state isolate. Visti retrospettivamente, sono **etichette su fotografie t-1, t-2, …, tn**: la fotografia precisa è però lo SHA del commit/PR head, perché un branch è un puntatore mutabile e può avanzare o essere riutilizzato.

La permanenza di un branch non significa che quella slice sia ancora attiva o autorevole. Il numero di branch non misura debito, maturità o parallelismo corrente; branch scratch/tmp/noop possono essere puro residuo di tooling. La storia canonica resta nel commit graph e nelle PR merged, mentre l'AS-IS resta su `main` e negli owner correnti.

Analogamente, i molti workflow sono una stratigrafia di falsificatori: rail nate per una failure family possono restare come regression oracle sulla HEAD corrente senza diventare release authority. Il punto di convergenza è l'evidenza exact-SHA, non il nome storico della rail.

## Metodo che emerge dalla storia

Il metodo operativo corrente è in `docs/DEVELOPMENT.md`:

`observe -> bound -> owner -> falsifier -> minimal change -> adversarial mutation -> exact-head evidence -> human merge`

Il repository matura quando una nuova generazione **riduce l'ambiguità di responsabilità** almeno quanto aumenta la capacità.

## Confine temporale

Questo documento viene aggiornato per epoche e pattern, non a ogni merge. Per HEAD corrente, PR merged/open e check correnti, interrogare Git/GitHub. Questa storia non sostituisce `v3/release-identity.json`, `docs/PRODUCT.md`, `docs/11_ARCHITECTURE.md` o `docs/convergence/convergence-authority.json`.
