export const SEMANTIC_COMPOSITION_VERSION='3.3.0';
export const WORKBOOK_AUTHORITY_VERSION='3.3.0';
export const WORKBOOK_SOURCE=Object.freeze({
  baseline:Object.freeze({name:'ICTC_ENTERPRISE_WORKSPACE_WORKBOOK_v1.1',sha256:'632567b6e903bd52023b321d8268e02162eef9092d0a18f027b6113fafbc4bbd'}),
  iter1bis:Object.freeze({name:'ICTC_ENTERPRISE_WORKSPACE_WORKBOOK_v1.1_ITER1BIS',sha256:'6e9d7d10cfbb064e8aa9e048fd9f794332ff4f8987bdac998b4b71f377cca32d'})
});

export const INFORMATION_ROLES=Object.freeze([
  'identity','context','attention','decision','action','evidence','consequence','boundary','technical'
]);

export const COMPLIANCE_BASIS=Object.freeze({
  identifiedObligation:'obbligo identificato',
  obligationToAssess:'obbligo da valutare',
  organizationalNeed:'esigenza organizzativa',
  controlOpportunity:'opportunità di controllo'
});

export const WORKBOOK_COPY=Object.freeze({
  home:Object.freeze({code:'HOME',surface:'Attività di compliance',catalogueSummary:'ICTC supporta la governance e l’assurance interna della compliance: traduce fonti e adempimenti — ad esempio GDPR, NIS2 e requisiti organizzativi — in lavoro tracciabile su requisiti, sistemi, controlli, rischi, azioni ed evidenze. Collega le decisioni umane a standard e buone pratiche di riferimento e rende esplicito ciò che è documentato, ciò che richiede riesame e ciò che resta da verificare.',workspacePurpose:'Mostra le attività che richiedono intervento nel perimetro e ruolo correnti.',examples:'GDPR; NIS2; provvedimenti Garante; indicazioni ACN; standard e buone pratiche selezionate.',boundary:'ICTC formalizza lavoro, basi, decisioni ed evidenze; non produce da solo un giudizio legale o assurance indipendente.',primary:'Apri attività',secondary:'Tutti i processi',owner:'semantic model → stable-shell',status:'Candidate'}),
  monitoring:Object.freeze({code:'RN-01',surface:'Monitoraggio normativo e fonti',catalogueSummary:'Raccoglie e versiona fonti e aggiornamenti — ad esempio GDPR, NIS2, provvedimenti del Garante e indicazioni ACN — per sottoporli a verifica umana e trasformare i cambiamenti rilevanti in requisiti o attività di riesame.',workspacePurpose:'Sorveglia fonti e materiali, conserva la versione osservata e porta alla verifica umana ciò che può generare nuovo lavoro.',examples:'Fonti UE/IT; Garante; ACN; standard selezionati; materiali interni.',boundary:'Fonte osservata ≠ obbligo applicabile; proposta ≠ decisione.',primary:'Aggiungi materiale',secondary:'Sorveglia fonti',owner:'semantic model → procedure-frame',status:'Candidate'}),
  incidents:Object.freeze({code:'EC-01',surface:'Incidenti e quasi incidenti',catalogueSummary:'Registra eventi come phishing, accessi anomali, indisponibilità o possibile perdita/divulgazione di dati; conserva fatti e versioni e supporta la valutazione umana della rilevanza rispetto a GDPR, NIS2/ACN e procedure interne, senza anticiparne la qualificazione legale.',workspacePurpose:'Registra fatti, chiarimenti e versioni di un evento prima delle decisioni di invio o chiusura.',examples:'Personal data breach; incidenti NIS2; eventi cyber/IT; quasi incidenti.',boundary:'Registrazione o invio interno ≠ notifica esterna o qualificazione legale.',primary:'Registra evento',secondary:'Gestisci eventi',owner:'semantic model → procedure-frame',status:'Candidate'}),
  objects:Object.freeze({code:'AO-01',surface:'Inventario di sistemi e oggetti',catalogueSummary:'Censisce sistemi, servizi, dati, fornitori, processi, policy e controlli per rendere identificabili responsabilità e perimetri usati nelle valutazioni GDPR/NIS2, nei rischi e nei mapping verso standard e buone pratiche.',workspacePurpose:'Mantiene identità governate e relazioni di base per il lavoro di compliance.',examples:'Asset e servizi; dati; fornitori; processi; policy; controlli.',boundary:'Inventario ≠ completezza sostanziale o applicabilità normativa.',primary:'Aggiungi oggetto',secondary:'Verifica inventario',owner:'semantic model → procedure-frame',status:'Candidate'}),
  coverage:Object.freeze({code:'MC-01',surface:'Standard e Controlli',catalogueSummary:'Organizza requisiti normativi, standard e buone pratiche e li collega a controlli e oggetti aziendali; documenta perimetro e mapping senza trasformare la copertura in prova automatica di conformità o efficacia.',workspacePurpose:'Registra requisiti, decisioni di perimetro e mapping verso controlli o oggetti.',examples:'GDPR; NIS2; ISO/IEC 27001; NIST CSF; CIS Controls; policy interne, se selezionati.',boundary:'Mapping ≠ conformità; controllo dichiarato ≠ efficacia verificata.',primary:'Aggiungi requisito',secondary:'Valuta norme e controlli',owner:'semantic model → procedure-frame',status:'Candidate'}),
  actions:Object.freeze({code:'AP-01',surface:'Azioni correttive',catalogueSummary:'Gestisce remediation derivanti da gap, rischi, incidenti o verifiche: assegna responsabilità e scadenze, raccoglie evidenze del lavoro svolto e mantiene distinta la verifica finale di chiusura.',workspacePurpose:'Trasforma gap, rischi e decisioni in azioni assegnate con prova di completamento e chiusura verificata separata.',examples:'Remediation da audit, incidenti, rischio, gap di controllo o verifica.',boundary:'Completato ≠ chiuso/verificato.',primary:'Crea azione',secondary:'Gestisci remediation',owner:'semantic model → procedure-frame',status:'Candidate'}),
  risks:Object.freeze({code:'RC-01',surface:'Rischi di compliance',catalogueSummary:'Registra scenari di rischio, valutazioni umane, controlli e trattamenti; collega il rischio agli oggetti interessati e alle azioni necessarie mantenendo il rating distinto da una probabilità oggettiva o da un giudizio regolatorio.',workspacePurpose:'Registra scenari, valutazioni, trattamenti e date di riesame.',examples:'Rischio normativo, cyber, privacy, terze parti e controllo, secondo metodo organizzativo.',boundary:'Rating ≠ probabilità oggettiva; valutazione ≠ conclusione regolatoria.',primary:'Aggiungi scenario',secondary:'Valuta rischi',owner:'semantic model → procedure-frame',status:'Candidate'}),
  assurance:Object.freeze({code:'AR-01',surface:'Questionari e verifiche',catalogueSummary:'Gestisce assessment, questionari e richieste di verifica interne o di terze parti; versiona risposte ed evidenze per audit, clienti e stakeholder mantenendo l’approvazione interna distinta dall’assurance indipendente.',workspacePurpose:'Gestisce richieste di verifica, versiona le risposte e collega le evidenze usate per approvazione interna.',examples:'Questionari cliente; audit readiness; assessment interni; richieste terze parti.',boundary:'Approvazione interna ≠ assurance/certificazione indipendente.',primary:'Nuova verifica',secondary:'Gestisci questionari',owner:'semantic model → procedure-frame',status:'Candidate'}),
  proof:Object.freeze({code:'PROOF',surface:'Evidenze ICTC',catalogueSummary:'Ricostruisci decisioni, basi ed evidenze registrate; separa ciò che ICTC può documentare da ciò che richiede prova o attestazione esterna.',workspacePurpose:'Apri una decisione o un oggetto e verifica motivazione, evidenze collegate, limiti ed eventuali requisiti esterni.',examples:'Decision receipts; dossier; evidence refs; external deployment attestations.',boundary:'Evidenza ≠ conclusione; integrità interna ≠ autenticità esterna.',primary:'Apri decisione',secondary:'Come interpretare questa vista',owner:'proof-surface',status:'Candidate'}),
  epistemic:Object.freeze({code:'EP-01',surface:'Relazioni tra decisioni, fonti ed evidenze',catalogueSummary:'Ricostruisci origine, versioni e dipendenze di un’informazione e individua cosa può richiedere riesame.',workspacePurpose:'Cerca un elemento, segui basis e relazioni, quindi ispeziona il dettaglio registrato.',examples:'SubjectVersion; EpistemicStep; basis; producer; relazioni; proposed readings.',boundary:'Vista trasversale: non determina conformità, applicabilità o priorità sostanziale.',primary:'Cerca nel reticolo',secondary:'Regole e dettagli della vista',owner:'epistemic-lattice',status:'Candidate'})
});

