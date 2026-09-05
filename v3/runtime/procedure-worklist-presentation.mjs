const BUSINESS_IDS=Object.freeze(['monitoring','incidents','objects','coverage','actions','risks','assurance']);
const BUSINESS_SET=new Set(BUSINESS_IDS);

const text=(value,fallback='')=>String(value??fallback).trim();
const humanize=value=>text(value).replaceAll('-',' ').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
const safeSituation=(value,fallback='Da esaminare')=>text(value)||fallback;

function target(procedureId,subjectType,subjectId,intendedAction,context={}){
  if(!BUSINESS_SET.has(procedureId))throw new Error(`Presentation target procedure not canonical: ${procedureId}`);
  if(!text(subjectType)||!text(subjectId)||!text(intendedAction))throw new Error('Typed target requires subjectType, subjectId and intendedAction');
  return Object.freeze({procedureId,subjectType:text(subjectType),subjectId:text(subjectId),intendedAction:text(intendedAction),context:Object.freeze({...context})});
}
function facet(key,label,value,valueLabel){
  if(!text(key)||!text(label)||!text(value))throw new Error('Local facet requires key, label and value');
  return Object.freeze({key:text(key),label:text(label),value:text(value),valueLabel:text(valueLabel,humanize(value))});
}
function presentation({kindLabel,situationLabel,actionLabel,targetRef,facets=[]}={}){
  if(!text(kindLabel)||!text(situationLabel))throw new Error('Business presentation requires kindLabel and situationLabel');
  if(targetRef&&!text(actionLabel))throw new Error('Actionable business presentation requires actionLabel');
  const seen=new Set();
  for(const local of facets){if(seen.has(local.key))throw new Error(`Duplicate local facet ${local.key}`);seen.add(local.key);}
  return Object.freeze({kindLabel:text(kindLabel),situationLabel:text(situationLabel),actionLabel:text(actionLabel),targetRef:targetRef||null,facets:Object.freeze([...facets])});
}
function rowId(row,prefix=''){
  const id=text(row?.id);return prefix&&id.startsWith(prefix)?id.slice(prefix.length):id;
}
function readonly(actor,row){return actor?.role==='auditor'||row?.canAct===false;}
function action(row,actor,fallback='Apri dettaglio'){return readonly(actor,row)?'inspect-record':text(row?.primaryAction,'inspect-record')||'inspect-record';}

const RN_STATE=Object.freeze({'needs-plan':'Piano da completare',draft:'Piano in bozza',paused:'Monitoraggio sospeso',active:'Monitoraggio attivo',candidate:'Fonte da verificare',verified:'Impatto da valutare',rejected:'Fonte esclusa',superseded:'Fonte superata',failed:'Controllo fallito'});
function monitoring(row,{state,actor}){
  const id=text(row.id),kind=row.kind,rawId=kind==='mission'?rowId(row,'mission:'):kind==='source'?rowId(row,'source:'):kind==='run'?rowId(row,'run:'):rowId(row);
  const kindLabel=kind==='mission'?'Monitoraggio':kind==='source'?'Fonte':kind==='run'?'Esecuzione':'Elemento di monitoraggio';
  const situation=safeSituation(RN_STATE[row.state]);
  const labels=Object.freeze({'complete-plan':'Completa piano','review-source':'Verifica fonte','assess-impact':'Valuta impatto','inspect-failed-run':'Esamina esecuzione','inspect-record':'Apri dettaglio'});
  const intended=action(row,actor);const actionLabel=labels[intended]||'Apri dettaglio';
  const context={};
  if(kind==='run'){
    const run=(state?.runs||[]).find(x=>String(x.id)===rawId);if(run?.missionId)context.missionId=String(run.missionId);
  }
  return presentation({kindLabel,situationLabel:situation,actionLabel,targetRef:target('monitoring',kind||'record',rawId,intended,context),facets:[facet('work-type','Tipo di lavoro',kind||'record',kindLabel)]});
}

