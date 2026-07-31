# Saturazione 1 → M+100

## Metodo

La saturazione è bounded: verifica se nuove simulazioni richiedono nuove primitive di primo livello nel modello v3. Non prova completezza universale del dominio, accuratezza giuridica o copertura di ogni organizzazione.

Le dodici primitive sono persona/lente, intenzione, oggetto canonico, stato epistemico, input/produttore, decisione umana, transizione, relazione semantica, receipt, drill-down, errore/indisponibilità e adattamento accessibile.

## M

`M = 36` scenari canonici. Entro M vengono combinate le journey necessarie alla beta. L’ultima nuova primitiva compare allo scenario 12.

## M+100

Gli scenari 37–136 combinano persona, intenzione, device, qualità dei dati, indisponibilità, conflitti e stato del workflow. Il gate passa soltanto se nessuno dei cento scenari successivi a M richiede una nuova primitiva di primo livello.

```bash
node v3/saturation.mjs
```

Esito atteso:

```text
v3-saturation: ok (M=36, M+100=136, last novelty=12, primitives=12)
```

La conclusione è: nessuna nuova primitiva è stata richiesta dagli scenari 37–136. Non equivale a una dichiarazione di completezza assoluta del prodotto.
