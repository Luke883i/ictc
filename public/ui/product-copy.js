export const SURFACE_LABELS=Object.freeze({home:'Home',processes:'Processi di Compliance',proof:'Evidenze ICTC',proofCompact:'Evidenze ICTC'});

export const ICTC_MANIFEST=Object.freeze({
  eyebrow:'Scopo ICTC',
  title:'Rispettare le norme. Governare rischi e costi.',
  lead:'ICTC collega fonti, requisiti, rischi, controlli e interventi: aiuta imprese e PMI a organizzare la risposta agli obblighi applicabili e a usare con criterio le risorse.',
  method:'Individuare → valutare → organizzare → attuare → verificare.',
  dataAndAi:'Dati e allegati restano nel runtime locale corrente; l’eventuale egress AI segue provider e policy configurati. Il modello non riceve autorità sul dato o sulle decisioni.',
  adminTelemetry:'L’amministrazione governa provider, modelli e budget e osserva l’uso AI; le trace registrano modello, digest, request-id e usage quando disponibili.',
  boundary:'ICTC supporta il lavoro di conformità: non determina da solo applicabilità normativa, conformità, certificazione, responsabilità legale o giudizi professionali.'
});


// HOME-COMPLIANCE-1: presentation-only narrative within the existing copy owner.
// Legal examples are questions, never inferred legal applicability or a regulatory registry.
export const HOME_COMPLIANCE=Object.freeze({
  heading:'Perché rispettare le norme conta per l’impresa',
  lead:'Rispettare le norme è parte del modo in cui un’impresa protegge persone, dati, servizi e continuità delle attività. Gli obblighi cambiano con settore, dimensione, ruolo e operazioni: comprenderli e attuarli richiede responsabilità, controlli, tempo e risorse.',
  value:'ICTC collega fonti e requisiti da valutare a sistemi, processi, rischi, azioni ed evidenze. Aiuta a individuare lavoro necessario, evitare ricostruzioni ripetute e spiegare su quali basi sono state prese le decisioni.',
  economics:'La compliance ha costi di persone, tecnologia, controlli e verifiche; anche carenze, incidenti e interruzioni possono avere conseguenze economiche. ICTC organizza il lavoro e le relative evidenze, ma non calcola automaticamente ROI, sanzioni o costi di non conformità.',
  questions:Object.freeze([
    Object.freeze({title:'Chi è in perimetro?',text:'Attività, settore, ruolo, dati, sistemi e fornitori: la norma è davvero pertinente al caso?'}),
    Object.freeze({title:'Quali misure servono?',text:'Obblighi, controlli, procedure, scadenze e risultati attesi: quali sono richiesti?'}),
    Object.freeze({title:'Chi decide e chi attua?',text:'Responsabilità, competenze e risorse: chi valuta, interviene e riesamina?'}),
    Object.freeze({title:'Come si dimostra?',text:'Fonti, registrazioni, verifiche e limiti: che cosa è effettivamente documentato?'})
  ]),
  examples:Object.freeze([
    Object.freeze({id:'GDPR',case:'Una PMI utilizza un CRM con dati di clienti: quali trattamenti, ruoli, misure e verifiche sono pertinenti?',paths:'AO-01 · MC-01 · AR-01'}),
    Object.freeze({id:'231/2001',label:'D.Lgs. 231/2001',case:'Nella gestione di acquisti e fornitori, quali rischi-reato e presidi organizzativi meritano valutazione?',paths:'AO-01 · RC-01 · MC-01',sourceUrl:'https://www.normattiva.it/eli/id/2001/06/19/001G0293/CONSOLIDATED',boundary:'Il Modello 231 non è un adempimento automaticamente obbligatorio per ogni impresa; presupposti ed effetti richiedono valutazione giuridica.'}),
    Object.freeze({id:'NIS2',case:'Un’organizzazione potenzialmente in perimetro deve riesaminare misure cyber, fornitori e gestione degli incidenti: che cosa si applica?',paths:'RN-01 · AO-01 · RC-01',nationalUrl:'https://www.normattiva.it/eli/id/2024/10/01/24G00155/CONSOLIDATED'}),
    Object.freeze({id:'DORA',case:'Un’entità finanziaria interessata valuta la continuità di un servizio ICT critico e i relativi fornitori: quali controlli e prove servono?',paths:'AO-01 · RC-01 · AR-01'})
  ]),
  procedureTitle:'Le aree che compongono la risposta',
  boundary:'Esempi illustrativi, non valutazioni di applicabilità. Registrare una fonte, collegare un controllo o produrre un’evidenza non certifica conformità né efficacia. L’AI assiste; le decisioni restano umane.'
});

export const COMMON_COMPLIANCE_METHOD=Object.freeze(['Obblighi applicabili','Rischio e impatto','Controlli e azioni','Responsabilità','Evidenze','Limiti e riesame']);

