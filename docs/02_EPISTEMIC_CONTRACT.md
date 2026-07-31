# Contratto epistemico

## Catena obbligatoria

```text
input → produttore → esito tipizzato → stato → limiti → decisione umana → persistenza → readback → receipt → UI
```

Ogni elemento end-user è un `OutcomeEnvelope`. Campi minimi: classe del claim, stato epistemico, produttore, input, limiti, dati, tempo e receipt quando applicabile.

## Stati

- `observed`: un'operazione o un dato è stato registrato;
- `verified`: un controllo deterministico è passato;
- `candidate` / `ai-proposed`: proposta non autoritativa;
- `attention-required` / `awaiting-human-review`: serve una persona;
- `human-reviewed` / `human-owned`: decisione umana registrata;
- `failed` / `unavailable`: esito non completato o non disponibile.

## Divieti

- nessuna equivalenza tra fonte censita e fonte applicabile;
- nessuna equivalenza tra mapping e controllo efficace;
- nessun punteggio globale di conformità;
- nessuna AI con autorità di review, ownership o scrittura autonoma.
