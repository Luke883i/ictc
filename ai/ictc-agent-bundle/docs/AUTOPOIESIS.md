# Autopoiesi controllata ICTC

L'autopoiesi qui non significa auto-autorizzazione. Significa che il bundle sa mantenere la propria utilita quando il repository evolve, preservando memoria, invarianti e confini.

## Componenti

- **Membrana**: `AGENTS.md`, metodo e contratto definiscono cosa puo entrare e cosa puo essere scritto.
- **Memoria**: `repository_anchor.json` e `history/` descrivono il punto osservato e la genealogia.
- **Metabolismo**: doctor, refresh, test, receipt e verifiche trasformano dati del repository in prove derivate.
- **Riproduzione**: `materialize_successor.py` crea un nuovo bundle candidato con nuovo anchor, manifest e provenance.
- **Identita**: root digest e invarianti metodologici permettono di riconoscere la linea senza incorporare ZIP predecessori.

## Ciclo

```text
verifica kernel
-> osserva repository
-> classifica drift
-> aggiorna overlay runtime
-> esegui self-test
-> materializza successore in nuova directory
-> rigenera manifest e ZIP deterministico
-> review umana / commit separato
```

## Classi di adattamento

- `NO_CHANGE`: anchor e repository coincidono.
- `SAFE_DERIVED`: possono aggiornarsi snapshot, log osservato e catalogo test derivato.
- `REVIEW_REQUIRED`: sono cambiati autorita, workflow di scrittura, sicurezza, schema delle prove o la storia non discende dall'anchor.
- `BLOCKED`: repository assente, oggetti Git incompatibili o integrita fallita.

## Invarianti non auto-modificabili

- il repository resta autorita;
- niente push/merge/deploy automatici;
- niente force update;
- niente promozione di CI non osservata;
- niente modifica in place del kernel;
- niente importazione automatica di concetti da altri progetti;
- ogni successore conserva `parent_root_digest` e hash dell'osservazione.

Questa e la parte metodologica ripresa dal bundle AOSP1: overlay locale, receipt append-only, compatibilita, successore materializzato e autorita derivata nulla. Tutto il contenuto di dominio e riscritto per ICTC.
