export const SEMANTIC_FOUNDATION_VERSION='3.0.1';

export const BUSINESS_GLOSSARY=Object.freeze({
  'fonte-normativa':Object.freeze({label:'Fonte normativa',definition:'Atto, documento o pubblicazione ricondotta a un’autorità, una giurisdizione e una versione osservata.',boundary:'La registrazione non prova da sola autenticità, vigenza, completezza o applicabilità.'}),
  standard:Object.freeze({label:'Standard o riferimento volontario',definition:'Riferimento tecnico, organizzativo o di buona pratica distinto dalla fonte normativa cogente.',boundary:'Il richiamo a uno standard non lo trasforma automaticamente in obbligo di legge.'}),
  'obbligo-normativo':Object.freeze({label:'Obbligo normativo',definition:'Prescrizione ricondotta a una fonte normativa e a un contesto di applicabilità da valutare.',boundary:'ICTC non determina autonomamente che l’obbligo sia applicabile all’organizzazione.'}),
  requisito:Object.freeze({label:'Requisito di compliance',definition:'Unità di lavoro derivata o registrata per governare una prescrizione, un impegno o un criterio nel perimetro dichiarato.',boundary:'Un requisito ICTC non equivale da solo a un obbligo giuridico applicabile.'}),
  'perimetro-lavoro':Object.freeze({label:'Perimetro di lavoro',definition:'Ambito organizzativo o operativo scelto per l’analisi e la gestione in ICTC.',boundary:'Essere fuori dal perimetro di lavoro non dimostra non applicabilità giuridica.'}),
  applicabilita:Object.freeze({label:'Decisione di applicabilità',definition:'Valutazione umana registrata sul rapporto fra fonte, requisito, organizzazione, attività e perimetro.',boundary:'Applicabile non significa attuato, efficace o conforme.'}),
  mapping:Object.freeze({label:'Mapping',definition:'Relazione dichiarata fra requisito e uno o più elementi governati.',boundary:'Il mapping non dimostra equivalenza normativa, attuazione o efficacia.'}),
  controllo:Object.freeze({label:'Controllo',definition:'Misura organizzativa, procedurale o tecnica descritta nel perimetro ICTC.',boundary:'Presenza e descrizione non provano funzionamento o efficacia operativa.'}),
  'azione-correttiva':Object.freeze({label:'Azione correttiva',definition:'Impegno assegnato per trattare un gap, un finding, un rischio o un evento.',boundary:'Completata non significa verificata e chiusa.'}),
  rischio:Object.freeze({label:'Rischio di compliance',definition:'Scenario valutato con criteri interni, motivazione, base, trattamento e riesame.',boundary:'Rating e matrice orientano decisioni gestionali e non sono conclusioni regolatorie.'}),
  evidenza:Object.freeze({label:'Evidenza',definition:'Informazione o artefatto collegato a un claim, una decisione o una verifica.',boundary:'Disponibilità, integrità tecnica e sufficienza sostanziale restano proprietà distinte.'}),
  'decisione-umana':Object.freeze({label:'Decisione umana',definition:'Atto registrato da una persona autorizzata, riferito a oggetto, base, effetto e responsabilità.',boundary:'Il verbo deve precisare che cosa è stato deciso e con quale autorità.'}),
  'proposta-ai':Object.freeze({label:'Proposta AI',definition:'Output assistivo non vincolante prodotto su una base dichiarata e sottoposto a controllo umano.',boundary:'Confidenza, formato valido e provenienza tecnica non equivalgono a correttezza sostanziale.'}),
  'approvazione-interna':Object.freeze({label:'Approvazione interna',definition:'Conferma organizzativa di una versione o di un insieme di risposte.',boundary:'Non costituisce assurance indipendente, certificazione o giudizio dell’autorità.'}),
  ricevuta:Object.freeze({label:'Ricevuta ICTC',definition:'Traccia tecnica della mutazione registrata dal runtime.',boundary:'Hash e ricevuta non equivalgono a firma qualificata, marcatura temporale certificata o verità esterna.'})
});

export const IMPORTANCE_DIMENSIONS=Object.freeze([
  Object.freeze({id:'legal',label:'Rilevanza giuridico-regolatoria',definition:'Possibile incidenza su valutazioni, comunicazioni, responsabilità o adempimenti che richiedono una base applicabile e competenza umana.'}),
  Object.freeze({id:'social',label:'Rilevanza per persone e stakeholder',definition:'Possibile effetto su interessati, lavoratori, clienti, fornitori, autorità o altre parti coinvolte.'}),
  Object.freeze({id:'moral',label:'Rilevanza etica',definition:'Possibile effetto su correttezza, trasparenza, equità, tutela e responsabilità professionale.'}),
  Object.freeze({id:'organizational',label:'Rilevanza organizzativa',definition:'Modifica di responsabilità, perimetro, policy, assegnazioni o stato del lavoro.'}),
  Object.freeze({id:'operational',label:'Rilevanza operativa',definition:'Avvio, arresto, invio, esecuzione o chiusura di attività del sistema.'}),
  Object.freeze({id:'evidentiary',label:'Rilevanza probatoria',definition:'Produzione, modifica o approvazione di registrazioni ed evidenze usate in riesami o verifiche.'}),
  Object.freeze({id:'external',label:'Possibile effetto esterno',definition:'Possibile uscita dal perimetro ICTC o uso della decisione in comunicazioni verso soggetti esterni.'})
]);

export const PROTO_LEGAL_RULE=Object.freeze({
  requiredContext:['fonte','autorità','giurisdizione','versione','perimetro','base','competenza'],
  rule:'Il linguaggio prescrittivo è descrittivo e contestuale: ICTC non trasforma automaticamente testi normativi in obblighi applicabili, scadenze legali o conclusioni giuridiche.'
});
