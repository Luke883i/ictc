# Definition of Done — UI Monitoraggio e Incidenti

## Monitoraggio

- [ ] configurazione persistita;
- [ ] fonte revisionata prima dell’attivazione;
- [ ] scheduling e prossima esecuzione persistiti;
- [ ] acquisizione remota protetta e disabilitabile;
- [ ] blob e digest conservati;
- [ ] studio AI solo quando configurato;
- [ ] stato AI `unavailable` o `failed` visibile senza risultato fittizio;
- [ ] intake URL e testo completo;
- [ ] reticolo derivato dagli edge runtime;
- [ ] finding, decisione e controllo collegati a receipt.

## Incidenti

- [ ] fatti originali conservati;
- [ ] owner e RACI confermati;
- [ ] triage con classification, severity, scope, impact e confidence;
- [ ] risposta con containment, eradication e communications;
- [ ] recovery con service status, validation e residual monitoring;
- [ ] closure con lessons, follow-up e approval;
- [ ] transizioni non consentite rifiutate;
- [ ] evidenze per fase persistite e leggibili nel dettaglio;
- [ ] timeline e receipt ricostruibili.

## UI e accessibilità

- [ ] due sole aree primarie;
- [ ] una sola azione primaria per area;
- [ ] nessun controllo visibile inutilizzato;
- [ ] copy inventory completo;
- [ ] target minimo 44×44 CSS px;
- [ ] tastiera, focus return, reflow, reduced motion e forced colors;
- [ ] due screenshot runtime con hash.

## Metriche

- write route coverage: 100%;
- receipt readback: 100%;
- origini monitoraggio coperte: 2/2;
- fasi incidente coperte: 100%;
- controlli visibili inutilizzati: 0;
- errori copy: 0;
- novelty dopo M: 0;
- contesti operativi coperti: 3/3;

## Saturazione

- `M=40` scenari canonici;
- `M+100=140`;
- 22 primitive;
- ultima novelty allo scenario 22;
- novelty dopo M uguale a zero.

La saturazione è bounded alle combinazioni simulate. Non prova completezza universale, conformità agli standard o comprensione con utenti reali.
