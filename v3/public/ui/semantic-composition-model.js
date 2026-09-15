export const SEMANTIC_COMPOSITION_VERSION='3.1.0';

export const INFORMATION_ROLES=Object.freeze([
  'identity','context','attention','decision','action','state','evidence','consequence','boundary','technical'
]);

export const COMPLIANCE_BASIS=Object.freeze({
  identifiedObligation:'obbligo identificato',
  obligationToAssess:'obbligo da valutare',
  organizationalNeed:'esigenza organizzativa',
  controlOpportunity:'opportunità di controllo'
});

export const PROCEDURE_COMPOSITION=Object.freeze({
  monitoring:Object.freeze({code:'RN-01',purpose:'Raccoglie fonti e cambiamenti, conserva la versione osservata e porta alla verifica umana ciò che può generare nuovo lavoro.',basis:COMPLIANCE_BASIS.obligationToAssess,value:'Riduce il lavoro manuale di sorveglianza e collega un cambiamento verificato ai requisiti o alle attività che devono essere riesaminati.',primary:'Aggiungi materiale',entry:'Sorveglia fonti'}),
  incidents:Object.freeze({code:'EC-01',purpose:'Registra fatti, chiarimenti e versioni di un evento prima delle decisioni di invio o chiusura.',basis:COMPLIANCE_BASIS.obligationToAssess,value:'Preserva una ricostruzione verificabile e rende espliciti fatti mancanti, decisioni e lavoro successivo.',primary:'Registra evento',entry:'Gestisci eventi'}),
  objects:Object.freeze({code:'AO-01',purpose:'Mantiene il registro di sistemi, servizi, dati, fornitori, processi, policy e controlli usati come base del lavoro di compliance.',basis:COMPLIANCE_BASIS.organizationalNeed,value:'Rende identificabili responsabilità, sistemi di origine e oggetti da collegare a requisiti, rischi ed evidenze.',primary:'Aggiungi oggetto',entry:'Verifica inventario'}),
  coverage:Object.freeze({code:'MC-01',purpose:'Registra requisiti, decisioni di perimetro e mapping verso controlli o oggetti senza trasformare la copertura in un giudizio di conformità.',basis:COMPLIANCE_BASIS.identifiedObligation,value:'Rende visibili requisiti non coperti, mapping da verificare e decisioni di esclusione motivate.',primary:'Aggiungi requisito',entry:'Valuta norme e controlli'}),
  actions:Object.freeze({code:'AP-01',purpose:'Trasforma gap, rischi e decisioni in azioni assegnate, con scadenza, evidenze di completamento e verifica distinta di chiusura.',basis:COMPLIANCE_BASIS.organizationalNeed,value:'Collega una carenza a un responsabile e rende verificabile il passaggio da lavoro eseguito a chiusura approvata.',primary:'Crea azione',entry:'Gestisci remediation'}),
  risks:Object.freeze({code:'RC-01',purpose:'Registra scenari di rischio di compliance, valutazioni umane, trattamenti e date di riesame.',basis:COMPLIANCE_BASIS.organizationalNeed,value:'Collega scenari, controlli e azioni senza trattare il rating come probabilità oggettiva o conclusione regolatoria.',primary:'Aggiungi scenario',entry:'Valuta rischi'}),
  assurance:Object.freeze({code:'AR-01',purpose:'Gestisce richieste di verifica e questionari, versiona le risposte e collega le evidenze usate per l’approvazione interna.',basis:COMPLIANCE_BASIS.organizationalNeed,value:'Riduce la duplicazione delle risposte e rende riutilizzabili evidenze e formulazioni già approvate nel loro perimetro.',primary:'Nuova verifica',entry:'Gestisci questionari'})
});

export const SURFACE_BLUEPRINTS=Object.freeze({
  home:Object.freeze({root:'#homeView',kind:'work',title:'Attività di compliance',purpose:'Vedi ciò che richiede il tuo intervento e apri direttamente il processo in cui decidere o completare il lavoro.',first:'attention',technicalDefault:false}),
  processes:Object.freeze({root:'#processesView',kind:'catalogue',title:'Processi di Compliance',purpose:'Scegli il processo in base all’oggetto da governare: fonti, eventi, oggetti, requisiti, azioni, rischi o richieste di verifica.',first:'catalogue',technicalDefault:false}),
  monitoring:Object.freeze({root:'#monitoringView',kind:'procedure',procedure:'monitoring',first:'work',technicalDefault:false}),
  incidents:Object.freeze({root:'#incidentsView',kind:'procedure',procedure:'incidents',first:'work',technicalDefault:false}),
  objects:Object.freeze({root:'#grcWorkspace',kind:'procedure',procedure:'objects',first:'work',technicalDefault:false}),
  coverage:Object.freeze({root:'#grcWorkspace',kind:'procedure',procedure:'coverage',first:'work',technicalDefault:false}),
  actions:Object.freeze({root:'#grcWorkspace',kind:'procedure',procedure:'actions',first:'work',technicalDefault:false}),
  risks:Object.freeze({root:'#grcWorkspace',kind:'procedure',procedure:'risks',first:'work',technicalDefault:false}),
  assurance:Object.freeze({root:'#grcWorkspace',kind:'procedure',procedure:'assurance',first:'work',technicalDefault:false}),
  proof:Object.freeze({root:'#proofView',kind:'evidence',title:'Evidenze ICTC',purpose:'Ricostruisci quali decisioni sono registrate, quali evidenze le sostengono e quali aspetti richiedono ancora prova esterna.',first:'decision-evidence',technicalDefault:false}),
  epistemic:Object.freeze({root:'#epistemicView',kind:'relationships',title:'Relazioni tra decisioni, fonti ed evidenze',purpose:'Esplora dipendenze, versioni e basi registrate per capire da dove nasce un’informazione e quale lavoro può richiedere riesame.',first:'relationships',technicalDefault:false}),
  admin:Object.freeze({root:'#adminCenter',kind:'administration',title:'Amministrazione ICTC',purpose:'Gestisci configurazioni che cambiano accessi, uso AI, processi disponibili e controlli tecnici del runtime.',first:'attention',technicalDefault:false}),
  'ai-settings':Object.freeze({root:'#settingsDialog',kind:'configuration',title:'Configurazione AI',purpose:'Definisci provider, modello e istruzioni che determinano egress e uso dell’AI; le decisioni restano umane.',first:'configuration',technicalDefault:false})
});

export const COMPOSITION_INVARIANTS=Object.freeze(['identity-one','purpose-one','operative-first','no-numeric-home-dashboard','no-tautology','one-primary-action','attention-before-metric','metric-with-decision','business-first','concrete-copy','why-bounded','action-consequence','evidence-near-decision','progressive-technical','disclosure-on-demand','list-before-cards','empty-is-actionable','landing-not-manual','single-copy-owner','canonical-lexicon','regulatory-boundary','value-concrete']);

export const COMPOSITION_METRICS=Object.freeze({operationalReach:1,narrativeBeforeWorkMax:2,redundancyRatioMax:0.05,actionDensityMin:0.5,technicalLeakageMax:0,abstractCopyRateMax:0,decisionDistanceMax:1,progressiveDisclosureCompliance:1,canonicalVocabularyCoverage:1,identityConsistency:1,mutationKillRate:1,holdoutNewFamiliesMax:0});
