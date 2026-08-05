const entry = (id, label, aliases = [], description = '') => Object.freeze({ id, label, aliases, description });

export const SEMANTIC_TAXONOMY = Object.freeze({
  frameworks: Object.freeze([
    entry('GDPR', 'GDPR', ['regolamento 2016/679', '2016/679', 'protezione dei dati'], 'Vocabolario relativo al Regolamento generale sulla protezione dei dati.'),
    entry('NIS2', 'NIS2', ['direttiva 2022/2555', '2022/2555', 'sicurezza delle reti'], 'Vocabolario relativo alla direttiva NIS2 e al suo recepimento.'),
    entry('DORA', 'DORA', ['regolamento 2022/2554', '2022/2554', 'resilienza operativa digitale'], 'Vocabolario relativo alla resilienza operativa digitale del settore finanziario.'),
    entry('CER', 'CER', ['direttiva 2022/2557', '2022/2557', 'resilienza soggetti critici']),
    entry('AI_ACT', 'AI Act', ['regolamento 2024/1689', '2024/1689', 'intelligenza artificiale']),
    entry('CRA', 'Cyber Resilience Act', ['regolamento 2024/2847', '2024/2847', 'prodotti con elementi digitali']),
    entry('EIDAS2', 'eIDAS 2', ['identità digitale europea', 'wallet identità digitale']),
    entry('WHISTLEBLOWING', 'Whistleblowing', ['direttiva 2019/1937', 'd.lgs. 24/2023', 'segnalazioni interne']),
    entry('DLGS_231', 'D.Lgs. 231/2001', ['231/2001', 'responsabilità amministrativa enti']),
    entry('ISO_27001', 'ISO/IEC 27001', ['iso 27001', 'sistema gestione sicurezza informazioni']),
    entry('ISO_22301', 'ISO 22301', ['business continuity', 'continuità operativa']),
    entry('OTHER_FRAMEWORK', 'Altro framework', [], 'Fallback estensibile: richiede verifica e denominazione umana.'),
    entry('UNKNOWN_FRAMEWORK', 'Framework non determinato', [], 'Nessuna inferenza sufficiente; non equivale ad assenza di disciplina.')
  ]),
  authorities: Object.freeze([
    entry('GARANTE', 'Garante per la protezione dei dati personali', ['garante privacy', 'gpdp']),
    entry('ACN', 'Agenzia per la cybersicurezza nazionale', ['agenzia cybersicurezza', 'csirt italia']),
    entry('AGID', 'Agenzia per l’Italia Digitale', ['agid']),
    entry('EUR_LEX', 'EUR-Lex', ['eur lex', 'gazzetta ufficiale unione europea']),
    entry('EU_COMMISSION', 'Commissione europea', ['commissione ue', 'european commission']),
    entry('EDPB', 'Comitato europeo per la protezione dei dati', ['edpb', 'cepd']),
    entry('ENISA', 'ENISA', ['agenzia ue cybersicurezza']),
    entry('PARLAMENTO_UE', 'Parlamento europeo', ['european parliament']),
    entry('CONSIGLIO_UE', 'Consiglio dell’Unione europea', ['council of the eu']),
    entry('GAZZETTA_UFFICIALE', 'Gazzetta Ufficiale della Repubblica Italiana', ['gazzetta ufficiale', 'guritel']),
    entry('PARLAMENTO_IT', 'Parlamento italiano', ['camera dei deputati', 'senato della repubblica']),
    entry('PRESIDENZA_CONSIGLIO', 'Presidenza del Consiglio dei ministri', ['pcm', 'governo italiano']),
    entry('MINISTERO', 'Ministero', ['ministero', 'dipartimento']),
    entry('BANCA_ITALIA', 'Banca d’Italia', ['banca d italia']),
    entry('IVASS', 'IVASS', ['istituto vigilanza assicurazioni']),
    entry('CONSOB', 'CONSOB', ['commissione nazionale società borsa']),
    entry('AGCM', 'Autorità garante della concorrenza e del mercato', ['agcm', 'antitrust']),
    entry('ANAC', 'Autorità nazionale anticorruzione', ['anac']),
    entry('OTHER_AUTHORITY', 'Altra autorità', [], 'Fallback estensibile: l’autorità deve essere verificata sul documento ufficiale.'),
    entry('UNKNOWN_AUTHORITY', 'Autorità non determinata')
  ]),
  instruments: Object.freeze([
    entry('REGULATION', 'Regolamento', ['regolamento ue', 'regulation']),
    entry('DIRECTIVE', 'Direttiva', ['direttiva ue', 'directive']),
    entry('DECISION', 'Decisione', ['decisione ue', 'decision']),
    entry('LAW', 'Legge', ['legge', 'l.']),
    entry('LEGISLATIVE_DECREE', 'Decreto legislativo', ['d.lgs.', 'decreto legislativo']),
    entry('LAW_DECREE', 'Decreto-legge', ['d.l.', 'decreto legge']),
    entry('DECREE', 'Decreto', ['d.m.', 'd.p.c.m.', 'decreto ministeriale']),
    entry('AUTHORITY_MEASURE', 'Provvedimento o delibera di autorità', ['provvedimento', 'delibera', 'determinazione']),
    entry('GUIDELINE', 'Linea guida', ['linee guida', 'guideline', 'raccomandazione']),
    entry('CIRCULAR', 'Circolare o comunicazione', ['circolare', 'comunicato', 'comunicazione']),
    entry('STANDARD', 'Norma tecnica o standard', ['standard', 'iso', 'cei', 'uni']),
    entry('CASE_LAW', 'Giurisprudenza', ['sentenza', 'ordinanza', 'decisione giudiziaria']),
    entry('CONSULTATION', 'Consultazione o proposta', ['consultazione', 'proposta', 'bozza']),
    entry('FAQ', 'FAQ o chiarimento operativo', ['faq', 'domande frequenti']),
    entry('OTHER_INSTRUMENT', 'Altro tipo di documento'),
    entry('UNKNOWN_INSTRUMENT', 'Tipo di documento non determinato')
  ]),
  topics: Object.freeze([
    entry('DATA_PROTECTION', 'Protezione dei dati', ['privacy', 'dati personali']),
    entry('CYBERSECURITY', 'Cybersicurezza', ['cybersecurity', 'sicurezza informatica']),
    entry('INCIDENT_REPORTING', 'Gestione e notifica incidenti', ['incidente', 'data breach', 'notifica']),
    entry('RISK_MANAGEMENT', 'Gestione del rischio', ['risk management', 'analisi del rischio']),
    entry('SUPPLY_CHAIN', 'Fornitori e supply chain', ['fornitore', 'terza parte', 'supply chain']),
    entry('GOVERNANCE', 'Governance e responsabilità', ['governance', 'responsabilità', 'organo amministrativo']),
    entry('BUSINESS_CONTINUITY', 'Continuità operativa', ['business continuity', 'disaster recovery']),
    entry('IDENTITY_ACCESS', 'Identità e controllo accessi', ['identità', 'autenticazione', 'accesso']),
    entry('CLOUD', 'Cloud e infrastrutture', ['cloud', 'data center', 'infrastruttura']),
    entry('AI_GOVERNANCE', 'Governance dell’AI', ['intelligenza artificiale', 'modello ai', 'sistema ai']),
    entry('WHISTLEBLOWING', 'Segnalazioni e whistleblowing', ['segnalazione', 'whistleblower']),
    entry('RECORDS_EVIDENCE', 'Registrazioni ed evidenze', ['registro', 'evidenza', 'conservazione']),
    entry('TRAINING_AWARENESS', 'Formazione e consapevolezza', ['formazione', 'awareness']),
    entry('OTHER_TOPIC', 'Altro tema'),
    entry('UNKNOWN_TOPIC', 'Tema non determinato')
  ]),
  lifecycle: Object.freeze([
    entry('PROPOSED', 'Proposta o bozza', ['proposta', 'bozza', 'consultazione']),
    entry('ADOPTED', 'Adottato o pubblicato', ['adottato', 'pubblicato']),
    entry('IN_FORCE', 'In vigore', ['in vigore', 'applicabile dal']),
    entry('AMENDED', 'Modificato o aggiornato', ['modifica', 'aggiornamento', 'rettifica']),
    entry('REPEALED', 'Abrogato o superato', ['abrogato', 'sostituito', 'superato']),
    entry('UNKNOWN_LIFECYCLE', 'Stato del ciclo di vita non determinato')
  ]),
  jurisdictions: Object.freeze([
    entry('EU', 'Unione europea', ['ue', 'european union']),
    entry('ITALY', 'Italia', ['italia', 'italiano']),
    entry('EEA', 'Spazio economico europeo', ['see', 'eea']),
    entry('INTERNATIONAL', 'Internazionale', ['internazionale', 'global']),
    entry('OTHER_JURISDICTION', 'Altra giurisdizione'),
    entry('UNKNOWN_JURISDICTION', 'Giurisdizione non determinata')
  ])
});

