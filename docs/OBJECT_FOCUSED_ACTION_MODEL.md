# Modello UX object-focused: dall'oggetto all'azione

## Prompt chiarito

Il principio richiesto diventa un vincolo ingegneristico:

> La prima domanda di ogni superficie ICTC è **“che cosa deve fare qui l'utente?”**. La domanda **“a quale processo appartiene?”** è secondaria e compare soltanto nel drill-down.

La UI non deve costringere una persona a conoscere in anticipo il workflow normativo, il modello dati o la tassonomia di dominio. Deve presentare una scelta locale, spiegare perché compare e mostrare quale evidenza verrà prodotta.

## I quattro oggetti della transizione

### 1. OutcomeEnvelope

È la rappresentazione autorevole dell'esito runtime. Contiene stato epistemico, produttore, input, limiti, prossima azione e receipt.

Risponde a: **che cosa sappiamo e con quali limiti?**

### 2. ActionFrame

È una proiezione deterministica, temporanea e non autorevole. Traduce uno o più OutcomeEnvelope in una scelta locale.

Campi minimi:

- domanda dell'utente;
- oggetto runtime di riferimento;
- processo sottostante;
- una sola azione primaria;
- prerequisiti;
- conseguenza locale;
- ciò che l'azione non significa;
- evidenza attesa.

Risponde a: **che cosa devo fare qui?**

### 3. DecisionCheckpoint

È il gate che precede ogni scrittura. Non salva dati. Mostra:

- stato prima;
- stato dopo;
- conseguenza;
- anti-equivalenze;
- receipt prevista;
- pulsanti conferma e ritorno.

Risponde a: **sono consapevole di ciò che questa scelta registra e di ciò che non conclude?**

### 4. Receipt

È l'evidenza persistita dopo readback. Non prova verità o conformità; prova che una specifica operazione è stata registrata nella catena locale.

Risponde a: **come dimostro che l'azione è stata registrata?**

## Catena UX e runtime

```text
OutcomeEnvelope
    ↓ derivazione deterministica
ActionFrame
    ↓ scelta locale dell'utente
DecisionCheckpoint
    ↓ conferma umana
azione di dominio wired
    ↓ persistenza + readback
Receipt
```

Nessun passaggio intermedio può promuovere lo stato epistemico. L'ActionFrame non scrive. Il checkpoint non decide. La receipt non certifica la sostanza.

## Principi ingegneristici

### Primato del compito locale

Il titolo principale usa un verbo e una domanda concreta: “Valutare una differenza”, “Confermare owner e RACI”, “Aggiungere conoscenza candidata”.

### Processo a divulgazione progressiva

Il nome del processo resta disponibile in “Perché questa azione compare qui”. Non occupa il primo livello.

### Una scelta primaria per oggetto

Ogni ActionFrame espone un solo pulsante primario. Le alternative decisionali compaiono nel controllo di destinazione o nel checkpoint.

### Conseguenza prima della conferma

Prima della scrittura la UI mostra il cambiamento locale atteso. Non usa formule generiche come “Continua” o “Conferma” senza oggetto.

### Anti-equivalenza nel punto decisionale

Il limite non è relegato a una pagina legale. Compare accanto alla scelta: mapping ≠ efficacia, finding ≠ materialità, receipt ≠ verità.

### Evidenza prevista

Ogni azione dichiara quale evidenza sarà disponibile dopo il successo: receipt, timeline, relazione semantica o oggetto candidato.

### Derivazione deterministica

Gli ActionFrame sono prodotti da regole pure a partire dalla proiezione runtime. Non sono generati liberamente dall'AI e non sono persistiti nel ledger.

### Fallimento esplicito e reversibile

Un controllo assente produce “non disponibile”; non viene sostituito da un'azione inventata. Il checkpoint consente sempre di tornare indietro senza scritture.

## Applicazione per superficie

| Superficie | Domanda locale | Azione primaria | Processo nel drill-down |
|---|---|---|---|
| Oggi | Che cosa devo capire prima di agire? | Apri l'oggetto | attention-triage |
| Fonti | Questa candidata entra nel perimetro? | Vai alla scelta | source-review |
| Novità | La differenza è rilevante qui? | Vai alla valutazione | finding-review |
| Eventi | Chi assume responsabilità? | Vai alla conferma | matter-workflow |
| Prove | Devo ricostruire questo esito? | Apri prove e catene | evidence-review |
| Sistema | Devo condividere una diagnosi sanitizzata? | Crea support bundle | operational-diagnostics |

## Compressione informativa

Il primo livello contiene al massimo tre ActionFrame e, per ciascuno:

1. una domanda;
2. una frase di situazione;
3. un'azione primaria.

Il drill-down aggiunge prerequisiti, processo, conseguenza, non-significato ed evidenza attesa. I dettagli tecnici restano nel terzo livello dell'oggetto.

## Scalabilità

Il modello scala aggiungendo nuove regole di derivazione, non nuove pagine specialistiche. Un nuovo dominio deve fornire:

- OutcomeEnvelope tipizzati;
- regola ActionFrame pura;
- write action nel contratto epistemico;
- voce nel manifest `v3/action-wiring.json`;
- checkpoint;
- test di schema, wiring e anti-overclaim.

Il modello non dipende da un framework UI specifico. Il contratto può essere riutilizzato in web app, mobile, CLI o integrazioni assistive.

## Definition of Done

Una nuova azione è completa soltanto quando:

- deriva da un oggetto runtime reale;
- risponde a “che cosa devo fare qui?”;
- espone un solo controllo primario;
- mostra processo e prerequisiti nel drill-down;
- passa da DecisionCheckpoint se scrive;
- dichiara conseguenza e anti-equivalenze;
- produce o dichiara l'assenza di una receipt;
- ha un percorso equivalente da tastiera;
- supera `node v3/action-frame-audit.mjs` e `node v3/ux-audit.mjs`.

## Limite

La correttezza strutturale non dimostra comprensione umana. Il modello deve essere validato con utenti reali misurando tempo alla prima azione, comprensione del limite e capacità di ricostruire la receipt.
