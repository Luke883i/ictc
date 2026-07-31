# Profili di esecuzione

## Comando canonico

```bash
./ictc.sh start
```

Il profilo predefinito `current` corrisponde alla v3.

| Profilo | Comando | Porta predefinita | SOT |
|---|---|---:|---|
| current / v3 | `./ictc.sh start --profile current` | 4173 | `.ictc/runtime/v3` |
| v2 legacy | `./ictc.sh start --profile v2` | 4174 | `.ictc/runtime/v2` |
| confronto | `./ictc.sh start --profile all` | 4173 e 4174 | separate |

Lo status dichiara profilo, PID, URL e integrità disponibile.

## Codespaces

La configurazione `.devcontainer/devcontainer.json` usa Node.js 22, inoltra la porta 4173 con visibilità privata ed esegue il launcher al riavvio del container.

```bash
./ictc.sh codespace
```

Quando le variabili Codespaces sono presenti, il launcher stampa l'URL della porta inoltrata. La porta privata remota richiede autenticazione GitHub.

## Altri ambienti

Workstation: `./ictc.sh start`.

Server o container senza desktop: `ICTC_NO_OPEN=1 ./ictc.sh start`.

Porta personalizzata: `ICTC_PORT=4300 ./ictc.sh start`.

In un container generico montare `.ictc/runtime` su volume persistente e limitare il bind alla rete necessaria. La beta non deve essere pubblicata direttamente su internet.

## Limiti

Il launcher orchestra processi locali. Non sostituisce service manager, readiness distribuita, secret manager, backup, TLS termination o orchestratore di produzione.
