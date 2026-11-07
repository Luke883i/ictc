/** K0: non-authoritative per-file migration frontier derived solely from the existing inventory.
 * Zero automatic move/delete decisions. Missing consumer reachability is always HOLD.
 */
export function deriveMigrationFrontier(entries, topology) {
  const rows = entries.filter(x => x.path.startsWith('v3/')).sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const paths = new Set(rows.map(x => x.path));
  const inbound = new Map(), outbound = new Map();
  for (const edge of topology.edges) {
    if (paths.has(edge.to)) { const list=inbound.get(edge.to)||[]; list.push(edge); inbound.set(edge.to,list); }
    if (paths.has(edge.from)) { const list=outbound.get(edge.from)||[]; list.push(edge); outbound.set(edge.from,list); }
  }
  const dynamic = new Set(topology.dynamic);
  const implementations = new Set(rows.filter(x => x.path.startsWith('v3/tests/') && x.path.split('/').length===3).map(x => x.path.split('/').at(-1)));
  const core = new Set(['bootstrap.mjs','server.mjs','store.mjs','runtime-store.mjs','sqlite-state-persistence.mjs',
    'domain.mjs','version.mjs','ai.mjs','enterprise.mjs','access-profile.mjs','network-policy.mjs',
    'integrity-binding.mjs','semantic.mjs','semantic-taxonomy.mjs','stable-governance.mjs','standard-proof.mjs']);
  const nodes = rows.map(x => {
    const path=x.path, name=path.split('/').at(-1); let target=null, cohort='owner-unresolved';
    const scopes=[['v3/tests/legacy/','tests/legacy/','historical-fixture'],['v3/tests/','tests/verification/','verification'],
      ['v3/runtime/','src/runtime/','runtime'],['v3/public/','public/','http-assets'],
      ['v3/lib/','src/lib/','application-library'],['v3/demo/','src/demo/','dynamic-demo-fixture'],
      ['v3/blob-fixtures/','tests/fixtures/blobs/','fixture-or-lineage'],['v3/standards/','src/standards/','standards-data']];
    const scope=scopes.find(s => path.startsWith(s[0]));
    if(scope){ target=scope[1]+path.slice(scope[0].length); cohort=scope[2]; }
    else if(implementations.has(name)){ cohort='compatibility-adapter'; }
    else if(name==='browser_test_support.py'){ target='tests/helpers/'+name;cohort='browser-helper'; }
    else if(path.endsWith('.py')){ target='tests/browser/'+name;cohort='browser-verification'; }
    else if(core.has(name)){ target='src/'+name;cohort='runtime-core'; }
    else if(/(?:check|test|audit|probe|stress|saturation|mutation|falsification|fuzz|e2e)(?:-[a-z0-9]+)*\.mjs$/i.test(name)){
      target='tests/verification/'+name;cohort='verification-candidate';
    }else if(path.endsWith('.json'))cohort='contract-or-data-unresolved';
    else if(path.endsWith('.md'))cohort='documentation-unresolved';
    const ins=inbound.get(path)||[], outs=outbound.get(path)||[], external=ins.filter(e => !paths.has(e.from));
    const blockers=['EXTERNAL_CONSUMER_UNPROVEN'];
    if(!target)blockers.push(cohort==='compatibility-adapter'?'ENTRYPOINT_RETIREMENT_UNPROVEN':'OWNER_DESTINATION_UNRESOLVED');
    if(dynamic.has(path)||x.purposeDynamicRisk)blockers.push('DYNAMIC_RESOLUTION_UNPROVEN');
    if(cohort==='http-assets')blockers.push('HTTP_URL_EQUIVALENCE_UNPROVEN');
    if(cohort==='runtime'||cohort==='runtime-core')blockers.push('RUNTIME_STATE_EQUIVALENCE_UNPROVEN');
    if(cohort==='historical-fixture')blockers.push('LINEAGE_CONSUMERS_UNPROVEN');
    if(external.some(e=>e.from.startsWith('.github/workflows/')))blockers.push('CI_COMMAND_REBIND_UNPROVEN');
    return {path,sha256:x.sha256,bytes:x.bytes,roleCandidate:x.v3StructuralRole,cohort,destinationCandidate:target,
      decision:'HOLD',observedInbound:ins.length,observedOutbound:outs.length,observedExternalInbound:external.length,
      observedHttpMount:ins.some(e=>e.kind==='http-static-route-candidate'),observedDynamicSource:dynamic.has(path),blockers};
  });
  // An already-tracked destination or competing destination candidate is never free.
  const trackedPaths=new Set(entries.map(x=>x.path)),claimed=new Map();
  for(const node of nodes){
    const to=node.destinationCandidate;
    if(to===null)continue;
    if(trackedPaths.has(to))node.blockers.push('TARGET_PATH_OCCUPIED');
    const cohort=claimed.get(to)||[];cohort.push(node);claimed.set(to,cohort);
  }
  for(const cohort of claimed.values())if(cohort.length>1)
    for(const node of cohort)node.blockers.push('TARGET_CANDIDATE_COLLISION');
  // SCCs use only observed code/Python edges; unobserved dynamic reachability stays unproved.
  const graph=new Map(rows.map(x=>[x.path,new Set()]));
  const kinds=new Set(['code-or-contract-literal','python-sibling-literal-candidate','python-local-import-candidate','browser-asset-or-literal','browser-absolute-url-candidate']);
  for(const e of topology.edges)if(kinds.has(e.kind)&&graph.has(e.from)&&graph.has(e.to))graph.get(e.from).add(e.to);
  const order=new Map(),low=new Map(),stack=[],active=new Set(),cyclic=[];let clock=0,componentCount=0;
  function visit(v){
    order.set(v,clock);low.set(v,clock++);stack.push(v);active.add(v);
    for(const w of graph.get(v)){
      if(!order.has(w)){visit(w);low.set(v,Math.min(low.get(v),low.get(w)));}
      else if(active.has(w))low.set(v,Math.min(low.get(v),order.get(w)));
    }
    if(low.get(v)===order.get(v)){
      componentCount++;const group=[];let w;
      do{w=stack.pop();active.delete(w);group.push(w);}while(w!==v);
      if(group.length>1)cyclic.push(group.sort());
    }
  }
  for(const p of [...graph.keys()].sort())if(!order.has(p))visit(p);
  cyclic.sort((a,b)=>b.length-a.length||(a[0]<b[0]?-1:a[0]>b[0]?1:0));
  const observedUseProjection=deriveObservedUse(rows,topology);
  const useByPath=new Map(observedUseProjection.nodes.map(row=>[row.path,row]));
  for(const node of nodes){
    const observed=useByPath.get(node.path);
    if(!observed)throw new Error('missing bounded use qualification: '+node.path);
    node.observedUse=observed.observedUse;
    node.useEvidence=observed.evidence;
    node.safeDeleteAuthorized=false;
  }
  // Candidate migration cutsets are a projection of the same observed graph.
  // They never grant a move/retirement licence. Cross-phase cycles must travel together.
  const classifyPhase=node=>{
    if(['v3/bootstrap.mjs','v3/server.mjs','v3/store.mjs','v3/runtime-store.mjs',
      'v3/sqlite-state-persistence.mjs'].includes(node.path))return 'K4_ATOMIC_ENTRY_STATE';
    if(['runtime','runtime-core','application-library'].includes(node.cohort))return 'K3_RUNTIME_SCC';
    if(['http-assets','historical-fixture','fixture-or-lineage','dynamic-demo-fixture',
      'standards-data','contract-or-data-unresolved','documentation-unresolved'].includes(node.cohort))return 'K2_CONTRACT_ASSET_FIXTURE';
    if(['verification','browser-helper','browser-verification','verification-candidate',
      'compatibility-adapter'].includes(node.cohort))return 'K1_VERIFICATION';
    return 'K5_RESIDUAL_UNQUALIFIED';
  };
  const byPath=new Map(nodes.map(n=>[n.path,n]));
  const phases=['K1_VERIFICATION','K2_CONTRACT_ASSET_FIXTURE','K3_RUNTIME_SCC',
    'K4_ATOMIC_ENTRY_STATE','K5_RESIDUAL_UNQUALIFIED'];
  const phaseCount=Object.fromEntries(phases.map(x=>[x,0]));
  for(const node of nodes){node.phaseCandidate=classifyPhase(node);phaseCount[node.phaseCandidate]++;}
  const crossPhaseCounts={},externalByKind={};
  for(const e of topology.edges){
    const target=byPath.get(e.to);
    if(!target)continue;
    const source=byPath.get(e.from);
    const srcPhase=source?.phaseCandidate||'OUTSIDE_V3',dstPhase=target.phaseCandidate;
    if(srcPhase!==dstPhase){
      const key=srcPhase+' > '+dstPhase+' :: '+e.kind;
      crossPhaseCounts[key]=(crossPhaseCounts[key]||0)+1;
      target.observedCrossPhaseInbound=(target.observedCrossPhaseInbound||0)+1;
      if(!source)externalByKind[e.kind]=(externalByKind[e.kind]||0)+1;
    }
  }
  const mixedStageCycles=cyclic.filter(group=>new Set(group.map(p=>byPath.get(p)?.phaseCandidate)).size>1);
  const unresolvedNoWitness=nodes.filter(n=>n.observedUse==='UNRESOLVED_NO_CURRENT_WITNESS')
   .map(n=>n.path);
  const cutsets={schema:'ictc-derived-v3-migration-cutsets/v1',source:'existing K0 observed edges only',
   counts:phaseCount,crossPhaseEdgeCounts:crossPhaseCounts,observedOutsideConsumerKinds:externalByKind,
   mixedStageSccCount:mixedStageCycles.length,mixedStageSccSamples:mixedStageCycles.slice(0,12),
   unresolvedNoWitnessCount:unresolvedNoWitness.length,
   unresolvedNoWitnessSamples:unresolvedNoWitness.slice(0,20),
   phaseDecisions:Object.fromEntries(phases.map(x=>[x,'HOLD'])),
   automaticCohortMoveAuthorized:false,claimBoundary:'A source-graph partition, not executable reachability, complete consumer closure, a min-cut theorem, or a safe-move decision.'};

  const byCohort={},byBlocker={};
  for(const row of nodes){byCohort[row.cohort]=(byCohort[row.cohort]||0)+1;
    for(const b of row.blockers)byBlocker[b]=(byBlocker[b]||0)+1;}
  const summary={trackedV3:rows.length,mappedV3:nodes.length,
    proposedDestinations:nodes.filter(n=>n.destinationCandidate!==null).length,
    unresolvedDestinations:nodes.filter(n=>n.destinationCandidate===null).length,
    observedInboundFiles:nodes.filter(n=>n.observedInbound>0).length,
    observedDynamicSources:nodes.filter(n=>n.observedDynamicSource).length,
    observedHttpCandidates:nodes.filter(n=>n.observedHttpMount).length,
    sccCount:componentCount,nontrivialScc:cyclic.length,byCohort,byBlocker,useQualification:observedUseProjection.summary,cutsets:cutsets.counts,
    automaticMoveAuthorized:false,automaticDeleteAuthorized:false};
  const projection={schema:'ictc-derived-migration-frontier/v1',source:'repository-inventory observed edges only',
    summary,nodes,observedCyclicCohorts:cyclic,cutsets,decision:'HOLD_ALL',
    claimBoundary:'Complete Git-path coverage is not complete runtime reachability; unqualified dynamic, HTTP and external callers veto cutover.'};
  return {...projection,closureReticulum:deriveMigrationClosureReticulum(projection)};
}

