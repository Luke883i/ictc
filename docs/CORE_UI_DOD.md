# Core UI Definition of Done

- due sole aree primarie;
- una sola prossima azione;
- massimo due azioni di servizio in Monitoraggio e una in Incidenti;
- cliente e ruolo selezionati una sola volta;
- nessun campo modulo può scegliere tenant, attore o contesto organizzativo;
- task permission-aware e API fail-closed;
- 11 scritture coperte da checkpoint, receipt e refresh;
- ledger, blob e sessioni isolati per tenant;
- errori cross-tenant non rivelano l'esistenza dell'oggetto;
- copy primario privo di gergo interno e verdetti sintetici;
- browser test con due tenant, read-only e due screenshot;
- saturazione `M=40`, `M+100=140`, novelty dopo M uguale a zero.

Il DoD non prova autenticazione enterprise, sicurezza SaaS o comprensione umana.
