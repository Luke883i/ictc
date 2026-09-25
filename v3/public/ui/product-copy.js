export const SURFACE_LABELS=Object.freeze({home:'Home',processes:'Processi di Compliance',proof:'Evidenze ICTC',proofCompact:'Evidenze ICTC'});

export const ICTC_MANIFEST=Object.freeze({
  eyebrow:'Scopo ICTC',
  title:'Conformità come lavoro umano verificabile.',
  lead:'ICTC collega obblighi, rischi, controlli, responsabilità ed evidenze. L’AI prepara e ricerca; le decisioni restano umane.',
  method:'Requisito → rischio o impatto → controllo o azione → responsabile → evidenza → limite.',
  dataAndAi:'Dati e allegati restano nel runtime locale corrente; l’eventuale egress AI segue provider e policy configurati. Il modello non riceve autorità sul dato o sulle decisioni.',
  adminTelemetry:'L’amministrazione governa provider, modelli e budget e osserva l’uso AI; le trace registrano modello, digest, request-id e usage quando disponibili.',
  boundary:'ICTC supporta il lavoro di conformità: non determina da solo applicabilità normativa, conformità, certificazione, responsabilità legale o giudizi professionali.'
});

export const COMMON_COMPLIANCE_METHOD=Object.freeze(['Obblighi applicabili','Rischio e impatto','Controlli e azioni','Responsabilità','Evidenze','Limiti e riesame']);

export const HOMEBOARDING=Object.freeze({
  title:'Capire ICTC in pochi minuti',
  lead:'La compliance diventa gestibile quando norme, contesto aziendale, decisioni, responsabilità ed evidenze restano distinti ma collegati.',
  chain:Object.freeze([
    Object.freeze({id:'orthogonal-rules',step:'1',title:'Le norme non si sostituiscono tra loro',text:'La stessa attività può essere toccata da privacy, cybersecurity, settore, contratti o regole interne per ragioni diverse.'}),
    Object.freeze({id:'enterprise-complexity',step:'2',title:'Il contesto reale cambia il perimetro',text:'Sistemi, dati, fornitori, processi, ruoli, paesi e servizi creano intersezioni diverse: una checklist unica non basta.'}),
    Object.freeze({id:'standard-method',step:'3',title:'Leggi, standard e framework fanno lavori diversi',text:'Obbligo, metodo, riferimento, mapping ed efficacia restano concetti distinti.'}),
    Object.freeze({id:'canonical-objects',step:'4',title:'Riusa oggetti governati, non copie per norma',text:'Oggetti, rischi, azioni e controlli restano riutilizzabili mantenendo chi decide, perché e su quale base.'}),
    Object.freeze({id:'evidence-chain',step:'5',title:'Ogni decisione deve poter essere ricostruita',text:'Requisito → oggetto e contesto → rischio o impatto → controllo o azione → responsabile → evidenza → limite e riesame.'})
  ]),
  failureModes:Object.freeze([
    Object.freeze({id:'bad-fragmented-compliance',level:'bad',title:'Scenario BAD · checklist separate',chain:Object.freeze(['oggetti duplicati','responsabilità divergenti','controlli ripetuti','evidenze incoerenti','lavoro ridondante'])}),
    Object.freeze({id:'worst-untraceable-decisions',level:'worst',title:'Scenario WORST · decisioni non ricostruibili',chain:Object.freeze(['fonte senza contesto','decisione senza proprietario','azione senza verifica','evidenza senza provenienza','stato non falsificabile'])})
  ]),
  boundary:'Percorso formativo sul metodo: non determina applicabilità normativa, conformità, certificazione, efficacia dei controlli o responsabilità legale.'
});

