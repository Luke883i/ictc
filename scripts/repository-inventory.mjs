/** Derived census of Git-tracked files. Observations never authorize deletion. */
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,resolve,dirname,normalize} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {repositoryPurposeCensus} from '../v3/trama-reconcile.mjs';
import {deriveMigrationFrontier} from './repository-migration-frontier.mjs';

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
  if(file.startsWith('v3/tests/legacy/'))return {category:'legacy:candidate',evidence:'explicit verification-only migrated island; no business authority',disposition:'HOLD_CONSUMERS'};
  if(/(^|\/)(?:[^/]*-check|[^/]*-test|[^/]*-saturation|[^/]*-probe|[^/]*-stress|[^/]*-audit|e2e[^/]*)\.(?:mjs|js|py)$/.test(file))return {category:'verification:candidate',evidence:'filename heuristic only',disposition:'HOLD_CONSUMERS'};
  if(file.startsWith('artifacts/')||file.startsWith('dist/'))return {category:'artifact:tracked',evidence:'directory heuristic only',disposition:'HOLD_REVIEW'};
  if(file.startsWith('ai/')||file==='AGENTS.md'||file.endsWith('/AGENTS.md'))return {category:'ai:development-context',evidence:'directory/name heuristic only',disposition:'HOLD_REVIEW'};
  if(file.startsWith('v3/')||file.startsWith('app/')||file.startsWith('runtime/')||file.startsWith('lib/'))return {category:'software:candidate',evidence:'directory heuristic only',disposition:'HOLD_CONSUMERS'};
  if(file.startsWith('v1/'))return {category:'legacy:candidate',evidence:'directory only; compatibility unknown',disposition:'HOLD_REVIEW'};
  return {category:'repository:other',evidence:'path-only',disposition:'HOLD_REVIEW'};
}

// R2: source-bound structural candidates; NEVER an owner assignment or move licence.
// The existing repositoryPurposeCensus remains the canonical per-file purpose oracle.
export function v3StructuralRole(file){
 if(!file.startsWith('v3/'))return null;
 if(file.startsWith('v3/tests/legacy/'))return 'historical-verification-fixture';
 if(file.startsWith('v3/tests/')||file.startsWith('v3/test-helpers/'))return 'verification';
 if(file.startsWith('v3/public/'))return 'public-url-asset';
 if(file.startsWith('v3/demo/')||file.startsWith('v3/blob-fixtures/'))return 'fixture-candidate';
 if(file.startsWith('v3/runtime/'))return 'runtime-candidate';
 if(file.startsWith('v3/standards/'))return 'standards-candidate';
 if(file.endsWith('.py'))return 'browser-verification-candidate';
 if(/(?:check|test|audit|probe|stress|saturation|mutation|falsification|e2e)\.(?:mjs|js)$/.test(file))return 'verification-candidate';
 if(file.endsWith('.json'))return 'contract-or-data-candidate';
 if(file.endsWith('.md'))return 'documentation-candidate';
 return 'source-or-tool-candidate';
}
export function v3StructuralCensus(entries){
 const rows=entries.filter(e=>e.path.startsWith('v3/'));
 const byRole={};
 for(const e of rows)byRole[e.v3StructuralRole]=(byRole[e.v3StructuralRole]||0)+1;
 return {files:rows.length,topLevelFiles:rows.filter(e=>e.path.split('/').length===2).length,
  classifiedByPath:rows.filter(e=>typeof e.v3StructuralRole==='string').length,byRole,
  independentConsumerProof:false,ownerQualified:false,moveOrRenameAuthorized:false,
  externalConsumerBoundary:'UNKNOWN',targetName:'src/ (proposal only)',
  claimBoundary:'Path-derived classification, not verified static/dynamic/HTTP/CI reachability, ownership, lossless rename or safe deletion.'};
}

/** Conservative literal-edge projection over the existing purpose census.
 * This is not an independent dependency authority or a safe-to-move decision.
 * Dynamic resolution, HTTP routing, runtime-generated strings and external
 * callers remain unqualified. Every tracked path remains HOLD without proof. */
