const PHASES=Object.freeze([
  {id:'observe-scope',label:'1. Osserva & delimita',description:'Capisci cosa cambia e qual è il perimetro reale su cui lavori.',processIds:['monitoring','objects']},
  {id:'assess-map',label:'2. Valuta & collega',description:'Collega requisiti, oggetti e rischi mantenendo distinti gap, limiti e decisioni.',processIds:['coverage','risks']},
  {id:'act-respond',label:'3. Agisci & rispondi',description:'Trasforma decisioni, gap ed eventi in lavoro assegnato e verificabile.',processIds:['actions','incidents']},
  {id:'assure-prove',label:'4. Assicura & dimostra',description:'Prepara risposte bounded e ricostruisci ciò che ICTC può realmente provare.',processIds:['assurance','evidence']}
]);
const PURPOSE=Object.freeze({
  monitoring:'Sorveglia fonti e cambiamenti, poi registra una decisione umana sulla loro rilevanza operativa.',
  objects:'Mantieni il registro governato di sistemi, servizi, dati, terze parti, policy e controlli.',
  coverage:'Dichiara il perimetro, collega requisiti e controlli e separa coperto, gap, N.A. e irrisolto.',
  risks:'Registra scenari e usa solo valutazioni umane nel portafoglio e nella heatmap.',
  actions:'Trasforma gap, rischi e finding in remediation persistente con owner, scadenza e verifica.',
  incidents:'Preserva i fatti, completa il fascicolo e collega eventuali remediation senza classificazione automatica.',
  assurance:'Preserva richieste e questionari, prepara risposte e approva solo ciò che una persona ha verificato.',
  evidence:'Ricostruisci provenienza, decisioni, receipt, limiti e readiness senza sintetizzare conformità.'
});
const PROOF=Object.freeze({
  monitoring:'Fonte/versione + decisione + receipt + dossier',objects:'Versione oggetto + review + relazioni + dossier',coverage:'Requisito + mapping + decisione + evidence refs',risks:'Scenario + proposta separata + rating umano + dossier',actions:'Origine + adozione + aggiornamenti + evidence',incidents:'Originale + allegati + versioni + submission/closure',assurance:'Richiesta originale + draft + approvazione + evidence',evidence:'Trace/evidence same-as-read + limiti'
});
function countFor(items,processId){return (items||[]).filter(item=>item.processId===processId).length;}
function guideFor(work,processId){return (work?.procedures||[]).find(item=>item.processId===processId)||{};}
function projectItem(proc,work,reviewInbox){const guide=guideFor(work,proc.id);return{schemaVersion:'4.0.0',processId:proc.id,processCode:proc.code,label:proc.label,description:proc.description,purpose:PURPOSE[proc.id]||proc.description,attentionCount:Number(proc.attentionCount||0),metrics:(proc.metrics||[]).slice(0,2),workCount:countFor(work?.queue?.items,proc.id),reviewCount:countFor(reviewInbox?.items,proc.id),readOnly:Boolean(proc.readOnly),checkpoint:guide.checkpoint||null,entry:guide.entry||null,proofHint:PROOF[proc.id]||'Receipt + dossier',aiOptional:proc.id!=='evidence',supportSurface:proc.kind==='assurance'||proc.id==='evidence',actionLabel:proc.readOnly?'Consulta procedura':'Apri procedura'};}
export function processLandscapeProjection({procedures=[],work={},reviewInbox={}}={}){const byId=new Map(procedures.map(item=>[item.id,item]));const seen=new Set();const phases=PHASES.map(phase=>({...phase,items:phase.processIds.map(id=>byId.get(id)).filter(Boolean).map(proc=>{seen.add(proc.id);return projectItem(proc,work,reviewInbox);})}));const ungrouped=procedures.filter(proc=>!seen.has(proc.id)&&proc.id!=='administration').map(proc=>projectItem(proc,work,reviewInbox));const businessItems=phases.flatMap(p=>p.items).filter(item=>!item.supportSurface&&item.processId!=='evidence');return{schemaVersion:'4.0.0',authority:'runtime-process-landscape-projection',perspective:'process-centric',phases,ungrouped,counts:{businessProcesses:businessItems.length,visibleProcesses:phases.flatMap(p=>p.items).length+ungrouped.length,attention:phases.flatMap(p=>p.items).reduce((n,x)=>n+x.attentionCount,0),humanReviews:phases.flatMap(p=>p.items).reduce((n,x)=>n+x.reviewCount,0)},limitations:['Le fasi sono una chiave di lettura UX e non una nuova ontologia o sequenza obbligatoria.','La mappa riusa stati e checkpoint delle projection canoniche; non determina applicabilità o conformità.']};}
export { PHASES };
