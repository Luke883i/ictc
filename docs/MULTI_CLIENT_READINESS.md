# ICTC multi-client readiness

## As-is audit

Prima di questa slice il runtime aveva un solo `ledger.jsonl`, una sola root blob, sessioni globali e attori ricavati dal payload. Il campo “contesto” descriveva l'organizzazione, ma non isolava i dati. La release dichiarava correttamente lo scope `stable-local-single-user`.

La slice sposta il confine nel kernel:

```text
richiesta
→ identità osservata
→ membership
→ tenant
→ ruolo e permesso
→ ledger/blob/sessione del tenant
→ evento attribuito
→ receipt con readback
```

La modalità `local-directory` serve a dimostrare e collaudare i ruoli su loopback. La modalità `trusted-header` è utilizzabile soltanto dietro un proxy amministrato che rimuove gli header provenienti dal client e inserisce identità e tenant verificati.

## Journey minima: Monitoraggio

### Passi attesi dall'utente

1. Seleziona il cliente su cui sta operando. In locale può anche scegliere una persona simulata; dietro proxy l'identità è imposta dal boundary.
2. Apre **Monitoraggio**. Vede una sola prossima azione coerente con ruolo e stato.
3. Sceglie **Monitora URL** oppure **Aggiungi contenuto**.
4. Registra URL/testo e, per un monitoraggio, frequenza e domanda di studio.
5. Rilegge il riepilogo “prima/dopo/prova/limiti” e conferma.
6. Un reviewer include o esclude la fonte.
7. Il monitoraggio viene attivato o eseguito. ICTC conserva blob, digest, confronto e stato dell'eventuale proposta AI.
8. Un reviewer decide se la differenza è rilevante nel cliente selezionato.
9. Un owner registra l'impatto e, quando necessario, collega un controllo con motivazione.
10. L'utente apre il dettaglio per vedere origine, relazioni, tenant, attore, ruolo, hash e ricevuta.

### Processo minimo

```text
Osserva → Rivedi → Decidi → Collega → Prova
```

- **Osserva:** origine, contenuto, blob e digest.
- **Rivedi:** fonte e differenza restano candidate finché una persona autorizzata non decide.
- **Decidi:** impatto e motivazione sono umani e contestuali.
- **Collega:** il controllo è una relazione documentata, non una prova di efficacia.
- **Prova:** receipt e hash-chain attestano la registrazione nel tenant, non la verità giuridica.

## Journey minima: Incidenti

### Passi attesi dall'utente

1. Seleziona il cliente e apre **Incidenti**.
2. Sceglie **Segnala** e registra soltanto titolo facoltativo, tipo iniziale e fatti osservati.
3. Rilegge il checkpoint e conferma: nasce un caso, non una qualificazione normativa definitiva.
4. Un owner conferma responsabilità e RACI proposti.
5. Registra il triage: classificazione, severità, perimetro, impatto e confidenza.
6. Registra la risposta: contenimento, rimozione della causa e comunicazioni/valutazioni.
7. Registra il ripristino: stato del servizio, validazione e monitoraggio residuo.
8. Registra lezioni, azioni successive e approvazione della chiusura.
9. A ogni passaggio ICTC impedisce salti di stato e conserva attore, ruolo, evidenze e receipt.
10. Il dettaglio ricostruisce la timeline senza concludere automaticamente obblighi di notifica o rischio residuo.

### Processo minimo

```text
Segnala → Assegna → Valuta → Rispondi → Ripristina → Impara → Prova
```

## Journey completa comune

```text
seleziona cliente
→ osserva il proprio ruolo
→ apre uno dei due servizi
→ riceve una sola prossima azione
→ inserisce il minimo dato necessario
→ rilegge conseguenza e limiti
→ conferma
→ API verifica il permesso
→ kernel scrive nel tenant
→ readback verifica la hash-chain
→ UI mostra la receipt
→ dettaglio espone provenienza e relazioni
```

## Ruoli

| Ruolo | Può fare |
|---|---|
| Lettore | leggere e ispezionare prove |
| Analista | aggiungere fonti, eseguire monitoraggi, segnalare casi |
| Reviewer | come Analista, più review di fonti e differenze |
| Owner | come Reviewer, più decisioni e gestione delle fasi incidente |
| Admin | tutte le capacità applicative della slice |

Questi ruoli non sostituiscono un IdP. In `trusted-header` devono essere derivati da una directory amministrata e da un proxy attendibile.

## Saturazione

La simulazione combina cinque ruoli, cinque profili tenant, cinque intenti e otto perturbazioni. A `M=40` sono emerse 24 primitive. L'estensione fino a `M+100=140` non introduce nuove primitive: nei successivi 100 scenari la novità resta pari a zero.

Le primitive includono selezione tenant, membership, ruolo, permesso, ledger e blob isolati, receipt attribuita, task read-only, denial, `404` cross-tenant, session scope, passaggi dei due servizi, failure ed empty state.

Questa è saturazione progettuale bounded: non prova sicurezza SaaS, completezza universale o comprensione da parte di utenti reali.

## Readiness, non enterprise completion

La slice rende possibile un pilot multi-cliente controllato. Restano fuori scope OIDC nativo, MFA, SCIM, non ripudio, HA, database distribuito, object storage remoto, billing e gestione operativa SaaS.
