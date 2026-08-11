export const SURFACE_LABELS=Object.freeze({home:'Oggi',processes:'Processi di Compliance',proof:'Postura ICTC',proofCompact:'Postura ICTC'});

export const ICTC_MANIFEST=Object.freeze({
  eyebrow:'Scopo ICTC',
  title:'Conformità come lavoro umano verificabile.',
  lead:'ICTC aiuta persone e organizzazioni a collegare obblighi applicabili, rischi, controlli, responsabilità ed evidenze in un unico contesto. L’AI accelera ricerca e preparazione; le decisioni restano umane.',
  method:'Requisito → rischio o impatto → controllo o azione → responsabile → evidenza → limite.',
  dataAndAi:'Dati e allegati restano nel runtime locale corrente; l’eventuale egress AI segue il provider configurato e la policy di rete. Il modello non riceve autorità sul dato o sulle decisioni.',
  adminTelemetry:'L’amministrazione governa provider, modelli e budget e osserva utilizzo AI per scopo; le trace registrano modello, digest, request-id e usage quando disponibili.',
  boundary:'ICTC supporta il lavoro di conformità: non determina da solo applicabilità normativa, conformità, certificazione, responsabilità legale o giudizi professionali.'
});

export const COMMON_COMPLIANCE_METHOD=Object.freeze(['Obblighi applicabili','Rischio e impatto','Controlli e azioni','Responsabilità','Evidenze','Limiti e riesame']);

export const SURFACE_INFORMATION=Object.freeze({
  home:Object.freeze({purpose:'Capisci cosa richiede attenzione e quale decisione umana viene dopo.',why:'La conformità diventa gestibile quando obblighi, rischi, lavoro, responsabilità ed evidenze restano collegati.',evidence:'Priorità, ruoli, decisioni e stato corrente.',boundary:'Orientamento operativo non significa giudizio di conformità o applicabilità.'}),
  processes:Object.freeze({purpose:'Scegli il Processo di Compliance coerente con il lavoro da governare.',why:'Ogni processo rende espliciti scopo, checkpoint umano, stato, evidenze e limiti.',evidence:'Processo scelto, stato osservabile, decisioni e prove collegate.',boundary:'La scelta del processo organizza il lavoro; non decide applicabilità normativa o conformità.'}),
  monitoring:Object.freeze({purpose:'Osserva fonti, materiali e cambiamenti nel perimetro dichiarato.',why:'Un cambiamento può modificare requisiti, rischi, controlli, azioni o priorità.',evidence:'Originali, versioni del piano, esecuzioni, osservazioni e decisioni sulle fonti.',boundary:'La scoperta di una fonte non prova applicabilità, vigenza, completezza o impatto.'}),
  incidents:Object.freeze({purpose:'Preserva i fatti e governa chiarimenti, impatto, risposta e chiusura.',why:'Una ricostruzione affidabile separa fatti, inferenze, decisioni e obblighi da valutare.',evidence:'Originale, allegati, risposte, versioni, decisioni, collegamenti e receipt.',boundary:'La classificazione operativa non determina obblighi di notifica, responsabilità o rilevanza regolatoria.'}),
  grc:Object.freeze({purpose:'Trasforma requisiti, rischi e verifiche in lavoro governato e ricostruibile.',why:'La conformità richiede collegare ciò che conta a chi decide, cosa viene fatto e quale prova rimane.',evidence:'Stati, versioni, responsabilità, relazioni, decisioni ed evidenze del processo attivo.',boundary:'Stati, score e mapping operativi non equivalgono automaticamente ad applicabilità, efficacia o conformità.'}),
  proof:Object.freeze({purpose:'Leggi ciò che ICTC può dimostrare sul proprio funzionamento e con quali limiti.',why:'Una postura utile distingue pratica, evidenza osservabile e confine della prova.',evidence:'Controlli, artefatti, mapping e limiti verificabili del runtime e del repository.',boundary:'Postura ICTC non è certificazione, conclusione legale o security assessment del deployment.'}),
  epistemic:Object.freeze({purpose:'Esplora come fonti, requisiti, oggetti, rischi, controlli, decisioni ed evidenze sono collegati.',why:'La vista trasversale rende visibili dipendenze, basi e lacune senza trasformare inferenze in fatti.',evidence:'Relazioni, versioni, basi dichiarate, checkpoint e letture proposte.',boundary:'Il reticolo organizza conoscenza e inferenze; non crea verità sostanziale, applicabilità o autorità decisionale.'}),
  admin:Object.freeze({purpose:'Governa accessi, identità, provider e modelli AI, budget e telemetria operativa.',why:'Sicurezza e uso responsabile dell’AI richiedono configurazione esplicita, osservabilità e responsabilità amministrativa.',evidence:'Controlli verificati, readiness, utilizzo AI per scopo, budget, identità e policy configurate.',boundary:'Telemetria e readiness descrivono il runtime osservato; non certificano il deployment o la conformità dell’organizzazione.'}),
  aiSettings:Object.freeze({purpose:'Configura il canale AI senza delegargli autorità decisionale.',why:'Provider, modello, credenziali e istruzioni definiscono dove può avvenire l’egress e come viene usata l’AI.',evidence:'Configurazione tracciata, trace di chiamata e receipt delle modifiche.',boundary:'Configurare un provider non rende i suoi output veri, applicabili o autorizzati.'})
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
 proofTitle:'Postura ICTC',
 proofLead:'Mostra cosa ICTC puo dimostrare oggi, con quali prove e quali limiti.',
 proofBoundary:'La postura descrive controlli ed evidenze osservabili di ICTC; non e una certificazione, una conclusione legale o un security assessment del deployment.',
 proofAction:'Apri Postura ICTC'
});
