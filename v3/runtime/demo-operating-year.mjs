export const DEMO_OPERATING_YEAR_SCHEMA_VERSION='1.1.1';
export const DEMO_COMPANY_CONTEXT=Object.freeze({
  name:'Meccanica Selene S.r.l. · DEMO',
  legalForm:'S.r.l.',
  region:'Emilia-Romagna',
  employees:84,
  sites:Object.freeze(['Stabilimento Reggio Emilia','Ufficio commerciale Parma']),
  business:'componentistica meccanica B2B, lavorazioni conto terzi e assistenza tecnica post-vendita',
  jurisdictions:Object.freeze(['Italia','Unione europea']),
  sectors:Object.freeze(['manifatturiero B2B','servizi industriali']),
  technology:Object.freeze(['Microsoft 365','ERP cloud','MES locale','portale clienti B2B','VPN manutentori','backup locale + cloud']),
  governance:Object.freeze({
    operatingModel:'PMI senza funzione GRC dedicata: coordinamento Compliance/Qualità con IT interno e MSP esterno.',
    roles:Object.freeze(['Responsabile Compliance/Qualità','Responsabile IT','Responsabile Produzione','Responsabile Acquisti','Responsabile HR','Direzione']),
    cadence:Object.freeze({regulatoryTriage:'mensile',incidentReview:'settimanale su necessità',inventoryReview:'trimestrale',mappingReview:'trimestrale',actionReview:'mensile',supplierReview:'annuale',restoreTest:'semestrale'}),
    constraints:Object.freeze(['nessun team GRC dedicato','capacità IT interna limitata','dipendenza da fornitori per infrastruttura e MES','picchi produttivi che possono rinviare attività non urgenti'])
  }),
  operatingYear:Object.freeze({
    start:'2025-07-01',
    end:'2026-06-30',
    referenceDate:'2026-06-30',
    phases:Object.freeze([
      Object.freeze({id:'Q1',months:Object.freeze([7,8,9]),label:'Avvio e baseline',context:'Configurazione ICTC, primo perimetro AO, fonti RN e backlog iniziale.'}),
      Object.freeze({id:'Q2',months:Object.freeze([10,11,12]),label:'Stabilizzazione',context:'Primi riesami, incidenti operativi, mapping prioritari e azioni adottate.'}),
      Object.freeze({id:'Q3',months:Object.freeze([1,2,3]),label:'Uso ordinario',context:'Routine di triage, fornitori, verifiche evidenza e casi cliente.'}),
      Object.freeze({id:'Q4',months:Object.freeze([4,5,6]),label:'Riesame annuale',context:'Riattestazioni, restore test, chiusure verificate e backlog per anno successivo.'})
    ]),
    milestones:Object.freeze([
      Object.freeze({at:'2025-07-08',label:'Baseline iniziale inventario e owner'}),
      Object.freeze({at:'2025-09-18',label:'Prima revisione trimestrale AO/MC'}),
      Object.freeze({at:'2025-11-12',label:'Questionario cliente strategico e raccolta evidenze'}),
      Object.freeze({at:'2026-01-20',label:'Riesame accessi privilegiati e fornitori'}),
      Object.freeze({at:'2026-03-10',label:'Verifica patch MES e accessi manutentori'}),
      Object.freeze({at:'2026-05-21',label:'Restore test e riesame continuità'}),
      Object.freeze({at:'2026-06-24',label:'Riesame annuale ICTC e backlog anno 2'})
    ])
  })
});