export const JOB_TEMPLATES = Object.freeze([
  Object.freeze({
    id: 'privacy-authorities', title: 'Privacy · autorità e linee guida',
    description: 'Sorveglia pubblicazioni ufficiali di GARANTE, EDPB e Commissione europea. Il template non determina applicabilità.',
    objective: 'Rilevare nuove pubblicazioni e modifiche ufficiali in materia di protezione dei dati.',
    cadenceHours: 24, miningMode: 'new-and-changed', officialOnly: true,
    labels: { frameworks: ['GDPR'], authorities: ['GARANTE', 'EDPB', 'EU_COMMISSION'], topics: ['DATA_PROTECTION'] }
  }),
  Object.freeze({
    id: 'nis2-acn', title: 'NIS2 · ACN e recepimento italiano',
    description: 'Rileva novità ufficiali ACN, atti di recepimento e chiarimenti operativi; richiede valutazione umana del perimetro.',
    objective: 'Monitorare fonti ufficiali relative a NIS2, cybersicurezza e gestione degli incidenti.',
    cadenceHours: 24, miningMode: 'new-and-changed', officialOnly: true,
    labels: { frameworks: ['NIS2'], authorities: ['ACN', 'GAZZETTA_UFFICIALE'], topics: ['CYBERSECURITY', 'INCIDENT_REPORTING'] }
  }),
  Object.freeze({
    id: 'digital-resilience', title: 'Resilienza digitale · DORA, CRA e supply chain',
    description: 'Template trasversale per novità e modifiche; non sostituisce la selezione del settore e dei soggetti coinvolti.',
    objective: 'Rilevare atti e orientamenti ufficiali su resilienza operativa, prodotti digitali e fornitori.',
    cadenceHours: 168, miningMode: 'new-and-changed', officialOnly: true,
    labels: { frameworks: ['DORA', 'CRA'], topics: ['RISK_MANAGEMENT', 'SUPPLY_CHAIN', 'BUSINESS_CONTINUITY'] }
  })
]);

