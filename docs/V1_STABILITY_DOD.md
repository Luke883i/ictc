# Definition of Done — multi-client readiness

La slice è accettabile quando:

1. ogni richiesta risolve identità, membership, tenant, ruolo e permessi;
2. payload utente non possono scegliere attore, tenant o contesto organizzativo;
3. ledger, blob e sessioni sono isolati per tenant;
4. scritture concorrenti preservano ogni hash-chain;
5. una risorsa di un altro tenant risponde come non trovata;
6. ogni receipt contiene tenant, attore, ruolo e readback verificato;
7. la UI espone una sola azione primaria e rende read-only ciò che il ruolo non può eseguire;
8. i due percorsi core restano completi senza nuove aree applicative;
9. il bind di rete richiede un trusted identity boundary esplicito;
10. `M=40` e `M+100=140` non introducono nuove primitive.

Il DoD attesta readiness per pilot controllati, non SaaS enterprise o conformità normativa.