const EC_STATE=Object.freeze({draft:'Da chiarire',intake:'Da chiarire',review:'Da verificare',submitted:'Inviata · da seguire',closed:'Chiusa'});
function incidents(row,{actor}){
  const eventKind=text(row.facets?.eventKind,'incident'),kindLabel=eventKind==='near-miss'?'Near miss':'Segnalazione',intended=action(row,actor),actionLabel=intended==='inspect-record'?'Apri dettaglio':'Apri fascicolo';
  return presentation({kindLabel,situationLabel:safeSituation(EC_STATE[row.state]),actionLabel,targetRef:target('incidents','incident',rowId(row),intended),facets:[facet('event-kind','Tipo di evento',eventKind,eventKind==='near-miss'?'Near miss':'Incidente')]});
}

const AO_STATE=Object.freeze({candidate:'Da validare',active:'Attivo · riesame dovuto',rejected:'Escluso',retired:'Ritirato'});
function objects(row,{actor}){
  const intended=action(row,actor),labels=Object.freeze({'review-object':'Valida oggetto','reattest-object':'Riesamina oggetto','inspect-record':'Apri dettaglio'}),type=text(row.facets?.type,'object');
  return presentation({kindLabel:'Oggetto',situationLabel:safeSituation(AO_STATE[row.state]),actionLabel:labels[intended]||'Apri dettaglio',targetRef:target('objects','object',rowId(row),intended),facets:[facet('object-type','Tipo di oggetto',type,humanize(type))]});
}

const MC_STATE=Object.freeze({undeclared:'Uso da dichiarare',reference:'Usato come riferimento',applicable:'Nel perimetro',unknown:'Applicabilità da decidere',deferred:'Decisione rinviata','not-applicable':'Fuori perimetro',proposed:'Mapping da decidere',gap:'Gap da gestire',mapped:'Mappato',rejected:'Escluso'});
function coverage(row,{state,actor}){
  const kind=row.kind,id=text(row.id),subjectId=kind==='standard'?rowId(row,'standard:'):kind==='requirement-scope'?rowId(row,'scope:'):kind==='mapping'?rowId(row,'mapping:'):rowId(row),kindLabel=kind==='standard'?'Standard':kind==='requirement-scope'?'Requisito':kind==='mapping'?'Mapping':'Elemento di copertura';
  const intended=action(row,actor),labels=Object.freeze({'decide-standard-use':'Decidi utilizzo','decide-requirement-scope':'Decidi applicabilità','resolve-gap':'Gestisci gap','review-mapping':'Decidi mapping','inspect-record':'Apri dettaglio'}),context={};
  if(kind==='requirement-scope'){
    const record=(state?.requirementScopes||[]).find(x=>String(x.id)===subjectId);const binding=record?.binding||{};
    if(binding.frameworkId)context.frameworkId=String(binding.frameworkId);if(binding.nodeId)context.nodeId=String(binding.nodeId);if(record?.requirementRef)context.requirementRef=String(record.requirementRef);
  }
  return presentation({kindLabel,situationLabel:safeSituation(MC_STATE[row.state]),actionLabel:labels[intended]||'Apri dettaglio',targetRef:target('coverage',kind||'record',subjectId,intended,context),facets:[facet('decision-area','Ambito della decisione',kind||'record',kindLabel)]});
}

const AP_STATE=Object.freeze({proposed:'Da adottare',open:'Da avviare','in-progress':'In lavorazione',blocked:'Bloccata','ready-for-review':'Da verificare',closed:'Chiusa',cancelled:'Annullata'});
function actions(row,{actor}){
  const intended=action(row,actor),labels=Object.freeze({'adopt-action':'Adotta azione','progress-action':'Continua lavoro','verify-action':'Verifica risultato','inspect-record':'Apri dettaglio'}),priority=text(row.facets?.priority,'normal');
  return presentation({kindLabel:'Azione',situationLabel:safeSituation(AP_STATE[row.state]),actionLabel:labels[intended]||'Apri dettaglio',targetRef:target('actions','action',rowId(row),intended),facets:[facet('priority','Priorità',priority,priority==='normal'?'Non classificata':/^\d+$/.test(priority)?`P${priority}`:humanize(priority))]});
}

