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
