# Runtime e wiring v3

## Catena comune

```text
input UI
→ validazione API
→ transizione di dominio
→ append al ledger locale
→ readback
→ receipt
→ ricostruzione della proiezione
→ OutcomeEnvelope
→ Home / Atlante / Percorsi / Tracce / Assistente
```

## Scritture implementate

- proposta e review di una fonte;
- esecuzione simulata di un job;
- review di una differenza;
- decisione su una change story;
- mapping a una famiglia di controllo;
- creazione di un evento;
- conferma owner e RACI;
- transizione del caso fino alla chiusura.

## Letture implementate

- bootstrap completo;
- oggetto singolo con vicini semantici;
- integrità del ledger;
- ledger sanitizzato;
- manifest read-only dell’assistente.

## AI locale

La capsula contiene l’oggetto selezionato e i vicini deterministici del reticolo, fino a dodici oggetti. L’assistente non può ampliare autonomamente il contesto e non possiede endpoint di scrittura.

## Avvio e verifica

```bash
./ictc-v3.sh start
./ictc-v3.sh audit
node v3/saturation.mjs
```

La SOT v3 è separata in `v3/runtime/`; PID e log sono in `.ictc/`.