const RC_STATE=Object.freeze({unreviewed:'Da valutare','review-due':'Riesame dovuto',treated:'Trattamento corrente',accepted:'Accettato',open:'Trattamento da decidere'});
function risks(row,{actor}){
  const intended=action(row,actor),labels=Object.freeze({'review-risk':'Valuta rischio','decide-treatment':'Decidi trattamento','inspect-record':'Apri dettaglio'}),band=text(row.facets?.band,'unreviewed'),bandLabel=Object.freeze({unreviewed:'Non valutato',low:'Basso',medium:'Medio',high:'Alto',critical:'Critico'})[band]||humanize(band);
  let situation=RC_STATE[row.state];if(!situation&&intended==='decide-treatment')situation='Trattamento da decidere';
  return presentation({kindLabel:'Rischio',situationLabel:safeSituation(situation),actionLabel:labels[intended]||'Apri dettaglio',targetRef:target('risks','risk',rowId(row),intended),facets:[facet('risk-band','Fascia di rischio',band,bandLabel)]});
}

const AR_STATE=Object.freeze({intake:'Bozza da preparare',review:'Risposte da approvare',approved:'Approvata','review-needed':'Riesame richiesto'});
function assurance(row,{actor}){
  const intended=action(row,actor),labels=Object.freeze({'draft-response':'Prepara risposta','review-response':'Rivedi risposta','inspect-record':'Apri dettaglio'}),source=text(row.facets?.source,'unspecified');
  return presentation({kindLabel:'Richiesta',situationLabel:safeSituation(AR_STATE[row.state]),actionLabel:labels[intended]||'Apri dettaglio',targetRef:target('assurance','assurance-case',rowId(row),intended),facets:[facet('source','Origine richiesta',source,source==='unspecified'?'Non indicata':source)]});
}

const PRESENTERS=Object.freeze({monitoring,incidents,objects,coverage,actions,risks,assurance});
export function procedureWorklistPresentationIds(){return Object.freeze([...BUSINESS_IDS]);}
export function presentProcedureWorklist(procedure,state,actor={role:'admin'}){
  const fn=PRESENTERS[procedure?.id];if(!fn)throw new Error(`Presentation provider missing: ${procedure?.id||'unknown'}`);
  const presentRow=row=>Object.freeze({...row,presentation:fn(row,{state,actor})});
  const rows=(procedure.rows||[]).map(presentRow),allRows=(procedure.allRows||[]).map(presentRow),facetMap=new Map();
  for(const row of allRows)for(const local of row.presentation.facets){let entry=facetMap.get(local.key);if(!entry){entry={key:local.key,label:local.label,values:new Map()};facetMap.set(local.key,entry);}if(entry.label!==local.label)throw new Error(`${procedure.id}: local facet label drift for ${local.key}`);entry.values.set(local.value,local.valueLabel);}
  const presentationFacets=[...facetMap.values()].map(entry=>Object.freeze({key:entry.key,label:entry.label,values:Object.freeze([...entry.values].map(([value,label])=>Object.freeze({value,label})).sort((a,b)=>a.label.localeCompare(b.label)))}));
  return Object.freeze({...procedure,rows:Object.freeze(rows),allRows:Object.freeze(allRows),presentationFacets:Object.freeze(presentationFacets),presentationPolicy:Object.freeze({businessVocabularyOwner:`procedure:${procedure.id}`,sharedBusinessVocabulary:false,typedTargets:true,localFacets:true,rawRuntimeVocabularyDefault:false})});
}
export function procedureWorklistPresentationProjection(worklists,state,actor={role:'admin'}){
  const procedures=(worklists?.procedures||[]).map(item=>presentProcedureWorklist(item,state,actor));
  return Object.freeze({...worklists,schemaVersion:'1.2.0',authority:'runtime-procedure-worklist-presentation<-procedure-local-presenters<-runtime-procedure-worklist',procedures:Object.freeze(procedures),presentationPolicy:Object.freeze({providerLocalSemantics:true,sharedPrimitiveBusinessVocabulary:false,typedTargets:true,localFacetSemantics:true,globalBusinessState:false}),limitations:Object.freeze([...(worklists?.limitations||[]),'Presentation labels and facets are procedure-local projections; raw runtime kind/state remain available as technical attributes only.','Typed targets preserve procedure, subject and intended action; UI resolution must fail closed rather than fall back to a generic process surface.'])});
}
