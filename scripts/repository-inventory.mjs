/** Derived census of Git-tracked files. Observations never authorize deletion. */
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {repositoryPurposeCensus} from '../v3/trama-reconcile.mjs';

export const root=resolve(new URL('..',import.meta.url).pathname);
const digest=v=>createHash('sha256').update(v).digest('hex');
const declaredManifest=()=>JSON.parse(readFileSync(join(root,'docs/documentation-manifest.json'),'utf8'));
const listTracked=()=>execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean).sort();

export function classifyFile(file,registered){
  const d=registered.get(file);
  if(d)return {category:`document:${d.lifecycle}`,evidence:'documentation-manifest',disposition:d.authoritative?'PROTECT_AUTHORITY':'PRESERVE_REGISTERED'};
  if(file.startsWith('docs/')&&/\.(md|rst|txt)$/.test(file))return {category:'document:unregistered',evidence:'path-only',disposition:'HOLD_REVIEW'};
  if(/^\.github\/workflows\/.*\.ya?ml$/.test(file))return {category:'ci:workflow',evidence:'GitHub workflow path',disposition:'HOLD_CONSUMERS'};
  if(file.startsWith('.github/'))return {category:'repository:configuration',evidence:'GitHub configuration path',disposition:'HOLD_CONSUMERS'};
  if(/(^|\/)(?:[^/]*-check|[^/]*-test|[^/]*-saturation|[^/]*-probe|[^/]*-stress|[^/]*-audit|e2e[^/]*)\.(?:mjs|js|py)$/.test(file))return {category:'verification:candidate',evidence:'filename heuristic only',disposition:'HOLD_CONSUMERS'};
  if(file.startsWith('artifacts/')||file.startsWith('dist/'))return {category:'artifact:tracked',evidence:'directory heuristic only',disposition:'HOLD_REVIEW'};
  if(file.startsWith('ai/')||file==='AGENTS.md'||file.endsWith('/AGENTS.md'))return {category:'ai:development-context',evidence:'directory/name heuristic only',disposition:'HOLD_REVIEW'};
  if(file.startsWith('v3/')||file.startsWith('app/')||file.startsWith('runtime/')||file.startsWith('lib/'))return {category:'software:candidate',evidence:'directory heuristic only',disposition:'HOLD_CONSUMERS'};
  if(file.startsWith('schemas/'))return {category:'contract:candidate',evidence:'schema directory',disposition:'HOLD_CONSUMERS'};
  if(file.startsWith('v1/'))return {category:'legacy:candidate',evidence:'directory only; compatibility unknown',disposition:'HOLD_REVIEW'};
  return {category:'repository:other',evidence:'path-only',disposition:'HOLD_REVIEW'};
}

