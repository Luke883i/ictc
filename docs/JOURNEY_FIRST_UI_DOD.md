# Definition of Done — Journey-first UI

## DoD obbligatoria

1. La prima scelta è l’incarico, non il modulo.
2. Sono disponibili cinque lenti di lavoro distinte.
3. Ogni lente dichiara mandato e confine decisionale.
4. Il viewport iniziale espone una sola attività primaria.
5. Percorso, limiti e coda sono disponibili tramite progressive disclosure.
6. Ogni JourneyTask contiene scopo dell’oggetto, riferimento SOT, stato, conseguenza, limite ed evidenza.
7. Una persona read-only non espone scritture come CTA primaria.
8. Missing, empty e failed non sono rappresentati come zero positivo.
9. Ogni scrittura passa da checkpoint.
10. Ogni route di scrittura produce una receipt con readback.
11. Dopo la scrittura il bootstrap viene riletto e la journey viene ricalcolata.
12. Source, change e matter journey completano il test runtime.
13. Il browser completa almeno una scrittura reale e verifica l’aumento del ledger.
14. Il dettaglio usa l’endpoint oggetto reale.
15. Ricerca e assistente non ampliano il perimetro oltre object plus deterministic neighbors.
16. Target 44 px, focus visibile, reflow, reduced motion e forced colors sono coperti.
17. Screenshot runtime e hash sono artefatti CI.
18. M=60 e M+100=160 non introducono primitive dopo M.

## Metriche

| Metrica | Target |
|---|---:|
| Persona con journey rappresentata | 100% |
| Completezza contratto task | 100% |
| Oggetti con scopo per persona | 100% |
| CTA primarie nel viewport iniziale | 1 |
| Layer universali duplicati | 0 |
| Scritture read-only persona | 0 |
| Receipt con readback | 100% |
| Journey runtime completate | 3 |
| Copertura tastiera del percorso critico | 100% |
| Target minimo interno | 44 CSS px |
| Confusione missing/empty/failure | 0 |
| Novelty dopo M | 0 |

## Saturazione

Cinque persone per dodici contesti producono M=60; cento perturbazioni producono M+100=160. Le modalità simulate sono pointer, keyboard, screen reader, touch, voice control, low vision, reduced motion e interrupted resume. Le primitive sono 18, l’ultima novelty è allo scenario 18 e la novelty dopo M è zero.

La saturazione è bounded alle combinazioni simulate. Non prova completezza universale, comprensione umana o conformità WCAG.

## Comandi

```bash
npm run audit:ux:journey
```

Con runtime attivo:

```bash
ICTC_BASE_URL=http://127.0.0.1:4807 node v3/journey-runtime-check.mjs
ICTC_BASE_URL=http://127.0.0.1:4807 python3 v3/journey-browser-check.py
```

## Checklist manuale residua

- NVDA con Firefox e Chrome;
- VoiceOver con Safari;
- TalkBack con Chrome Android;
- Windows High Contrast;
- zoom browser 200% e 400%;
- test moderato con almeno un utente per persona;
- verifica della comprensione di receipt ≠ verità;
- verifica della comprensione di persona ≠ autorizzazione;
- verifica del tempo alla prima azione e del tasso di ritorno alla coda.