export const PROCEDURE_CHALLENGE_QUESTIONS=Object.freeze({
  monitoring:Object.freeze({
    ontologyPositive:Object.freeze(['L’oggetto è una fonte/osservazione pubblica appartenente a una delle quattro classi RN?', 'Togliendo il tema aziendale resta comunque una fonte pubblica con identità e provenienza proprie?', 'La fonte può esistere senza che esista ancora una decisione di applicabilità?']),
    ontologyNegative:Object.freeze(['Sto tentando di inserire una policy interna, una release note vendor, un requisito cliente o un fatto operativo?', 'La classificazione dipende soltanto da sourceClass o da una label AI?', 'Il record sarebbe più correttamente un caso EC, un oggetto AO, un concetto MC o un impegno AP?']),
    epistemicPositive:Object.freeze(['Quale evidenza indipendente sostiene classe, autorità e riferimento ricostruibile?', 'Che cosa è osservato, che cosa è proposto dall’AI e che cosa è stato verificato da una persona?', 'Per giurisprudenza/casi è registrata la verifica di assenza di dati personali prima della verifica della fonte?']),
    epistemicNegative:Object.freeze(['Sto confondendo fonte osservata con norma applicabile?', 'Una percentuale/confidenza AI sta sostituendo una decisione umana?', 'Una vecchia verifica è rimasta valida dopo una nuova osservazione?'])
  }),
  incidents:Object.freeze({
    ontologyPositive:Object.freeze(['Esiste un accadimento o quasi-accadimento con narrativa originale e tempo di consapevolezza?', 'Il caso rimane riconoscibile anche separando classificazione, ipotesi e azioni successive?', 'Una informazione ancora ignota può restare ignota senza inventare un fatto?']),
    ontologyNegative:Object.freeze(['Sto registrando un rischio futuro, una remediation o una conclusione legale come se fossero il fatto?', 'La formulazione finale ha sostituito o riscritto la narrativa originale?', 'Il semplice collegamento a un’azione sta trasformando il caso in AP?']),
    epistemicPositive:Object.freeze(['Quali frasi sono fatti confermati, quali unknown, quali ipotesi e quali suggerimenti AI?', 'Qual è la singola informazione successiva che cambia materialmente la decidibilità del caso?', 'La chiusura spiega perché il fascicolo può terminare anche se esiste lavoro downstream?']),
    epistemicNegative:Object.freeze(['Severità operativa viene trattata come obbligo di notifica?', 'Una bozza AI è stata adottata senza correzione/conferma?', 'Un handoff viene interpretato come decisione già presa nell’altro processo?'])
  }),
  objects:Object.freeze({
    ontologyPositive:Object.freeze(['Tolti allegati e claim, resta una identità organizzativa stabile che merita owner e fonte autorevole?', 'L’oggetto ha un confine operativo utile per decisioni, dipendenze e riattestazione?', 'Il livello di granularità è quello minimo necessario alla governance, non una replica della CMDB?']),
    ontologyNegative:Object.freeze(['Sto inventariando un file, uno screenshot, una evidenza, un requisito normativo o un claim di efficacia?', 'Sto creando un oggetto solo perché esiste una riga in una sorgente esterna?', 'Due record AO rappresentano in realtà la stessa identità a granularità diverse senza una ragione di governance?']),
    epistemicPositive:Object.freeze(['Quale fonte autorevole sostiene identità e attributi?', 'Chi è responsabile del record e su quale versione sta attestando?', 'Quali attributi sono dichiarati, quali derivati e quali ancora da verificare?']),
    epistemicNegative:Object.freeze(['Active viene letto come esistente/completo nel mondo reale?', 'Una evidenza allegata viene letta come prova di efficacia?', 'La riattestazione precedente è rimasta valida dopo una modifica materiale della versione?'])
  }),
  coverage:Object.freeze({
    ontologyPositive:Object.freeze(['L’oggetto è un concetto normativo/framework dichiarato, non il testo sorgente né un controllo operativo?', 'L’atomo minimo conserva reference, concept, intent, expected outcome, evidence question, scope, source authority e version?', 'Il mapping collega concetti a supporti senza fondere le identità dei due lati?']),
    ontologyNegative:Object.freeze(['Sto duplicando un oggetto AO o una azione AP dentro MC?', 'Sto copiando testo licenziato o normativo oltre quanto serve alla rappresentazione minima?', 'Un crosswalk viene trattato come equivalenza normativa?']),
    epistemicPositive:Object.freeze(['Quale decisione di scope è stata presa e con quale rationale?', 'Il mapping è mapped, gap, rejected o ancora proposto e perché?', 'Quale evidenza/oggetto sostiene il mapping senza provarne automaticamente l’efficacia?']),
    epistemicNegative:Object.freeze(['Tracked viene letto come legalmente applicabile?', 'Mapped viene letto come effective/compliant?', 'Una percentuale di coverage sta sostituendo decisioni discrete e gap espliciti?'])
  }),
  actions:Object.freeze({
    ontologyPositive:Object.freeze(['Esiste un impegno operativo adottabile con origine ricostruibile ed esito atteso verificabile?', 'L’azione rimane distinta dal finding/risk/evento che l’ha originata?', 'La cancellazione è un esito terminale sensato senza simulare remediation?']),
    ontologyNegative:Object.freeze(['Sto memorizzando il finding, il rischio o l’incidente stesso come azione?', 'Una proposta non adottata viene trattata come impegno già assegnato?', 'Legacy done viene trattato come closed?']),
    epistemicPositive:Object.freeze(['Chi ha adottato priorità, owner e scadenza e con quale motivo?', 'Quale evidenza sostiene il completamento operativo?', 'Chi ha verificato il risultato atteso e con quale evidenza/motivazione?']),
    epistemicNegative:Object.freeze(['La priorità viene letta come conclusione legale?', 'Il completamento viene letto come chiusura verificata?', 'La decisione del processo origine viene trasferita automaticamente all’azione?'])
  })
});

