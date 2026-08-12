# Dati e storage

## Modello corrente

- `data/seed.json`: dati dimostrativi versionati, non stato runtime;
- `${ICTC_RUNTIME_DIR:-runtime}/state.sqlite`: autorità persistente locale corrente;
- `${ICTC_RUNTIME_DIR:-runtime}/attachments/`: byte degli allegati locali;
- `schemas/`: contratti machine-readable;
- `.ictc/`: PID e log del launcher, non fonte di verità.

SQLite usa WAL, `synchronous=FULL` e foreign key. Nel database la responsabilità è separata fra snapshot mutabile e strutture append-oriented per audit, payload/versioni semantiche ed EpistemicStep. Il runtime verifica il binding fra stato, audit e storia semantica prima di accettare la materializzazione come coerente.

`state.json` è soltanto un input legacy importabile e archiviato durante la migrazione; `ledger.jsonl` non è una fonte operativa della release corrente. Nessuna guida operativa deve presentare questi formati ritirati come target di backup.

## Autorità

L'autorità di persistenza eseguibile è `v3/sqlite-state-persistence.mjs`; `v3/store.mjs` governa mutazioni, receipt, readback e accesso applicativo. La UI consuma proiezioni tipizzate e non deve diventare una seconda autorità sui file raw.

Il database locale non è un event store pienamente ricostruibile e non è storage WORM. Audit, snapshot, codice verificatore e allegati restano nello stesso trust domain dell'host locale.

## Isolamento dei test

E2E e runtime check devono impostare una directory temporanea con `ICTC_RUNTIME_DIR`, chiudere ogni Store/database handle e arrestare i child process prima della rimozione. I path derivati da `import.meta.url` devono usare `fileURLToPath()` per essere validi anche su Windows.

## Dati sensibili

SQLite e gli allegati non forniscono cifratura applicativa at-rest. Per sviluppo e demo usare dati sintetici o anonimizzati. Un deployment che tratta dati sensibili deve fornire e attestare almeno cifratura del volume/backup, trusted identity, secret lifecycle e data lifecycle appropriati; il repository non può auto-attestare tali controlli.

## Backup e recovery

Copiare `state.sqlite` o la directory runtime non equivale a un backup verificato. Un claim di backup/restore richiede almeno un restore su host pulito, confronto di digest/revision/integrità, evidenza temporale legata al deployment e RPO/RTO approvati. In assenza di questa evidenza, la postura deve restare `enterprise-blocked`.

## Evoluzione enterprise

L'evoluzione enterprise può adottare storage multi-instance, object storage immutabile, KMS, retention/legal hold, backup e disaster recovery; tali elementi sono roadmap finché non esistono implementazione ed evidence envelope E4 validi. La documentazione non li presenta come capacità corrente.
