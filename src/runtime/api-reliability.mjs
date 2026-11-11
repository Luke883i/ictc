import {createHash} from 'node:crypto';
import {httpError} from './http.mjs';
export const API_RELIABILITY_CONTRACT=Object.freeze({schemaVersion:'1.1.0',openApiBaselineGitBlobSha1:'1565c773b6721475ab71624a46975f7fd30fbd82',maxJsonWriteBytes:8_000_000,boundedCollections:Object.freeze({'GET /api/epistemic-lattice':Object.freeze({defaultLimit:80,minLimit:10,maxLimit:200,totalField:'projection.totalSteps'})}),errorEnvelope:Object.freeze({schemaVersion:'1.0.0',requiredKeys:['error','code','requestId']}),deprecationPolicy:Object.freeze({mode:'explicit-baseline-update',minimumNoticeDays:90})});
export function gitBlobSha1(text){const canonical=String(text).replace(/\r\n/g,'\n');const b=Buffer.from(canonical);return createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`),b])).digest('hex');}
export function evaluateApiReliability({openApiText='',httpSource='',latticeSource='',serverSource=''}={}){const violations=[];const blob=gitBlobSha1(openApiText||'');if(blob!==API_RELIABILITY_CONTRACT.openApiBaselineGitBlobSha1)violations.push('openapi-baseline-changed');if(!httpSource.includes('bodyJson(request,limit=8_000_000)'))violations.push('json-write-bound-changed');if(!latticeSource.includes('clamp(limit,10,200,80)'))violations.push('pagination-bound-changed');for(const key of API_RELIABILITY_CONTRACT.errorEnvelope.requiredKeys)if(!serverSource.includes(key==='error'?"error:error.message":key==='code'?'code:errorCode':'requestId:trace.requestId'))violations.push(`error-envelope-${key}-missing`);return{schemaVersion:'1.0.0',authority:'s3-api-reliability-contract',baselineGitBlobSha1:blob,violations,ok:violations.length===0,claimBoundary:'Baseline changes require explicit contract review; existing api-contract-check remains authority for exact mounted method/path parity.'};}


// F-13: optional, role-bound, revision-bound pagination for the existing trace projection.
// Legacy GET without paging parameters remains byte-contract compatible.
const TRACE_PAGE_DEFAULT=20, TRACE_PAGE_MAX=50;
const failPage=(code,message,status=400)=>{throw httpError(status,message,code);};
const actorBinding=actor=>createHash('sha256').update(JSON.stringify([String(actor?.role||''),String(actor?.id||'')])).digest('hex');
const strictCursor=token=>{
  if(typeof token!=='string'||token.length>4096||!/^[A-Za-z0-9_-]+$/.test(token))failPage('trace-cursor-invalid','Cursor della traccia non valido');
  let decoded;try{decoded=Buffer.from(token,'base64url').toString('utf8');}catch{failPage('trace-cursor-invalid','Cursor della traccia non valido');}
  if(Buffer.from(decoded).toString('base64url')!==token)failPage('trace-cursor-invalid','Cursor della traccia non canonico');
  try{const parsed=JSON.parse(decoded);if(parsed?.v!==1||typeof parsed.anchor!=='string'||!parsed.anchor||typeof parsed.binding!=='string'||!Number.isSafeInteger(parsed.revision)||!Number.isInteger(parsed.limit)||parsed.limit<1||parsed.limit>TRACE_PAGE_MAX)throw new Error('cursor fields');return parsed;}catch{failPage('trace-cursor-invalid','Cursor della traccia non valido');}
};
export function pageProcedureTraces(graph,query,actor,stateRevision){
  const entries=query instanceof URLSearchParams?query:new URLSearchParams(query||'');
  if(!entries.has('limit')&&!entries.has('cursor'))return graph;
  for(const key of entries.keys())if(!['limit','cursor'].includes(key)||entries.getAll(key).length!==1)failPage('trace-page-invalid','Parametri di paginazione non validi');
  const rawLimit=entries.get('limit'),rawCursor=entries.get('cursor');
  if(rawLimit!==null&&!/^[1-9]\d*$/.test(rawLimit))failPage('trace-page-limit-invalid','Limite di pagina non valido');
  const limit=rawLimit===null?TRACE_PAGE_DEFAULT:Number(rawLimit);
  if(!Number.isSafeInteger(limit)||limit<1||limit>TRACE_PAGE_MAX)failPage('trace-page-limit-invalid','Limite di pagina fuori perimetro');
  const revision=Number(stateRevision);
  if(!Number.isSafeInteger(revision)||revision<0)failPage('trace-revision-invalid','Revisione dello stato non disponibile',409);
  const binding=actorBinding(actor),rows=[...(graph.traces||[])].sort((a,b)=>String(a.id).localeCompare(String(b.id),'en'));
  let start=0;
  if(rawCursor!==null){
    const cursor=strictCursor(rawCursor);
    if(cursor.binding!==binding)failPage('trace-cursor-actor-mismatch','Cursor di un altro attore',403);
    if(cursor.revision!==revision)failPage('trace-cursor-stale','La revisione e cambiata; ripartire dalla prima pagina',409);
    if(cursor.limit!==limit)failPage('trace-cursor-limit-mismatch','Limite diverso da quello iniziale');
    const index=rows.findIndex(row=>row.id===cursor.anchor);
    if(index<0)failPage('trace-cursor-invalid','Ancora non disponibile');
    start=index+1;
  }
  const traces=rows.slice(start,start+limit),hasMore=start+traces.length<rows.length;
  const nextCursor=hasMore&&traces.length?Buffer.from(JSON.stringify({v:1,anchor:traces.at(-1).id,binding,revision,limit})).toString('base64url'):null;
  return {...graph,traces,page:{schemaVersion:'1.0.0',limit,total:rows.length,hasMore,nextCursor,revision,roleScoped:true,limitations:['La pagina contiene soltanto tracce accessibili al ruolo corrente.','Il cursor non autorizza accesso: ogni richiesta viene nuovamente autorizzata.','La revisione vincola il cursor allo snapshot: ogni mutazione richiede una nuova scansione.','Il limite vincola la risposta, non la memoria temporanea richiesta dalla proiezione completa.']}};
}