/** Evidence-bounded current use qualification, derived from the existing K0 graph.
 * No observation here proves runtime execution, nonuse, safe removal or external reachability. */
export const USE_CLASSES=Object.freeze([
 'DECLARED_RUNTIME_ROOT','RUNTIME_LITERAL_REACHABLE_CANDIDATE',
 'HTTP_SERVABLE_ASSET_CANDIDATE','CI_OR_PACKAGE_PATH_CANDIDATE',
 'SOURCE_CONSUMER_ONLY_CANDIDATE','HISTORICAL_NO_RUNTIME_WITNESS',
 'UNRESOLVED_NO_CURRENT_WITNESS'
]);
export function qualifyObservedUse(facts){
 if(facts.runtimeRoot)return USE_CLASSES[0];
 if(facts.runtimePath)return USE_CLASSES[1];
 if(facts.httpMounted)return USE_CLASSES[2];
 if(facts.ciPath)return USE_CLASSES[3];
 if(facts.sourceConsumer)return USE_CLASSES[4];
 if(facts.historicalPurpose)return USE_CLASSES[5];
 return USE_CLASSES[6];
}
export function deriveObservedUse(rows,topology){
 const paths=new Set(rows.map(x=>x.path));
 const codeKinds=new Set(['code-or-contract-literal','python-sibling-literal-candidate','python-local-import-candidate','browser-asset-or-literal','browser-absolute-url-candidate']);
 const byFrom=new Map(),byTo=new Map();
 for(const edge of topology.edges){
  if(paths.has(edge.to)){const es=byTo.get(edge.to)||[];es.push(edge);byTo.set(edge.to,es);}
  if(!codeKinds.has(edge.kind)||!paths.has(edge.from)||!paths.has(edge.to)||
     !/\.(?:mjs|js|py)$/.test(edge.from))continue;
  const es=byFrom.get(edge.from)||[];es.push(edge);byFrom.set(edge.from,es);
 }
 const walk=seeds=>{
  const seen=new Map(),queue=[];
  for(const p of [...new Set(seeds)].sort())if(paths.has(p)){
   seen.set(p,{root:p,depth:0,via:null});queue.push(p);
  }
  for(let i=0;i<queue.length;i++){
   const src=queue[i],prior=seen.get(src);
   for(const edge of byFrom.get(src)||[]){
    if(seen.has(edge.to))continue;
    seen.set(edge.to,{root:prior.root,depth:prior.depth+1,via:src,kind:edge.kind});queue.push(edge.to);
   }
  }
  return seen;
 };
 // Authority-declared current roots, not an inferred exhaustive executable entrypoint list.
 const roots=['v3/bootstrap.mjs','v3/server.mjs'];
 const runtime=walk(roots);
 const ciSeeds=topology.edges.filter(e=>e.kind==='workflow-command-or-literal'||e.kind==='launch-or-script-literal')
  .map(e=>e.to).filter(p=>paths.has(p));
 const ci=walk(ciSeeds);
 const http=new Set(topology.edges.filter(e=>e.kind==='http-static-route-candidate'&&e.from==='v3/server.mjs').map(e=>e.to));
 const historical=new Set(['lineage-only','deprecated-test','migration-only','retirement-candidate']);
 const dynamic=new Set(topology.dynamic);
 const counter={};
 const nodes=rows.map(row=>{
  const p=row.path,ins=byTo.get(p)||[];
  const facts={runtimeRoot:roots.includes(p),runtimePath:runtime.has(p),httpMounted:http.has(p),ciPath:ci.has(p),
   sourceConsumer:ins.some(e=>e.kind!=='http-static-route-candidate'&&e.kind!=='documentation-mention'),
   historicalPurpose:historical.has(row.purposeState)};
  const observedUse=qualifyObservedUse(facts);
  counter[observedUse]=(counter[observedUse]||0)+1;
  const runtimeWitness=runtime.get(p),ciWitness=ci.get(p);
  const evidence={runtimeRoot:facts.runtimeRoot,runtimeLiteralPath:!!runtimeWitness,
   runtimePathRoot:runtimeWitness?.root||null,runtimePathHops:runtimeWitness?.depth??null,
   runtimePredecessor:runtimeWitness?.via||null,httpStaticMount:facts.httpMounted,
   ciOrPackagePath:!!ciWitness,ciOrPackageRoot:ciWitness?.root||null,
   ciOrPackagePathHops:ciWitness?.depth??null,
   otherSourceConsumers:ins.filter(e=>e.kind!=='documentation-mention'&&e.kind!=='http-static-route-candidate').length,
   historicalPurpose:row.purposeState||null,dynamicSource:dynamic.has(p)||Boolean(row.purposeDynamicRisk),
   externalConsumers:'UNKNOWN',runtimeNonContributionProven:false};
  return {path:p,observedUse,evidence,decision:'HOLD',safeDeleteAuthorized:false};
 });
 for(const use of USE_CLASSES)counter[use]??=0;
 const summary={mappedV3:nodes.length,byObservedUse:counter,
  currentProductOrHttpCandidates:counter.DECLARED_RUNTIME_ROOT+counter.RUNTIME_LITERAL_REACHABLE_CANDIDATE+counter.HTTP_SERVABLE_ASSET_CANDIDATE,
  verificationOrPackageCandidates:counter.CI_OR_PACKAGE_PATH_CANDIDATE,
  nonRuntimeUnprovenCandidates:counter.SOURCE_CONSUMER_ONLY_CANDIDATE+counter.HISTORICAL_NO_RUNTIME_WITNESS+counter.UNRESOLVED_NO_CURRENT_WITNESS,
  runtimeNonContributionCertified:0,automaticallyRetirable:0};
 return {summary,nodes,claimBoundary:'Source-path witnesses and purpose states never prove that a file executed, was unused, or can safely be removed.'};
}


