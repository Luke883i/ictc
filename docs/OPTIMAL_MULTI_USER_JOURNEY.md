# ICTC — user journey multiutente ottimale

## Obiettivo

La journey core non deve esporre la struttura interna del prodotto. Deve portare una persona dal contesto corretto alla sola decisione che può realmente prendere, conservando una prova attribuita e impedendo duplicazioni, attraversamenti di tenant o scritture su uno stato obsoleto.

```text
Cliente e identità
→ servizio
→ Da fare
→ dati minimi
→ conseguenza e limiti
→ conferma
→ comando autorizzato
→ commit nel tenant
→ receipt
→ prossimo passo

Le attività non eseguibili
→ In attesa di un altro ruolo
```

## Simulazioni raffinate

### Lettore davanti a lavoro aperto

Il Lettore deve poter ispezionare oggetti e ricevute, ma non deve ricevere come focus un pulsante disabilitato. Il focus dichiara che non esistono azioni per il ruolo corrente; la coda **In attesa** mostra quali attività richiedono reviewer o owner.

### Due reviewer sulla stessa fonte

Entrambi leggono lo stesso ledger head. Il primo comando viene registrato. Il secondo, costruito sullo stato precedente, riceve `409 ledger-head-changed` o `state-conflict`, aggiorna il bootstrap e mostra il nuovo prossimo passo. Non vengono registrate due decisioni incompatibili.

### Retry dopo perdita della risposta

Il browser conserva lo stesso `commandId`. Il server trova l’evento già scritto e restituisce la stessa receipt con `replayed=true`; il ledger non riceve un duplicato.

### Scheda rimasta aperta

Ogni scrittura include `expectedHead`. Una scheda vecchia non può sovrascrivere decisioni successive: deve rileggere e ricostruire la coda.

### Oggetto di un altro cliente

La ricerca e il dettaglio partono dalla proiezione del tenant selezionato. Un identificativo appartenente a un altro tenant produce `404`, non una risposta utile a enumerare l’esistenza dell’oggetto.

### Sessione AI scaduta

La sessione è legata a tenant e attore, ha una scadenza e un limite per principal. Una sessione scaduta o creata in un altro cliente viene rifiutata. L’assistente resta read-only.

### Scheduler multi-tenant

Il scheduler attraversa la directory tenant e crea un service context separato per ogni cliente. Ledger, blob, in-flight key e receipt restano tenant scoped.

### Ricostruzione della UI

Applicare gli eventi non deve modificarli. La proiezione usa copie dei payload, così costruire la UI non può alterare hash, expected head o risultato della verifica della chain.

## Superficie minima

La navigazione primaria contiene soltanto:

```text
Cliente · Profilo
Monitoraggio · Incidenti
```

Gli ingressi core sono tre:

```text
Monitora URL · Aggiungi contenuto · Segnala
```

La superficie operativa contiene:

- una sola prossima azione eseguibile;
- una coda **Da fare** per ulteriori azioni eseguibili;
- una coda **In attesa di un altro ruolo**;
- dettaglio progressivo per origine, relazioni e receipt;
- nessun punteggio sintetico di conformità.

## Contratto di wiring

Ogni azione visibile deve completare l’intera catena:

```text
input
→ permission
→ route
→ validazione di stato
→ evento e producer
→ persistenza tenant scoped
→ proiezione
→ receipt e readback
→ test
```

Il contratto `core-workspaces.json` è la fonte comune per permission, route, evento, producer, label e proiezione. Backend e proiezione guidata consumano lo stesso contratto.

## Saturazione

La simulazione combina ruoli, profili tenant, intenti e perturbazioni di retry, concorrenza, isolamento, indisponibilità AI, empty state, densità e scadenza sessione.

```text
M = 48
M + 100 = 148
primitive = 38
ultima novità = scenario 21
novità dopo M = 0
```

Le primitive includono tenant, membership, permission, action contract, command id, optimistic concurrency, replay idempotente, proiezione pura, receipt attribuita, session scope, code operative e i passaggi dei due processi core.

La saturazione è bounded alla slice locale e trusted-header. Non prova sicurezza SaaS universale, alta disponibilità o comprensione da parte di utenti reali.

## Definition of Done

La DoD eseguibile contiene 23 criteri. I gate verificano:

- isolamento tenant;
- autorizzazione lato server;
- idempotenza e conflitto concorrente;
- session scope e scadenza;
- action contract completo;
- proiezione pura;
- focus eseguibile e coda in attesa;
- receipt con readback;
- transizioni incidente;
- saturazione `48 → 148`;
- esecuzione dei gate nel workflow della PR.

## Limiti

Questa slice non sostituisce OIDC, MFA, SCIM, firme di non ripudio, locking distribuito, database multi-regione, object storage remoto o gestione operativa SaaS. ICTC conserva operazioni e decisioni; non determina automaticamente conformità, efficacia dei controlli o obblighi di notifica.