const AO_YEAR_ONE_INDEX=new Set([
  ...Array.from({length:12},(_,i)=>i),
  ...Array.from({length:8},(_,i)=>30+i),
  ...Array.from({length:6},(_,i)=>45+i),
  ...Array.from({length:6},(_,i)=>55+i),
  ...Array.from({length:5},(_,i)=>65+i),
  ...Array.from({length:5},(_,i)=>70+i),
  ...Array.from({length:4},(_,i)=>75+i),
  ...Array.from({length:4},(_,i)=>80+i),
  ...Array.from({length:3},(_,i)=>85+i),
  ...Array.from({length:4},(_,i)=>90+i),
  ...Array.from({length:3},(_,i)=>95+i)
]);
export const YEAR_ONE_EXPECTED_COUNTS=Object.freeze({monitoring:8,incidents:17,objects:60,coverage:34,actions:25,risks:20,assurance:13});
export const YEAR_ONE_SELECTION_RATIONALE=Object.freeze({
  monitoring:'Otto configurazioni di monitoraggio: due esempi per ciascuna delle quattro classi RN; le fonti scoperte non sono contate come nuove missioni.',
  incidents:'Diciassette casi in dodici mesi, includendo incidenti, quasi incidenti e osservazioni: abbastanza per mostrare maturità senza simulare un flusso industriale anomalo.',
  objects:'Sessanta identità ad alta granularità di governance, non una replica della CMDB e senza requisiti normativi nel cohort positivo.',
  coverage:'Trentaquattro decisioni di mapping distribuite fra mapped, gap, proposte e rifiuti; i concetti normativi non sono moltiplicati per riempire il registro.',
  actions:'Venticinque impegni di remediation/governance: una parte nasce da handoff, una parte da decisioni gestionali native, con completion distinta da closure.',
  risks:'Venti scenari di rischio sintetici per il contesto annuale esteso; RC resta regression-only nel fine-tuning delle cinque app.',
  assurance:'Tredici casi di assurance/questionario sintetici; AR resta regression-only nel fine-tuning delle cinque app.'
});
export function isOperatingYearRecord(procedureId,record,index){
  if(procedureId==='objects')return AO_YEAR_ONE_INDEX.has(index)&&record?.type!=='requirement';
  if(procedureId==='monitoring')return index%13===0;
  if(procedureId==='incidents')return index===0||(index%6===1&&index<97);
  if(procedureId==='coverage')return index%3===0;
  if(procedureId==='actions')return index%4===0;
  if(procedureId==='risks')return index%5===0;
  if(procedureId==='assurance')return index%8===0;
  return false;
}
const monthForIndex=(procedureId,index)=>1+((index*7+procedureId.length*3)%12);
function phaseForMonth(month){const normalized=month>=7?month:month+12;if(normalized<=9)return'Q1';if(normalized<=12)return'Q2';if(normalized<=15)return'Q3';return'Q4';}
function dateForMonth(month,index){const year=month>=7?2025:2026;const day=5+((index*11)%21);return`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;}
export function operatingYearContext(procedureId,record,index){if(procedureId==='objects'&&record?.attributes&&Object.prototype.hasOwnProperty.call(record.attributes,'company'))record.attributes.company=DEMO_COMPANY_CONTEXT.name;const showcase=isOperatingYearRecord(procedureId,record,index),month=monthForIndex(procedureId,index),phase=phaseForMonth(month);return Object.freeze({schemaVersion:DEMO_OPERATING_YEAR_SCHEMA_VERSION,id:'meccanica-selene-year-one',cohort:showcase?'operating-year':'stress-corpus',showcase,month,phase,contextDate:dateForMonth(month,index),referenceDate:DEMO_COMPANY_CONTEXT.operatingYear.referenceDate,company:DEMO_COMPANY_CONTEXT.name,stressOnly:!showcase,selectionRationale:YEAR_ONE_SELECTION_RATIONALE[procedureId]||'Cohort sintetico di contesto.',claimBoundary:showcase?'Record sintetico plausibile nel racconto di un anno di uso; non prova che una PMI reale produrrebbe esattamente questo record.':'Fixture sintetica di stress: utile alla falsificazione, non deve essere presentata come esempio positivo di adozione o copertura.'});}

export const YEAR_ONE_DOD=Object.freeze({
  durationMonths:12,
  companyNameMustReplaceLegacy:true,
  selectedProcedures:Object.freeze(['monitoring','incidents','objects','coverage','actions']),
  expectedShowcaseCounts:YEAR_ONE_EXPECTED_COUNTS,
  rules:Object.freeze([
    'operating-year and stress-corpus are explicitly separated',
    'showcase density follows the cadence and ontology of each procedure rather than a uniform table percentage',
    'all 12 months and all four phases are represented across the selected five procedures',
    'AO operating-year contains no requirement objects and no evidence-only pseudo objects',
    'AO operating-year is materially smaller than the 100-record stress corpus',
    'EC does not create an AP handoff for every case',
    'cross references are sparse enough to remain explanatory rather than becoming a shared lifecycle',
    'every selected process contains positive and negative ontology and epistemic questions',
    'no positive exemplar relies on a procedure label as its discriminator',
    'stress-only records are not counted as positive adoption or coverage evidence',
    'terminal negative states remain represented',
    'year-one context never establishes legal applicability, compliance, effectiveness or independent assurance'
  ]),
  thresholds:Object.freeze({maxIncidentToActionLinkRatio:0.5,maxCrossReferenceRatio:0.65,minStateKindsPerStatefulProcess:3,minOperatingYearAoActiveRatio:0.55,maxOperatingYearAoActiveRatio:0.9})
});