/** K0-K5 minimum conjunctive proof network. Gates express obligations only:
 * status=VERIFIED on an arbitrary user-supplied profile is never authenticated evidence.
 * Source scan can verify denominator only; host/runtime/independent receipts remain UNKNOWN. */
export const MIGRATION_CLOSURE_GATES=Object.freeze([
 {id:'G00_GIT_DENOMINATOR',slice:'K0',deps:[],owner:'scripts/repository-inventory.mjs'},
 {id:'G01_SINGLE_AUTHORITY',slice:'K3',deps:['G00_GIT_DENOMINATOR'],owner:'docs/authority-matrix.yaml'},
 {id:'G02_STATIC_DYNAMIC_CONSUMERS',slice:'K2',deps:['G00_GIT_DENOMINATOR'],owner:'scripts/repository-inventory.mjs'},
 {id:'G03_CI_AND_ENTRYPOINTS',slice:'K1',deps:['G00_GIT_DENOMINATOR'],owner:'scripts/test-boundary-migration-check.mjs'},
 {id:'G04_HTTP_ASSET_PARITY',slice:'K2',deps:['G00_GIT_DENOMINATOR'],owner:'v3/server.mjs'},
 {id:'G05_ATOMIC_SCC_COHORTS',slice:'K3',deps:['G01_SINGLE_AUTHORITY','G02_STATIC_DYNAMIC_CONSUMERS','G03_CI_AND_ENTRYPOINTS','G04_HTTP_ASSET_PARITY'],owner:'scripts/repository-migration-frontier.mjs'},
 {id:'G06_API_RBAC_HUMAN_AI',slice:'K4',deps:['G05_ATOMIC_SCC_COHORTS'],owner:'docs/PRODUCT.md'},
 {id:'G07_SQLITE_WRITE_REOPEN',slice:'K4',deps:['G05_ATOMIC_SCC_COHORTS'],owner:'v3/sqlite-state-persistence.mjs'},
 {id:'G08_BROWSER_EXPERIENCE',slice:'K4',deps:['G05_ATOMIC_SCC_COHORTS'],owner:'v3/public/ui/active-experience.js'},
 {id:'G09_EXTERNAL_CONSUMERS_REVIEW',slice:'K5',deps:['G02_STATIC_DYNAMIC_CONSUMERS','G03_CI_AND_ENTRYPOINTS','G04_HTTP_ASSET_PARITY'],owner:'GOVERNANCE.md'},
 {id:'G10_EXACT_HEAD_CI_MUTANTS_ROLLBACK',slice:'K5',deps:['G06_API_RBAC_HUMAN_AI','G07_SQLITE_WRITE_REOPEN','G08_BROWSER_EXPERIENCE','G09_EXTERNAL_CONSUMERS_REVIEW'],owner:'.github/workflows/ci.yml'},
 {id:'G11_ZERO_V3_AND_NO_SHADOW',slice:'K5',deps:['G10_EXACT_HEAD_CI_MUTANTS_ROLLBACK'],owner:'scripts/repository-contract.mjs'}
]);
export const GATE_STATUS=Object.freeze({FAILED:0,VERIFIED:1,UNKNOWN:2});
const gateIndexById=new Map(MIGRATION_CLOSURE_GATES.map((g,i)=>[g.id,i]));
const gatePrerequisites=MIGRATION_CLOSURE_GATES.map((g,i)=>g.deps.map(id=>{
 const j=gateIndexById.get(id);
 if(j===undefined||j>=i)throw new Error('non-topological migration gate reticulum '+g.id+' depends on '+id);
 return j;
}));
/** This optimized YES/NO predicate is ONLY for hypothetical gate profiles;
 * exhaustive 3^12 equivalence to the explanatory evaluator is mandatory. */