export const HOMEBOARDING=Object.freeze({
  title:'Impara ICTC gestendo un caso',
  lead:'Parti dal caso: descrivi un fatto, verifica il perimetro, individua chi può decidere e registra il lavoro e le prove. Le lezioni spiegano i concetti durante il percorso, senza anticipare conclusioni di conformità.',
  chain:Object.freeze([
    Object.freeze({id:'capture-fact',step:'1',title:'Registra il fatto senza anticipare la conclusione',text:'Descrivi evento, fonte o cambiamento; separa ciò che sai da ciò che manca o è ancora controverso.'}),
    Object.freeze({id:'qualify-scope',step:'2',title:'Capisci quale perimetro richiede verifica',text:'Collega il fatto a processo, oggetto, requisito o rischio senza trasformare il collegamento in applicabilità o conformità.'}),
    Object.freeze({id:'assign-decision',step:'3',title:'Porta la domanda alla persona che può decidere',text:'Chi conosce il fatto può essere diverso da chi ha autorità: ICTC conserva owner, rationale, dissenso e limiti.'}),
    Object.freeze({id:'do-work',step:'4',title:'Esegui il prossimo lavoro verificabile',text:'Apri l’azione, il riesame o la raccolta di evidenza necessaria; scadenze e vincoli restano espliciti.'}),
    Object.freeze({id:'prove-review',step:'5',title:'Ricostruisci decisione, prova e riesame',text:'La chiusura deve lasciare versione, base, decisione, evidenza e limiti leggibili; nuova evidenza può riaprire il lavoro.'})
  ]),
  failureModes:Object.freeze([
    Object.freeze({id:'bad-fragmented-compliance',level:'bad',title:'Quando il lavoro si frammenta',chain:Object.freeze(['copie dello stesso oggetto','owner divergenti','controlli ripetuti','evidenze incoerenti','lavoro ridondante'])}),
    Object.freeze({id:'worst-untraceable-decisions',level:'worst',title:'Quando una decisione non è ricostruibile',chain:Object.freeze(['fatto senza contesto','decisione senza owner','azione senza verifica','evidenza senza provenienza','stato non falsificabile'])})
  ]),
  boundary:'Questa guida descrive concetti e pratiche di governance della compliance. Non determina applicabilità normativa, conformità, certificazione, efficacia dei controlli o responsabilità legale per un caso concreto.'
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


/* Canonical pedagogical stages; the original fifteen lessons remain byte-identical in homeboarding-lessons-v3.js. */
export const HOMEBOARDING_STAGES=Object.freeze([{"id":"C1","heading":"Perché sono qui?","lead":"ICTC aiuta a gestire le regole che possono riguardare l'impresa. Parti da un fatto concreto: non occorre già conoscere la compliance.","case":"Una PMI usa un CRM con dati dei clienti: quali informazioni servono prima di decidere come agire?","why":"Decisioni prive di base e traccia possono esporre persone, servizi e risorse a rischi evitabili.","do":"Distingui un fatto osservato da una conclusione ancora da verificare.","how":"Riconosci la fonte, il contesto e ciò che ancora non conosci.","checkpoint":"Ho preso visione della distinzione tra fatti osservati e obblighi accertati.","lesson_ids":["L00","L01","L02"]},{"id":"C2","heading":"Perché non basta trovare una norma?","lead":"Una fonte disponibile non si applica automaticamente a ogni impresa; bisogna valutarne il perimetro.","case":"GDPR, NIS2 e DORA possono riguardare soggetti e attività diversi: la loro presenza nel catalogo non decide l'applicabilità.","why":"Senza verificare le condizioni si rischia di ignorare obblighi reali o attribuire doveri inesistenti.","do":"Individua le informazioni di perimetro e chi ha competenza per decidere.","how":"Collega fonte, entità, ruolo, attività e decisione umana motivata.","checkpoint":"Ho preso visione della differenza tra fonte, ambito di lavoro e applicabilità.","lesson_ids":["L03","L04","L05"]},{"id":"C3","heading":"Che cosa serve fare, e a chi compete?","lead":"Una volta qualificata una domanda regolatoria, il lavoro riguarda sistemi, persone, processi e controlli specifici.","case":"Il CRM dipende da un fornitore: chi presidia il servizio, chi valuta il rischio e chi verifica le misure?","why":"Senza responsabilità attribuite una carenza può restare irrisolta o moltiplicare attività duplicate.","do":"Identifica oggetto, impatto, owner e controllo da valutare.","how":"Collega il lavoro ai processi senza confondere esecuzione, challenge e assurance.","checkpoint":"Ho preso visione della separazione tra chi esegue e chi verifica.","lesson_ids":["L06","L07","L08"]},{"id":"C4","heading":"Come dimostro ciò che è stato fatto?","lead":"Una decisione e un controllo hanno bisogno di evidenze riferite a fonte, versione, periodo e responsabile.","case":"Una procedura dimostra una regola scritta, non che un controllo abbia operato in modo efficace.","why":"Una prova senza contesto rischia di essere scambiata per una conclusione di conformità.","do":"Individua quale affermazione vuoi sostenere e quali evidenze sono pertinenti.","how":"Conserva provenienza, versione, decisione, periodo e limiti della prova.","checkpoint":"Ho preso visione della differenza tra mapping, evidenza e conformità.","lesson_ids":["L09","L10","L11"]},{"id":"C5","heading":"Come comincio a lavorare in ICTC?","lead":"Scegli il processo relativo al problema concreto: ogni passaggio mantiene fonte, decisioni umane e risultati verificabili.","case":"RN-01 osserva fonti; EC-01 gli eventi; AO-01 gli oggetti; MC-01 perimetri e controlli; RC-01 i rischi; AP-01 le azioni; AR-01 le verifiche.","why":"Una variazione può riaprire il lavoro, ma nessun handoff trasferisce automaticamente autorità.","do":"Scegli il processo e individua la prossima decisione necessaria.","how":"Registra il fatto, collega la fonte e raccogli la prova, prevedendo il riesame quando serve.","checkpoint":"Dichiaro di aver preso visione delle cinque tappe e dei limiti di ICTC; non certifico la mia comprensione.","lesson_ids":["L12","L13","L14"]}].map(stage=>Object.freeze({...stage,lesson_ids:Object.freeze(stage.lesson_ids)})));
