# ICTC — Integrated Compliance Tower Control

ICTC registra fonti, variazioni, decisioni e casi mantenendo separati osservazione, proposta automatica, review umana e prova tecnica.

## Stato corrente

La release `1.1.0-rc.1` è una **slice di readiness multi-cliente**: ledger, blob, sessioni e ricevute sono isolati per tenant; ruoli e permessi sono applicati lato server. Non è ancora una piattaforma SaaS enterprise.

## Avvio locale

```bash
npm ci --ignore-scripts
./ictc.sh start
```

Aprire `http://127.0.0.1:4173`. La directory locale consente di simulare persone, ruoli e due clienti senza esporre il servizio in rete.

## I due servizi

### Monitoraggio

```text
Osserva → Rivedi → Decidi → Collega → Prova
```

L'utente registra un URL o un contenuto, revisiona la fonte e le differenze, decide l'impatto e collega un controllo. ICTC conserva blob, digest, attore, ruolo, tenant e receipt; non determina conformità o applicabilità.

### Incidenti

```text
Segnala → Assegna → Valuta → Rispondi → Ripristina → Impara → Prova
```

L'utente registra i fatti, conferma responsabilità, completa triage, risposta, ripristino e lezioni. ICTC impedisce salti di fase e conserva le evidenze; non decide automaticamente notifiche o rischio residuo.

La journey completa è documentata in [docs/MULTI_CLIENT_READINESS.md](docs/MULTI_CLIENT_READINESS.md).

## Identity boundary

La modalità locale è dimostrativa. Per un pilot di rete:

```bash
ICTC_HOST=0.0.0.0 \
ICTC_IDENTITY_MODE=trusted-header \
ICTC_TRUSTED_IDENTITY_BOUNDARY=1 \
./ictc.sh start --no-open
```

Il servizio deve stare dietro un identity-aware proxy che elimini gli header client e inserisca `x-ictc-actor-id` e `x-ictc-tenant-id` verificati. Non esporre direttamente questa modalità.

## Verifica

```bash
npm run audit:multi-client
npm run release:check
```

I gate coprono access context, isolamento tenant, concorrenza del ledger, RBAC, session scope, UI permission-aware e saturazione `M=40 → M+100=140`.

## Limiti

OIDC nativo, MFA, SCIM, non ripudio, multi-regione, storage distribuito, billing e lifecycle SaaS restano fuori scope. Una receipt prova una scrittura riletta nel tenant; non prova la verità del contenuto o l'efficacia del controllo.