export function migrationGateProfileCandidate(vector){
 if(!Array.isArray(vector)||vector.length!==12)throw Error('invalid compact profile');
 let verifiedMask=0;
 for(let i=0;i<12;i++){
  const x=vector[i];
  if(x!==0&&x!==1&&x!==2)throw Error('invalid compact gate state');
  if(x===1)verifiedMask|=(1<<i);
 }
 return verifiedMask===0xfff;
}
export function assessMigrationGateVector(vector){
 if(!Array.isArray(vector)||vector.length!==MIGRATION_CLOSURE_GATES.length||
   vector.some(x=>!Number.isInteger(x)||x<0||x>2))throw new Error('invalid closure gate vector');
 const open=[],next=[],stale=[];
 const invalid=Array(MIGRATION_CLOSURE_GATES.length).fill(false);
 for(let i=0;i<MIGRATION_CLOSURE_GATES.length;i++){
  const g=MIGRATION_CLOSURE_GATES[i],deps=gatePrerequisites[i];
  const upstreamInvalid=deps.some(j=>vector[j]!==GATE_STATUS.VERIFIED||invalid[j]);
  invalid[i]=upstreamInvalid;
  if(vector[i]!==GATE_STATUS.VERIFIED){
   open.push(g.id);
   if(!upstreamInvalid)next.push(g.id);
  }else if(upstreamInvalid)stale.push(g.id);
 }
 return {candidate:open.length===0&&stale.length===0,
  decision:open.length===0&&stale.length===0?'REVIEWABLE_PROTOCOL_CANDIDATE':'HOLD',
  blocking:open,nextEligible:next,staleDependentEvidence:stale,
  automaticMoveAuthorized:false,automaticDeleteAuthorized:false,
  claimBoundary:'Finite logical proof prerequisites only; even all VERIFIED flags cannot authenticate receipts, independent review or deletion authority.'};
}
export function deriveMigrationClosureReticulum(frontier){
 const rows=frontier?.nodes||[],summary=frontier?.summary||{};
 const complete=summary.trackedV3===rows.length&&summary.mappedV3===rows.length&&
  rows.every(x=>x.path?.startsWith('v3/')&&x.decision==='HOLD'&&x.safeDeleteAuthorized===false&&
  x.useEvidence?.externalConsumers==='UNKNOWN'&&x.useEvidence?.runtimeNonContributionProven===false);
 const statuses=MIGRATION_CLOSURE_GATES.map(g=>g.id==='G00_GIT_DENOMINATOR'
  ?(complete?GATE_STATUS.VERIFIED:GATE_STATUS.FAILED)
  :g.id==='G11_ZERO_V3_AND_NO_SHADOW'
   ?(rows.length===0?GATE_STATUS.UNKNOWN:GATE_STATUS.FAILED)
   :GATE_STATUS.UNKNOWN);
 const logical=assessMigrationGateVector(statuses);
 return {schema:'ictc-derived-migration-closure-reticulum/v1',
  source:'K0 structural frontier and declared owners; no external attestation',
  gates:MIGRATION_CLOSURE_GATES.map((g,i)=>({...g,status:['FAILED','VERIFIED','UNKNOWN'][statuses[i]]})),
  directedDependencies:MIGRATION_CLOSURE_GATES.flatMap(g=>g.deps.map(from=>({from,to:g.id}))),
  minimalConjunctiveGateCount:statuses.length,denominatorVerified:complete,trackedV3:rows.length,
  sourceBoundedClosed:false,externallyCertified:false,automaticMoveAuthorized:false,automaticDeleteAuthorized:false,
  presentBlockers:logical.blocking,nextEligible:logical.nextEligible,
  claimBoundary:'This graph mathematically enumerates minimum independent obligations. K4/K5 never close from source counters, model mutants or declared PASS flags.'};
}
