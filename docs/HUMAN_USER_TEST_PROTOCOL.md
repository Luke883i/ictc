# Protocollo di test con utenti — ICTC

## Scopo

Misurare se persone rappresentative completano le due journey distinguendo originale, proposta AI, adozione umana, decisione e prova. Il protocollo non misura conformità legale e non può essere sostituito da test statici o Playwright.

## Campione minimo

- 3 amministratori o responsabili compliance;
- 3 utenti operativi non amministratori;
- almeno 2 partecipanti senza familiarità con GRC;
- almeno 1 sessione keyboard-only e 1 con zoom 200% o tecnologia assistiva.

## Task

### Monitoraggio

1. creare un monitoraggio partendo da un obiettivo in linguaggio naturale;
2. spiegare con parole proprie cosa è proposta dall'AI e cosa richiede decisione umana;
3. revisionare il piano, attivarlo, sospenderlo con motivo e riprenderlo;
4. verificare una fonte spiegando quale osservazione è stata valutata;
5. scaricare il fascicolo e indicare dove sono origine, decisione e limiti.

### Segnalazione

1. registrare un racconto e riconoscere che è stato preservato prima dell'AI;
2. adottare una proposta AI e correggerne un'altra;
3. spiegare la differenza tra estrazione, ipotesi e risposta umana;
4. salvare due versioni della formulazione;
5. inviare la versione corrente e individuare il digest confermato;
6. riprendere il lavoro dopo indisponibilità AI o cambio di ruolo.

## Metriche e soglie

- successo task critici senza assistenza: almeno 90%;
- distinzione corretta proposta AI / decisione umana: 100%;
- individuazione della prossima azione entro 10 secondi: almeno 90%;
- errori irreversibili o perdita percepita dell'originale: 0;
- comprensione di “hash ≠ verità sostanziale”: almeno 80%;
- System Usability Scale: almeno 80;
- massimo un chiarimento del moderatore per journey;
- nessun partecipante deve interpretare confidenza AI, stato `verified` o reminder come decisione legale automatica.

## Evidenze da conservare

Per ogni sessione: profilo anonimo, task result, tempo, errori, richieste di aiuto, citazioni parafrasate, revisione runtime, versione UI, screenshot autorizzati e decisione di accettazione o nuova iterazione.

## Gate

La PR può dichiarare soltanto “journey tecnicamente provate” finché il protocollo non viene eseguito. La dichiarazione “esperienza utente validata” richiede risultati aggregati sopra le soglie e trattamento dei dati dei partecipanti coerente con le policy applicabili.
## HUX V4 · Representative Human Usability anti-regression

La validazione HUX V4 separa prova E2 da osservazione E3. Il target umano include: prossima azione entro 10 secondi; SUS; calma visiva; chiarezza; coerenza percepita; gradevolezza; misclick; abbandono del task; confusione di ruolo; misunderstanding epistemico; ritorno differito dopo 24–72 ore. Ogni sessione registra exact build / commit SHA. Un finding critical/high deve generare una failure family e, quando osservabile E2, un falsificatore anti-regressione. Nessun aggregato può mascherare una procedura o un ruolo sotto soglia.

### RN-01 · HUX V4
**Oggetto/orientamento.** Identificare cosa viene monitorato e perché richiede attenzione.
**Decisione/ruolo.** Distinguere proposta AI, azione disponibile e decisione umana autorizzata.
**Prova/limite.** Individuare evidenza e limite senza confondere osservazione, integrità o hash con verità sostanziale.
**Recovery/handoff.** Riprendere il lavoro dopo errore, retry o handoff senza perdita di contesto.

### EC-01 · HUX V4
**Oggetto/orientamento.** Ricostruire evento e originale prima di classificazioni o proposte.
**Decisione/ruolo.** Identificare il prossimo checkpoint umano senza automatizzare conclusioni.
**Prova/limite.** Distinguere fatti, formulazioni, versioni e conferme umane.
**Recovery/handoff.** Riprendere dopo AI indisponibile, cambio ruolo o stale state.

### AO-01 · HUX V4
**Oggetto/orientamento.** Riconoscere identità governata, fonte autorevole, owner e stato.
**Decisione/ruolo.** Individuare la decisione di validazione o attestazione pertinente al ruolo.
**Prova/limite.** Separare inventario governato da completezza dell'ambiente reale.
**Recovery/handoff.** Conservare identità, relazioni e contesto nei passaggi di ownership.

### MC-01 · HUX V4
**Oggetto/orientamento.** Comprendere requisito, scope, mapping e controllo prima delle librerie di supporto.
**Decisione/ruolo.** Individuare la decisione umana di scope o mapping senza inferire conformità.
**Prova/limite.** Mapping e scope non equivalgono ad applicabilità legale, certificazione o efficacia.
**Recovery/handoff.** Handoff tipizzato come lavoro da riesaminare, non trasferimento della decisione.

### AP-01 · HUX V4
**Oggetto/orientamento.** Collegare remediation, origine, owner e prossimo checkpoint.
**Decisione/ruolo.** Distinguere adozione, esecuzione, completamento e verifica.
**Prova/limite.** Completato non significa chiuso; evidenza non significa verifica.
**Recovery/handoff.** Retry e resume non duplicano azioni e preservano la ricevuta.

### RC-01 · HUX V4
**Oggetto/orientamento.** Leggere scenario, valutazione, trattamento e riesame senza partire dall'analisi aggregata.
**Decisione/ruolo.** Riconoscere quale valutazione o trattamento richiede decisione umana.
**Prova/limite.** Rating e matrice non sono probabilità oggettiva, rilevanza legale o conformità.
**Recovery/handoff.** Il passaggio ad azione correttiva crea lavoro tipizzato e conserva il rationale.

### AR-01 · HUX V4
**Oggetto/orientamento.** Riconoscere richiesta, fonte, risposta, versione e stato di review.
**Decisione/ruolo.** Distinguere bozza, risposta adottata e approvazione umana.
**Prova/limite.** Approvazione interna non equivale ad assurance indipendente o verità esterna.
**Recovery/handoff.** Conservare richiesta originale e riprendere il fascicolo dopo errore o cambio ruolo.

