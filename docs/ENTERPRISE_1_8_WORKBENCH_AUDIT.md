# ICTC 1.8 Enterprise Workbench — audit visivo, ontologico e operativo

## Evidenza osservata

L'audit parte dalle cinque schermate reali della release 1.7 e dal runtime su `main` dopo la PR 24.

### Home

La priorità per il ruolo `user` è quasi sempre l'apertura di un fascicolo evento. Il processo di ricerca normativa rimane nella navigazione, ma non ha pari dignità nella prima decisione. L'utente può quindi interpretare ICTC come strumento principalmente incident-oriented.

### Ricerca normativa

La superficie presenta contemporaneamente un titolo amministrativo, un messaggio role-aware, liste vuote, catalogo e materiale. Per il ruolo `user` la frase “Definisci cosa monitorare” descrive un'azione che non può compiere. “Aggiungi materiale” compare in più punti. La configurazione globale del provider AI non offre un modello esplicito di job con baseline, scope di novelty, autorità e tipi di cambiamento.

### Eventi e incidenti

Introduzione, CTA e coda sono troppo distanti. Un ampio vuoto verticale non comunica stato. La card osservata contiene un'azione senza label visibile; questo rende l'effetto non interpretabile e fragile per tecnologie assistive.

### Configurazione AI

Organizzazione, provider, temperatura e prompt applicativi sono esposti nello stesso piano. Il dialog è corretto come configurazione globale, ma non chiarisce che la policy del singolo job appartiene alla ricerca normativa, non al provider.

## Convergenza minima

1. **Home a due corsie equivalenti.** Ricerca normativa ed Eventi e incidenti sono sempre visibili. Una raccomandazione può indicare urgenza, ma non rimuove o riduce l'altro processo.
2. **Job di ricerca normativa governato.** Nome, obiettivo, frequenza, giurisdizioni, autorità, modalità di mining, baseline e tipi di cambiamento sono persistiti con il job e inviati ai due passaggi AI: proposta del piano e discovery.
3. **Un solo ingresso per il materiale.** Link, testo e documenti sono modalità dello stesso intake. Originale, arricchimento e fonte candidata restano oggetti distinti.
4. **Eventi compatti.** Intake e coda condividono il primo viewport desktop. Ogni card espone una sola azione principale nominata “Apri fascicolo”; l'evidenza è secondaria e nominata.
5. **Configurazione AI separata.** Organizzazione, connessione provider e policy globale sono disclosure indipendenti. Il dialog rimanda ai job per i parametri specifici di ricerca.
6. **Label matrix lossless.** Ogni superficie segue `oggetto → stato → azione → effetto`; il copy canonico esiste prima del bootstrap JavaScript.

## Matrice di labeling

| Superficie | Titolo | Oggetti canonici | Azione primaria | Confine |
|---|---|---|---|---|
| Panoramica | Scegli dove lavorare | Job di ricerca normativa, Fascicolo evento | Apri il processo scelto | La raccomandazione non equivale a obbligo |
| Ricerca normativa | Job di ricerca e novelty | Job, Esecuzione, Fonte candidata, Materiale | Configura job / Contribuisci materiale / Consulta | Trovato non significa applicabile |
| Eventi e incidenti | Registra e completa i fascicoli | Originale, Chiarimento, Versione, Evidenza | Registra evento / Apri fascicolo | Analisi AI non determina obblighi |
| Amministrazione AI | Connessione e policy del provider | Organizzazione, Provider, Policy globale | Salva configurazione | La policy del job resta nel job |

## Standard e pratiche

- **ISO 9241-110:2020:** task suitability, self-descriptiveness, conformità alle aspettative e controllabilità. Un utente non deve leggere un titolo amministrativo per una funzione non autorizzata.
- **WCAG 2.2:** heading e label descrittivi, focus visibile, target adeguati, navigazione prevedibile e reflow.
- **NIST AI RMF:** scopo AI delimitato, supervisione umana e tracciabilità. Il job prepara ricerca e novelty; piano e decisioni restano umani.
- **NIST CSF 2.0:** outcome, autorità, stato operativo e recovery espliciti.
- **GOV.UK/USWDS:** plain language, summary first e progressive disclosure.
- **SRE e human factors:** stato azionabile, segnale sopra rumore, complessità limitata e recovery nominato.

Questi riferimenti sono benchmark ingegneristici. Non costituiscono dichiarazione di conformità.

## Saturazione T × M × M+100

Sono definite 12 dimensioni T. Per ciascuna T si enumerano:

`3 ruoli × 4 superfici × 4 workload × 3 stati AI × 3 viewport × 3 input × 4 stati × 3 urgenze = 15.552 scenari`.

Dopo una finestra di stabilità di 64 casi, `M=15.616`. Ogni T riceve 100 probe ulteriori; `M+100=15.716`. Totale dichiarato: 186.624 casi di costruzione e 1.200 casi di coda, 187.824 complessivi. La coda deve produrre zero primitive nuove.

La saturazione è limitata al modello dichiarato; browser, tecnologie assistive, deployment e completezza della ricerca normativa richiedono prove indipendenti.

## Definition of Done

- release 1.8 propagata;
- due corsie core sempre visibili sulla Home;
- job regolatorio persistito con baseline, change types, scope e autorità;
- payload AI coerente con il job;
- un solo ingresso materiale per superficie;
- intake evento e coda nello stesso viewport desktop;
- zero controlli senza nome;
- configurazione provider distinta dalla configurazione job;
- label canoniche prima di JavaScript;
- zero affordance di scrittura auditor;
- dettaglio secondario completo e progressivo;
- test statici, runtime, browser e security verdi sullo stesso commit;
- zero novelty a M+100 per ogni T.

## Confine della claim

La release dimostra proprietà del repository e del runtime locale nel modello dichiarato. Non certifica conformità legale o normativa, completezza della discovery, operating effectiveness, produzione o ogni combinazione utente/browser/tecnologia assistiva.
