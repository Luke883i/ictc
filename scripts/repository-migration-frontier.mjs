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
  const kinds=new Set(['code-or-contract-literal','python-sibling-literal-candidate','python-local-import-candidate','browser-asset-or-literal']);
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
  const byCohort={},byBlocker={};
  for(const row of nodes){byCohort[row.cohort]=(byCohort[row.cohort]||0)+1;
    for(const b of row.blockers)byBlocker[b]=(byBlocker[b]||0)+1;}
  const summary={trackedV3:rows.length,mappedV3:nodes.length,
    proposedDestinations:nodes.filter(n=>n.destinationCandidate!==null).length,
    unresolvedDestinations:nodes.filter(n=>n.destinationCandidate===null).length,
    observedInboundFiles:nodes.filter(n=>n.observedInbound>0).length,
    observedDynamicSources:nodes.filter(n=>n.observedDynamicSource).length,
    observedHttpCandidates:nodes.filter(n=>n.observedHttpMount).length,
    sccCount:componentCount,nontrivialScc:cyclic.length,byCohort,byBlocker,useQualification:observedUseProjection.summary,
    automaticMoveAuthorized:false,automaticDeleteAuthorized:false};
  return {schema:'ictc-derived-migration-frontier/v1',source:'repository-inventory observed edges only',
    summary,nodes,observedCyclicCohorts:cyclic,decision:'HOLD_ALL',
    claimBoundary:'Complete Git-path coverage is not complete runtime reachability; unqualified dynamic, HTTP and external callers veto cutover.'};
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
 const codeKinds=new Set(['code-or-contract-literal','python-sibling-literal-candidate','python-local-import-candidate','browser-asset-or-literal']);
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