export const WORKBOOK_SUPERSESSIONS=Object.freeze([
  Object.freeze({id:'07_DOD:E-01',sourceRequirement:'Default domain = Decisions',status:'superseded',supersededBy:'PR102 product decision 2026-08-24',ratifiedRequirement:'Evidenze apre con Reticolo epistemico → Ricostruisci un elemento di lavoro → Decisioni e tracciabilità; tutti i percorsi sono chiusi di default.',reason:'Later explicit product decision; retained as a traceable contradiction instead of being silently counted as satisfied.'})
]);

const PROCEDURE_VALUE=Object.freeze({
  monitoring:'Riduce il lavoro manuale di sorveglianza e collega un cambiamento verificato ai requisiti o alle attività da riesaminare.',
  incidents:'Preserva una ricostruzione verificabile e rende espliciti fatti mancanti, decisioni e lavoro successivo.',
  objects:'Rende identificabili responsabilità, sistemi di origine e oggetti da collegare a requisiti, rischi ed evidenze.',
  coverage:'Rende visibili requisiti non coperti, mapping da verificare e decisioni di esclusione motivate.',
  actions:'Collega una carenza a un responsabile e rende verificabile il passaggio da lavoro eseguito a chiusura approvata.',
  risks:'Collega scenari, controlli e azioni senza trattare il rating come probabilità oggettiva o conclusione regolatoria.',
  assurance:'Riduce la duplicazione delle risposte e rende riutilizzabili evidenze e formulazioni già approvate nel loro perimetro.'
});
const PROCEDURE_BASIS=Object.freeze({monitoring:COMPLIANCE_BASIS.obligationToAssess,incidents:COMPLIANCE_BASIS.obligationToAssess,objects:COMPLIANCE_BASIS.organizationalNeed,coverage:COMPLIANCE_BASIS.identifiedObligation,actions:COMPLIANCE_BASIS.organizationalNeed,risks:COMPLIANCE_BASIS.organizationalNeed,assurance:COMPLIANCE_BASIS.organizationalNeed});
const procedureContract=id=>Object.freeze({...WORKBOOK_COPY[id],purpose:WORKBOOK_COPY[id].workspacePurpose,basis:PROCEDURE_BASIS[id],value:PROCEDURE_VALUE[id],entry:WORKBOOK_COPY[id].secondary});
export const PROCEDURE_COMPOSITION=Object.freeze({monitoring:procedureContract('monitoring'),incidents:procedureContract('incidents'),objects:procedureContract('objects'),coverage:procedureContract('coverage'),actions:procedureContract('actions'),risks:procedureContract('risks'),assurance:procedureContract('assurance')});

