# GitHub Codespaces

## Avvio

Creare o ricostruire il Codespace. Il dev container usa Node 22 ed esegue:

1. `npm ci --ignore-scripts`;
2. doctor del launcher;
3. gap audit e UX audit;
4. `./ictc.sh start --no-open` sulla porta 4173.

Il processo resta bindato a loopback; il port forwarding del devcontainer espone la porta privata al client Codespaces senza richiedere `ICTC_HOST=0.0.0.0`. Questo mantiene la stessa boundary locale usata su workstation.

Il vecchio comando `./ictc.sh codespace` resta un alias compatibile di `start --no-open`, ma il `postStartCommand` usa la forma canonica esplicita.

## Diagnosi

```bash
./ictc.sh doctor
./ictc.sh status
./ictc.sh logs
npm run bootstrap:check
```

Se il Codespace è stato arrestato, `postStartCommand` riavvia il supervisor locale al riavvio del container.

## Sicurezza

La porta configurata dal devcontainer resta privata. BOOTSTRAP-0 non abilita un bind pubblico e non sostituisce identity, TLS o altre evidenze E4 del deployment.