export function v3DependencyTopology(entries,scanRoot=root){
 const files=new Set(entries.map(e=>e.path));
 const edges=[],unresolved=[],dynamic=[],excluded=[];
 const extension=/\.(?:mjs|js|py|json|ya?ml|html|css|md|txt|sh)$/i;
 const literal=/(?<![A-Za-z0-9_])(?:\.\.?\/|v3\/|tests\/|src\/|scripts\/|docs\/|audit\/|\.github\/)[A-Za-z0-9_./@-]+\.(?:mjs|js|py|json|ya?ml|html|css|md|svg|png|sh)/g;
 // Local Python references are observed candidates, never proof of runtime resolution.
 const pythonSibling=/(?:pathlib\.)?Path\(\s*__file__\s*\)(?:\.resolve\(\))?\.with_name\(\s*(['"])([A-Za-z0-9_.@-]+\.py)\1\s*\)/g;
 const pythonModule=/(?:^|\n)\s*(?:from\s+([A-Za-z_][A-Za-z0-9_]*)\s+import\b|import\s+([A-Za-z_][A-Za-z0-9_]*)\b)/g;
 const classify=(source)=>{
  if(source.startsWith('.github/workflows/'))return 'workflow-command-or-literal';
  if(source==='package.json'||source==='ictc.sh')return 'launch-or-script-literal';
  if(source.startsWith('docs/')||source.endsWith('.md'))return 'documentation-mention';
  if(source.startsWith('v3/public/'))return 'browser-asset-or-literal';
  return 'code-or-contract-literal';
 };
 for(const row of entries){
  if(!extension.test(row.path))continue;
  if(row.bytes>2*1024*1024){excluded.push({path:row.path,reason:'oversize text scan'});continue;}
  const bytes=readFileSync(join(scanRoot,row.path));
  if(bytes.includes(0)){excluded.push({path:row.path,reason:'binary/NUL'});continue;}
  const source=row.path,body=bytes.toString('utf8'),kind=classify(source),seen=new Set();
  if(/(?:readdir|glob|walk|recursive|import\s*\(|require\s*\(|eval\s*\(|runpy\s*\.\s*run_path\s*\(|new\s+URL\s*\(\s*`)/i.test(body))
   dynamic.push(source);
  for(const m of body.matchAll(literal)){
   const raw=m[0],target=raw.startsWith('./')||raw.startsWith('../')
    ?normalize(join(dirname(source),raw)).replaceAll('\\','/')
    :raw;
   if(target===source)continue;
   const id=source+'\u0000'+target+'\u0000'+kind;
   if(seen.has(id))continue;seen.add(id);
   const edge={from:source,to:target,kind};
   if(files.has(target))edges.push(edge);
   else unresolved.push({...edge,claimBoundary:'unresolved literal, not necessarily executable dependency'});
  }
  if(source.endsWith('.py')){
   const addPython=(target,edgeKind)=>{
    if(target===source)return;
    const id=source+'\u0000'+target+'\u0000'+edgeKind;
    if(seen.has(id))return;seen.add(id);
    const edge={from:source,to:target,kind:edgeKind};
    if(files.has(target))edges.push(edge);
    else unresolved.push({...edge,claimBoundary:'unresolved local Python reference, not executable reachability proof'});
   };
   for(const m of body.matchAll(pythonSibling))
    addPython(normalize(join(dirname(source),m[2])).replaceAll('\\','/'),'python-sibling-literal-candidate');
   for(const m of body.matchAll(pythonModule)){
    const candidate=normalize(join(dirname(source),(m[1]||m[2])+'.py')).replaceAll('\\','/');
    if(files.has(candidate))addPython(candidate,'python-local-import-candidate');
   }
  }
  // Literal absolute browser URL candidates are NOT implied by JS imports.
  // Keep this a source-bound consumer edge, not a claim of executed/mounted code.
  if(source.startsWith('v3/public/')&&/\.(?:mjs|js|html|css)$/.test(source)){
   const absolute=/(['"])\/([A-Za-z0-9_./@-]+\.(?:mjs|js|css|html|svg|png|json|ico|webp))\1/g;
   for(const m of body.matchAll(absolute)){
    const target=normalize(join('v3/public',m[2])).replaceAll('\\','/');
    if(target===source)continue;
    const id=source+'\u0000'+target+'\u0000browser-absolute-url-candidate';
    if(seen.has(id))continue;
    seen.add(id);
    const edge={from:source,to:target,kind:'browser-absolute-url-candidate'};
    if(files.has(target))edges.push(edge);
    else unresolved.push({...edge,claimBoundary:'unresolved literal browser URL, external requests and runtime execution not established'});
   }
  }
 }
 // Source-bound HTTP mount, only candidate URL edges (not runtime/consumer proof).
 const server='v3/server.mjs';
 const body=files.has(server)?readFileSync(join(scanRoot,server),'utf8'):'';
 const httpStaticRootObserved=body.includes("const publicRoot=path.join(here,'public')")&&
  body.includes('serveStatic(response,url.pathname,publicRoot,mime)');
 let httpStaticCandidateCount=0;
 if(httpStaticRootObserved)for(const e of entries)if(e.path.startsWith('v3/public/')){
  edges.push({from:server,to:e.path,kind:'http-static-route-candidate'});
  httpStaticCandidateCount++;
 }
 const byKind={};for(const edge of edges)byKind[edge.kind]=(byKind[edge.kind]||0)+1;
 const v3Targets=edges.filter(e=>e.to.startsWith('v3/')),v3Files=entries.filter(e=>e.path.startsWith('v3/'));
 const covered=new Set(v3Targets.map(e=>e.to));
 return {schema:'ictc-derived-v3-dependency-topology/v1',source:'tracked-file literal scan; no new owner',
  totalTracked:entries.length,totalV3:v3Files.length,
  scannedTextFiles:entries.filter(e=>extension.test(e.path)).length-excluded.length,
  httpStaticRootObserved,httpStaticCandidateCount,
  excluded,edgeCount:edges.length,unresolvedLiteralCount:unresolved.length,
  v3InboundLiterals:v3Targets.length,v3TargetsWithObservedLiterals:covered.size,
  v3TargetsWithoutObservedLiterals:v3Files.length-covered.size,
  dynamicSelectorSources:dynamic.length,byKind,edges,unresolved,dynamic,
  independentConsumerProof:false,externalConsumersCleared:false,httpRouteEquivalenceVerified:false,
  automaticMoveAuthorized:false,automaticDeleteAuthorized:false,
  claimBoundary:'Observed literal edges are not a complete call graph; empty inbound and absent dynamic paths never authorize move, deletion or R4/R5 cutover.'};
}

/** Directory projection over the existing committed file census. It never assigns authority.
 * Directory names, byte totals, subtree and direct-file counts are reproducible
 * from the same tracked file list. They do not confer permission to move/delete.
 */
export function directoryCensus(entries){
 const dirs=new Map();
 for(const entry of entries){
   const parts=entry.path.split('/');
   for(let depth=1;depth<parts.length;depth++){
     const path=parts.slice(0,depth).join('/');
     let row=dirs.get(path);
     if(!row){row={path,depth,directFiles:0,subtreeFiles:0,subtreeBytes:0,dynamicRiskFiles:0,explicitHistoricalOrMigrationFiles:0,referencedFiles:0,retirementCandidates:0,moveOrDeleteAuthorized:false};dirs.set(path,row);}
     row.subtreeFiles++;
     row.subtreeBytes+=entry.bytes;
     if(depth===parts.length-1)row.directFiles++;
     if(entry.purposeDynamicRisk)row.dynamicRiskFiles++;
     if(['lineage-only','deprecated-test','migration-only'].includes(entry.purposeState))row.explicitHistoricalOrMigrationFiles++;
     if(entry.purposeInbound>0)row.referencedFiles++;
     if(entry.purposeState==='retirement-candidate')row.retirementCandidates++;
   }
 }
 return [...dirs.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'));
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
     purposeDynamicRisk:purpose.dynamicRisk,purposeQualificationCoverage:purpose.qualificationCoverage,
     v3StructuralRole:v3StructuralRole(file)};
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
 const directories=directoryCensus(entries);
 status.v3Structural=v3StructuralCensus(entries);
 status.directoryCount=directories.length;
 status.rootDirectFiles=tracked.filter(p=>!p.includes('/')).length;
 status.directoryDisposition='NON_AUTHORITATIVE_HOLD_UNTIL_CONSUMER_AND_OWNER_PROOF';
 const dependencyTopology=v3DependencyTopology(entries);
 const migrationFrontier=deriveMigrationFrontier(entries,dependencyTopology);
 status.dependencyTopology={schema:dependencyTopology.schema,edgeCount:dependencyTopology.edgeCount,unresolvedLiteralCount:dependencyTopology.unresolvedLiteralCount,v3TargetsWithObservedLiterals:dependencyTopology.v3TargetsWithObservedLiterals,dynamicSelectorSources:dependencyTopology.dynamicSelectorSources,httpStaticCandidateCount:dependencyTopology.httpStaticCandidateCount,independentConsumerProof:false,automaticMoveAuthorized:false};
 status.migrationFrontier=migrationFrontier.summary;
 return {status,entries,directories,dependencyTopology,migrationFrontier};
}
export function verifyInventory(data,validatedBaseline=null){
  const e=data.entries,s=data.status,dirs=data.directories;
  const frontier=deriveMigrationFrontier(e,data.dependencyTopology);
  if(JSON.stringify(data.migrationFrontier)!==JSON.stringify(frontier)||
     JSON.stringify(s.migrationFrontier)!==JSON.stringify(frontier.summary)||
     frontier.summary.mappedV3!==s.v3Structural.files||frontier.decision!=='HOLD_ALL'||
     frontier.summary.automaticMoveAuthorized!==false||frontier.summary.automaticDeleteAuthorized!==false||
     frontier.nodes.some(x=>x.decision!=='HOLD'||!x.blockers.includes('EXTERNAL_CONSUMER_UNPROVEN')))
    throw new Error('K0 frontier coverage or fabricated migration clearance');
  if(!e.length||e.length!==s.total||s.classified!==s.total||s.missingManifest.length||new Set(e.map(x=>x.path)).size!==e.length)throw new Error('inventory completeness/manifest mismatch');
  const expectedV3=v3StructuralCensus(e);
  if(JSON.stringify(s.v3Structural)!==JSON.stringify(expectedV3)||
     e.some(item=>item.v3StructuralRole!==v3StructuralRole(item.path))||
     s.v3Structural.moveOrRenameAuthorized!==false||
     s.v3Structural.ownerQualified!==false||
     s.v3Structural.independentConsumerProof!==false)
    throw new Error('v3 structural role / rename authorization drift');
  if(!validatedBaseline){
  const topology=v3DependencyTopology(e);
  if(JSON.stringify(data.dependencyTopology)!==JSON.stringify(topology)||
     JSON.stringify(s.dependencyTopology)!==JSON.stringify({schema:topology.schema,edgeCount:topology.edgeCount,unresolvedLiteralCount:topology.unresolvedLiteralCount,v3TargetsWithObservedLiterals:topology.v3TargetsWithObservedLiterals,dynamicSelectorSources:topology.dynamicSelectorSources,httpStaticCandidateCount:topology.httpStaticCandidateCount,independentConsumerProof:false,automaticMoveAuthorized:false})||
     topology.totalV3!==s.v3Structural.files||topology.automaticMoveAuthorized!==false||
     topology.automaticDeleteAuthorized!==false)
   throw new Error('derived dependency topology or unauthorized consumer clearance drift');
  }
  const expectedDirs=directoryCensus(e);
  if(!Array.isArray(dirs)||JSON.stringify(dirs)!==JSON.stringify(expectedDirs)||s.directoryCount!==expectedDirs.length||
     s.rootDirectFiles!==e.filter(x=>!x.path.includes('/')).length||s.directoryDisposition!=='NON_AUTHORITATIVE_HOLD_UNTIL_CONSUMER_AND_OWNER_PROOF')
    throw new Error('directory projection or retirement authorization drift');

  if(e.some(x=>!x.disposition.startsWith('HOLD_')&&!['PROTECT_AUTHORITY','PRESERVE_REGISTERED'].includes(x.disposition)))throw new Error('unproved disposition');
  if(s.declaredSafeDeletes!==0||s.automaticQuarantines!==0)throw new Error('unauthorized removal promotion');
  // A validated baseline is supplied only by the bounded mutation test: one full
  // disk/authority verification, then deterministic in-memory receipt perturbations.
  if(validatedBaseline){
    if(JSON.stringify(s)!==JSON.stringify(validatedBaseline.status))throw new Error('summary altered against validated baseline');
    if(JSON.stringify(dirs)!==JSON.stringify(validatedBaseline.directories))throw new Error('directory projection altered against validated baseline');
    if(JSON.stringify(data.dependencyTopology)!==JSON.stringify(validatedBaseline.dependencyTopology))throw new Error('dependency topology altered against validated baseline');
    if(JSON.stringify(data.migrationFrontier)!==JSON.stringify(validatedBaseline.migrationFrontier))throw new Error('K0 frontier altered against validated baseline');
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
    if(observed.v3StructuralRole!==v3StructuralRole(file))throw new Error('v3 structural classification mismatch: '+file);
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