export const WORKSPACE_GRAMMAR=Object.freeze({
  catalogue:'heterogeneous-capability-matrix',records:'homogeneous-record-list',proof:'ratified-investigation-disclosures',epistemic:'search-filter-index-detail',technical:'progressive-disclosure',navigation:'single-column-content-sized'
});

export const SURFACE_BLUEPRINTS=Object.freeze({
  home:Object.freeze({root:'#homeView',kind:'work',title:WORKBOOK_COPY.home.surface,purpose:WORKBOOK_COPY.home.workspacePurpose,first:'attention',technicalDefault:false}),
  processes:Object.freeze({root:'#processesView',kind:'catalogue',title:'Processi di Compliance',purpose:'Scegli il processo in base al significato di compliance e al lavoro da governare: fonti, eventi, oggetti, requisiti, azioni, rischi o richieste di verifica.',first:'catalogue',grammar:WORKSPACE_GRAMMAR.catalogue,technicalDefault:false}),
  monitoring:Object.freeze({root:'#monitoringView',kind:'procedure',procedure:'monitoring',first:'work',technicalDefault:false}),
  incidents:Object.freeze({root:'#incidentsView',kind:'procedure',procedure:'incidents',first:'work',technicalDefault:false}),
  objects:Object.freeze({root:'#grcWorkspace',kind:'procedure',procedure:'objects',first:'work',technicalDefault:false}),
  coverage:Object.freeze({root:'#grcWorkspace',kind:'procedure',procedure:'coverage',first:'work',technicalDefault:false}),
  actions:Object.freeze({root:'#grcWorkspace',kind:'procedure',procedure:'actions',first:'work',technicalDefault:false}),
  risks:Object.freeze({root:'#grcWorkspace',kind:'procedure',procedure:'risks',first:'work',technicalDefault:false}),
  assurance:Object.freeze({root:'#grcWorkspace',kind:'procedure',procedure:'assurance',first:'work',technicalDefault:false}),
  proof:Object.freeze({root:'#proofView',kind:'evidence',title:WORKBOOK_COPY.proof.surface,purpose:WORKBOOK_COPY.proof.catalogueSummary,first:'epistemic-investigation',technicalDefault:false,workbookDefault:'decisions',ratifiedDefault:'epistemic-investigation'}),
  epistemic:Object.freeze({root:'#epistemicView',kind:'relationships',title:WORKBOOK_COPY.epistemic.surface,purpose:WORKBOOK_COPY.epistemic.workspacePurpose,first:'search',technicalDefault:false}),
  admin:Object.freeze({root:'#adminCenter',kind:'administration',title:'Amministrazione ICTC',purpose:'Gestisci configurazioni che cambiano accessi, uso AI, processi disponibili e controlli tecnici del runtime.',first:'attention',technicalDefault:false}),
  aiSettings:Object.freeze({root:'#settingsDialog',kind:'configuration',title:'Configurazione AI',purpose:'Definisci provider, modello e istruzioni che determinano egress e uso dell’AI; le decisioni restano umane.',first:'configuration',technicalDefault:false})
});

export const COMPOSITION_INVARIANTS=Object.freeze(['identity-one','purpose-one','operative-first','no-numeric-home-dashboard','no-tautology','one-primary-action','attention-before-metric','metric-with-decision','business-first','concrete-copy','why-bounded','action-consequence','evidence-near-decision','progressive-technical','disclosure-on-demand','homogeneous-record-list','heterogeneous-capability-matrix','empty-is-actionable','landing-not-manual','single-copy-owner','canonical-lexicon','regulatory-boundary','value-concrete','ratified-workbook-supersession-explicit']);

export const COMPOSITION_METRICS=Object.freeze({operationalReach:1,narrativeBeforeWorkMax:2,redundancyRatioMax:0.05,actionDensityMin:0.5,technicalLeakageMax:0,abstractCopyRateMax:0,decisionDistanceMax:1,progressiveDisclosureCompliance:1,canonicalVocabularyCoverage:1,identityConsistency:1,mutationKillRate:1,holdoutNewFamiliesMax:0,workbookRatifiedApplicationRate:1});