export const SURFACE_INFORMATION=Object.freeze({
  home:Object.freeze({purpose:'Individua il lavoro aperto e la prossima decisione.',why:'Il lavoro è governabile quando responsabilità, decisioni ed evidenze restano collegate.',evidence:'Code operative, ruoli, decisioni e stato corrente.',boundary:'Le metriche orientano il lavoro; non misurano conformità o applicabilità.'}),
  processes:Object.freeze({purpose:'Scegli il processo coerente con l’oggetto del lavoro.',why:'Ogni processo collega una decisione umana a stato ed evidenza.',evidence:'Processo, stato, decisioni e tracce collegate.',boundary:'La scelta del processo organizza il lavoro; non decide la conformità.'}),
  monitoring:Object.freeze({purpose:'Raccogli fonti e governa i cambiamenti da valutare.',why:'Un cambiamento può richiedere una decisione su impatto o lavoro successivo.',evidence:'Originali, piani, osservazioni e decisioni sulle fonti.',boundary:'Una fonte trovata non prova applicabilità, vigenza o completezza.'}),
  incidents:Object.freeze({purpose:'Registra fatti e governa chiarimenti, invio e chiusura.',why:'Una ricostruzione affidabile separa fatti, ignoto e decisioni.',evidence:'Originale, allegati, risposte, versioni e decisioni.',boundary:'La classificazione operativa non determina obblighi di notifica o rilevanza legale.'}),
  grc:Object.freeze({purpose:'Collega requisiti, oggetti, rischi e azioni a decisioni verificabili.',why:'Ogni stato deve avere responsabile, ragione e prova coerenti col processo.',evidence:'Stati, versioni, responsabilità, relazioni e decisioni.',boundary:'Stati, score e mapping operativi non equivalgono a conformità o efficacia.'}),
  proof:Object.freeze({purpose:'Verifica cosa ICTC osserva e quale evidenza lo sostiene.',why:'Fatto registrato, prova tecnica, requisito esterno e limite devono restare distinti.',evidence:'Decisioni, controlli, artefatti, mapping e limiti osservabili.',boundary:'Le evidenze ICTC non sono certificazione, conclusione legale o assessment del deployment.'}),
  epistemic:Object.freeze({purpose:'Esplora relazioni e basi tra fonti, requisiti, oggetti, rischi, decisioni ed evidenze.',why:'La vista trasversale rende visibili dipendenze e lacune senza trasformare inferenze in fatti.',evidence:'Relazioni, versioni, basi e checkpoint.',boundary:'Il reticolo organizza conoscenza; non crea applicabilità o autorità decisionale.'}),
  admin:Object.freeze({purpose:'Governa accessi, identità, AI e controlli tecnici.',why:'Configurazione e uso AI richiedono policy, osservabilità e responsabilità amministrativa.',evidence:'Controlli, utilizzo AI, budget, identità e policy configurate.',boundary:'Telemetria e readiness descrivono il runtime; non certificano deployment o organizzazione.'}),
  aiSettings:Object.freeze({purpose:'Configura il canale AI senza delegare decisioni.',why:'Provider, modello e credenziali definiscono egress e uso dell’AI.',evidence:'Configurazione, trace di chiamata e receipt.',boundary:'La configurazione di un provider non rende i suoi output veri né autorizzati.'})
});

export const PROCEDURE_INFORMATION_BOUNDARIES=Object.freeze({
  monitoring:'Scoperta e osservazione non determinano applicabilità o completezza.',
  incidents:'Classificazione operativa non determina obblighi di notifica o rilevanza legale.',
  objects:'Il registro governato non prova la completezza dell’ambiente reale o dei sistemi master esterni.',
  coverage:'Copertura e crosswalk non stabiliscono applicabilità, certificazione o efficacia dei controlli.',
  actions:'Completamento operativo non equivale a chiusura verificata; la priorità non è una conclusione legale.',
  risks:'Gli score sono giudizi di gestione, non probabilità oggettive o classificazioni regolatorie.',
  assurance:'L’approvazione interna di una risposta non costituisce certificazione o assurance esterna.'
});

export const PRODUCT_COPY=Object.freeze({
 proofTitle:'Evidenze ICTC',
 proofLead:'Distingui fatti osservati, evidenze disponibili e aspetti che richiedono prova esterna.',
 proofBoundary:'Le evidenze descrivono controlli osservabili di ICTC; non costituiscono certificazione, conclusione legale, security assessment del deployment o giudizio di conformità dell’organizzazione.',
 proofAction:'Apri Evidenze ICTC'
});