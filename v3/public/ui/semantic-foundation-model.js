export const SEMANTIC_FOUNDATION_VERSION='3.0.0';

export const BUSINESS_GLOSSARY=Object.freeze({
  'fonte-normativa':Object.freeze({label:'Fonte normativa',definition:'Atto, documento o pubblicazione ricondotta a un’autorità, una giurisdizione e una versione osservata.',boundary:'La registrazione non prova da sola autenticità, vigenza, completezza o applicabilità.'}),
  obbligo:Object.freeze({label:'Obbligo o requisito',definition:'Prescrizione o aspettativa tipizzata e collegata alla relativa fonte.',boundary:'L’applicabilità all’organizzazione richiede una decisione contestualizzata.'}),
  applicabilita:Object.freeze({label:'Decisione di applicabilità',definition:'Valutazione umana registrata sul rapporto fra requisito, organizzazione, attività e perimetro.',boundary:'Applicabile non significa attuato, efficace o conforme.'}),
  mapping:Object.freeze({label:'Mapping',definition:'Relazione dichiarata fra requisito e uno o più elementi governati.',boundary:'Il mapping non dimostra equivalenza normativa, attuazione o efficacia.'}),
  controllo:Object.freeze({label:'Controllo',definition:'Misura organizzativa, procedurale o tecnica descritta nel perimetro ICTC.',boundary:'Presenza e descrizione non provano funzionamento o operating effectiveness.'}),
  'azione-correttiva':Object.freeze({label:'Azione correttiva',definition:'Impegno assegnato per trattare un gap, un finding, un rischio o un evento.',boundary:'Completata non significa verificata e chiusa.'}),
  rischio:Object.freeze({label:'Rischio di compliance',definition:'Scenario valutato con criteri interni, motivazione, base, trattamento e riesame.',boundary:'Rating e matrice orientano decisioni gestionali e non sono conclusioni regolatorie.'}),
  evidenza:Object.freeze({label:'Evidenza',definition:'Informazione o artefatto collegato a un claim, una decisione o una verifica.',boundary:'Disponibilità, integrità tecnica e sufficienza sostanziale restano proprietà distinte.'}),
  'decisione-umana':Object.freeze({label:'Decisione umana',definition:'Atto registrato da una persona autorizzata, riferito a oggetto, base, effetto e responsabilità.',boundary:'Il verbo deve precisare che cosa è stato deciso e con quale autorità.'}),
  'proposta-ai':Object.freeze({label:'Proposta AI',definition:'Output assistivo non vincolante prodotto su una base dichiarata e sottoposto a controllo umano.',boundary:'Confidenza, formato valido e provenance non equivalgono a correttezza sostanziale.'}),
  'approvazione-interna':Object.freeze({label:'Approvazione interna',definition:'Conferma organizzativa di una versione o di un insieme di risposte.',boundary:'Non costituisce assurance indipendente, certificazione o giudizio dell’autorità.'}),
  ricevuta:Object.freeze({label:'Ricevuta ICTC',definition:'Traccia tecnica della mutazione registrata dal runtime.',boundary:'Hash e ricevuta non equivalgono a firma qualificata, marcatura temporale certificata o verità esterna.'})
});

export const IMPORTANCE_DIMENSIONS=Object.freeze([
  Object.freeze({id:'legal',label:'Rilevanza giuridico-regolatoria'}),
  Object.freeze({id:'social',label:'Rilevanza per persone e stakeholder'}),
  Object.freeze({id:'moral',label:'Rilevanza etica'}),
  Object.freeze({id:'organizational',label:'Rilevanza organizzativa'}),
  Object.freeze({id:'operational',label:'Rilevanza operativa'}),
  Object.freeze({id:'evidentiary',label:'Rilevanza probatoria'}),
  Object.freeze({id:'external',label:'Effetto esterno'})
]);

export const PROTO_LEGAL_RULE=Object.freeze({
  requiredContext:['fonte','autorità','giurisdizione','versione','perimetro','base','competenza'],
  rule:'Il linguaggio prescrittivo è descrittivo e contestuale: ICTC non trasforma automaticamente testi normativi in obblighi applicabili o conclusioni legali.'
});
