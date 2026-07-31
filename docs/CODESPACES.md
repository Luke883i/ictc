# GitHub Codespaces

## Avvio

Creare o ricostruire il Codespace. Il dev container esegue:

1. `npm ci --ignore-scripts`;
2. doctor del launcher;
3. gap audit e UX audit;
4. avvio del profilo corrente sulla porta 4173.

La porta è configurata come privata. Aprirla dal pannello **Ports** oppure dal link stampato nel terminale.

## Diagnosi

```bash
./ictc.sh doctor
./ictc.sh status
./ictc.sh logs
```

Se il Codespace è stato arrestato, il processo applicativo deve essere riavviato; `postStartCommand` lo fa durante il riavvio del container.

## Sicurezza

La porta privata è accessibile al creatore autenticato. La visibilità pubblica non è necessaria per lo sviluppo ordinario e può essere limitata dalle policy dell'organizzazione.