export function census(){
 const tracked=listTracked(),registered=new Map(declaredManifest().documents.map(d=>[d.path,d]));
 const canonical=repositoryPurposeCensus(root),purposeByPath=new Map(canonical.rows.map(x=>[x.path,x]));
 if(canonical.totalFiles!==tracked.length||canonical.coverage!==1)throw new Error('canonical purpose census does not fully cover tracked files');
 const entries=tracked.map(file=>{
   const bytes=readFileSync(join(root,file)); const meta=classifyFile(file,registered);
   const purpose=purposeByPath.get(file);if(!purpose)throw new Error('missing canonical purpose: '+file);
   return {path:file,sha256:digest(bytes),bytes:bytes.length,...meta,
     purposeState:purpose.state,purposeKind:purpose.kind,purposeReason:purpose.reason,
     purposeInbound:purpose.inboundCount,purposeOutbound:purpose.outboundCount,
     purposeDynamicRisk:purpose.dynamicRisk,purposeQualificationCoverage:purpose.qualificationCoverage};
 });
 const counts={};for(const item of entries)counts[item.category]=(counts[item.category]||0)+1;
 const unregisteredDocs=entries.filter(e=>e.category==='document:unregistered').map(e=>e.path);
 const trackedSet=new Set(tracked);
 const missingManifest=[...registered.keys()].filter(p=>!trackedSet.has(p));
 const status={schemaVersion:2,source:'git ls-files + existing repositoryPurposeCensus + manifest + byte hashes',total:entries.length,classified:entries.length,counts,unregisteredDocsCount:unregisteredDocs.length,missingManifest,
   canonicalPurposeCoverage:canonical.coverage,canonicalPurposeStates:canonical.byState,
   observedRetirementCandidates:canonical.retirementCandidates.map(x=>x.path),
   declaredSafeDeletes:0,automaticQuarantines:0,
  claimBoundary:'Path and manifest classifications are inventory evidence, NOT complete runtime reachability, absence of external consumers, or authorization to deprecate, quarantine, or delete.'};
 return {status,entries};
}
export function verifyInventory(data,validatedBaseline=null){
  const e=data.entries,s=data.status;
  if(!e.length||e.length!==s.total||s.classified!==s.total||s.missingManifest.length||new Set(e.map(x=>x.path)).size!==e.length)throw new Error('inventory completeness/manifest mismatch');
  if(e.some(x=>!x.disposition.startsWith('HOLD_')&&!['PROTECT_AUTHORITY','PRESERVE_REGISTERED'].includes(x.disposition)))throw new Error('unproved disposition');
  if(s.declaredSafeDeletes!==0||s.automaticQuarantines!==0)throw new Error('unauthorized removal promotion');
  // A validated baseline is supplied only by the bounded mutation test: one full
  // disk/authority verification, then deterministic in-memory receipt perturbations.
  if(validatedBaseline){
    if(JSON.stringify(s)!==JSON.stringify(validatedBaseline.status))throw new Error('summary altered against validated baseline');
    for(let i=0;i<e.length;i++)if(JSON.stringify(e[i])!==JSON.stringify(validatedBaseline.entries[i]))throw new Error('receipt altered against validated baseline');
    return true;
  }
  // Independently reconstruct the expected set and bytes, not just totals supplied by a caller.
  const actual=listTracked(),registered=new Map(declaredManifest().documents.map(d=>[d.path,d]));
  const canonical=repositoryPurposeCensus(root),byPath=new Map(canonical.rows.map(x=>[x.path,x]));
  if(s.canonicalPurposeCoverage!==canonical.coverage||JSON.stringify(s.canonicalPurposeStates)!==JSON.stringify(canonical.byState)||
     JSON.stringify(s.observedRetirementCandidates)!==JSON.stringify(canonical.retirementCandidates.map(x=>x.path)))throw new Error('canonical purpose summary mismatched');
  if(actual.length!==e.length)throw new Error('tracked set mismatch');
  for(let i=0;i<actual.length;i++){
    const file=actual[i],observed=e[i];
    if(file!==observed.path)throw new Error(`missing/extra/reordered path at ${i}`);
    const bytes=readFileSync(join(root,file)),expected=classifyFile(file,registered);
    if(digest(bytes)!==observed.sha256||bytes.length!==observed.bytes)throw new Error(`bytes/digest mismatch ${file}`);
    for(const key of ['category','evidence','disposition'])if(observed[key]!==expected[key])throw new Error(`unsound ${key}: ${file}`);
    const purpose=byPath.get(file);if(!purpose)throw new Error('missing canonical purpose row: '+file);
    const bindings={purposeState:purpose.state,purposeKind:purpose.kind,purposeReason:purpose.reason,
      purposeInbound:purpose.inboundCount,purposeOutbound:purpose.outboundCount,
      purposeDynamicRisk:purpose.dynamicRisk,purposeQualificationCoverage:purpose.qualificationCoverage};
    for(const [key,value] of Object.entries(bindings))if(observed[key]!==value)throw new Error(`unsound ${key}: ${file}`);
  }
  return true;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const result=census();verifyInventory(result);
 mkdirSync(join(root,'artifacts'),{recursive:true});
 writeFileSync(join(root,'artifacts/repository-inventory.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({...result.status,output:'artifacts/repository-inventory.json'}));
}