export const FIRST_RUN_GUIDE = Object.freeze({
  title: 'ICTC trasforma fonti e racconti in fascicoli verificabili',
  description: 'Il primo avvio non contiene dati dimostrativi. Le card seguenti descrivono capacità reali e indicano il primo passo utile.',
  steps: Object.freeze([
    Object.freeze({ id: 'configure', title: '1 · Definisci il perimetro', description: 'Configura organizzazione, provider AI, budget e modelli consentiti. La chiave resta in una variabile d’ambiente.' }),
    Object.freeze({ id: 'job', title: '2 · Crea un job di monitoraggio', description: 'Scegli obiettivo, frequenza, finestra, fonti, etichette e politica di mining. L’AI propone il piano; una persona lo attiva.' }),
    Object.freeze({ id: 'intake', title: '3 · Aggiungi conoscenza', description: 'Usa un solo ingresso per link, testo e documenti. L’originale viene preservato prima dell’arricchimento.' }),
    Object.freeze({ id: 'decide', title: '4 · Verifica e decidi', description: 'Fonti, etichette e formulazioni AI restano proposte finché una persona non le adotta, corregge o scarta.' })
  ]),
  boundaries: Object.freeze([
    'Un’etichetta indica una corrispondenza lessicale o una proposta, non applicabilità giuridica.',
    'Il reticolo semantico rappresenta collegamenti registrati dal runtime, non una verità ontologica completa.',
    'ICTC non decide conformità, significatività o obblighi di notifica.'
  ])
});

export function taxonomyCatalog() {
  return Object.fromEntries(Object.entries(SEMANTIC_TAXONOMY).map(([dimension, values]) => [dimension, values.map(({ id, label, description }) => ({ id, label, description }))]));
}
