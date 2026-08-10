# Traiettoria del progetto ICTC

Questo documento è **lineage progettuale**, non autorità dell'AS-IS. In caso di conflitto prevalgono `docs/authority-matrix.yaml`, runtime eseguibile e release identity corrente.

## Origine → convergenza corrente

L'analisi delle PR merged dall'origine alla PR #59 mostra quattro movimenti ricorrenti.

### 1. Fondazione epistemica e primi journey
Le prime generazioni hanno fissato separazione tra osservazione, proposta, decisione umana ed evidenza; hanno costruito ingestion, incidenti, monitoring e primi contratti UI/runtime.

### 2. Espansione dei processi e hardening
Le generazioni successive hanno aggiunto GRC, registry/procedure adapters, identity, security boundary, enterprise posture, persistenza e audit. La crescita ha prodotto sia capacità sia duplicazioni storiche, poi progressivamente compresse.

### 3. Convergenza delle autorità
Le PR di stabilizzazione hanno spostato il prodotto verso owner espliciti: authority matrix, semantic projections, SubjectVersion, EpistemicStep, evidence graph, integrity binding, standard library e procedure policy. La persistenza corrente è migrata a SQLite mentre parte della documentazione storica era rimasta ancorata a `state.json`.

### 4. Convergenza esperienziale
PR #57 ha consolidato Experience V1.9; PR #58 ha corretto difetti visuali reali e introdotto primitive/polish assurance; PR #59 ha introdotto EP-01, inferenza human-ON e cross-procedure creation; PR #60 percorre realmente tutte le sette procedure, rende revision-bound il refresh delle superfici, introduce navigazione progressiva del reticolo e completa la convergenza di Postura/evidence export/documentazione.

## Pattern da preservare

La traiettoria più sana è stata **espansione → falsificazione → compressione → nuova capacità**. Il progetto degrada quando una nuova generazione aggiunge un secondo owner, un nuovo vocabolario o un override senza ritirare quello precedente.

Per questo la candidate corrente adotta tre regole:

1. un dato autorevole può avere molte rappresentazioni ma un solo owner;
2. ogni nuovo layer deve giustificare una responsabilità non assorbibile da quelli esistenti;
3. la documentazione corrente descrive l'AS-IS; la storia resta qui, separata e non normativa.
