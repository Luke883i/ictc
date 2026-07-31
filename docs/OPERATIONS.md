# Operazioni

## Avvio

```bash
npm ci
npm test
npm start
```

## Health check

```bash
curl http://127.0.0.1:4173/api/health
```

## Integrità runtime

```bash
curl http://127.0.0.1:4173/api/runtime/integrity
```

## Log

La beta scrive su standard output. Non registrare payload sensibili o documenti completi.

## Arresto

Terminare il processo Node.js. Non cancellare manualmente il ledger per risolvere errori applicativi.

## Recovery locale

1. salvare una copia di `runtime/`;
2. eseguire i validator;
3. verificare la hash-chain;
4. ricostruire la proiezione dal ledger quando supportato;
5. documentare eventuali interventi manuali.

## Limiti operativi

La beta non include alta disponibilità, backup automatico, multi-tenancy, SSO, rate limiting distribuito o gestione centralizzata dei segreti.
