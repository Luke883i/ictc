# UX to-be v3 — Living Evidence Atlas

## Idea finale

ICTC appare come una mappa viva e calma del lavoro da comprendere o completare. L’utente non deve conoscere GRC, grafi o modelli epistemici.

Il primo livello mostra balloon di attenzione, quattro domande di lavoro, una sola azione primaria per oggetto e stati espressi in parole. Non mostra un punteggio di conformità.

Il secondo livello mostra origine, produttore, input, oggetti collegati, limiti e receipt. Il terzo espone JSON, identificativi e hash.

## Spazi

| Spazio | Domanda umana |
|---|---|
| Oggi | Da dove devo partire? |
| Atlante | Come sono collegati questi oggetti? |
| Percorsi | Qual è il prossimo passo comprensibile? |
| Novità | Cosa è cambiato e cosa abbiamo deciso? |
| Fonti | Come aggiungo conoscenza senza alterare il perimetro attivo? |
| Eventi | Chi se ne occupa e in quale fase siamo? |
| Prove | Quale catena e receipt sostengono ciò che vedo? |
| Sistema | Quale componente ha prodotto questo esito e con quali limiti? |

## Astrazioni

- **Balloon di attenzione:** un singolo oggetto aperto. Dimensione e colore non rappresentano severità legale.
- **Atlante:** SVG navigabile con posizioni deterministiche e archi etichettati; non introduce causalità implicite.
- **Scene guidate:** domanda, spiegazione locale e azione; avanti e indietro non scrivono dati.
- **Change story:** differenza → review → decisione → mapping, con receipt distinte.
- **Incident room:** racconto → owner/RACI → valutazioni → risposta → closure review.
- **Audit trail:** sequenza derivata dalla stessa proiezione della dashboard.
- **Supply chain:** UI → API → dominio → SOT → proiezione → assistente; le capacità assenti restano visibili.

## Transizioni

Il movimento è una progressive enhancement. Balloon e nodi hanno movimento leggero; nessuna animazione è necessaria per comprendere o completare un’azione. La modalità reduced motion elimina animazioni e transizioni.
