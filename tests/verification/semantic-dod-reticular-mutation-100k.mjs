// CORA PR52-56 cross-layer falsification; actual tracked-source strings, IN MEMORY only.
// Does not compile/execute each mutant; cannot qualify browser, E3, E4, or release.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const PATHS=Object.freeze({
 pkg:'package.json',
 identity:'src/contracts/release-identity.json',
 product:'docs/PRODUCT.md',
 authority:'docs/convergence/convergence-authority.json',
 gaps:'tests/contracts/gaps.json',
 remediation:'audit/remediation-registry.json',
 server:'src/server.mjs',
 store:'src/store.mjs',
 delivery:'.github/workflows/enterprise-candidate.yml',
 shell:'public/ui/stable-shell.js'
});
const PROCESS_CODES=Object.freeze(['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01']);
const find=(items,id)=>items.find(x=>x.id===id);
function replaceOnce(source,from,to){
  assert.equal(source.split(from).length-1,1,'source mutation anchor ambiguous or missing: '+from);
  return source.replace(from,to);
}
function editJson(sources,owner,edit){
  const value=JSON.parse(sources[owner]);
  edit(value);
  sources[owner]=JSON.stringify(value);
}
const FAMILIES=Object.freeze([
 ['release-version','identity',(s,n)=>editJson(s,'identity',x=>{x.productVersion='9.'+((n>>>8)%10000)+'.'+((n>>>16)%10000);})],
 ['canonical-code','identity',(s)=>editJson(s,'identity',x=>{x.procedureMaturity.canonical[0]='OP-01';})],
 ['product-process-table','product',(s)=>{s.product=replaceOnce(s.product,'| RN-01 |','| OP-01 |');}],
 ['c1-unwitnessed-closure','authority',(s)=>editJson(s,'authority',x=>{find(x.conditionalSlices,'C1-COMPAT-CONTRACTION').state='done';})],
 ['c3-premature-closure','authority',(s)=>editJson(s,'authority',x=>{find(x.conditionalSlices,'C3-CAPACITY-CONTRACT').state='done';})],
 ['c4-premature-closure','authority',(s)=>editJson(s,'authority',x=>{find(x.conditionalSlices,'C4-AI-EVAL-DRIFT').state='done';})],
 ['s4-premature-closure','authority',(s)=>editJson(s,'authority',x=>{find(x.serialChain,'S4-A6-CLOSE').state='done';})],
 ['s5-premature-closure','authority',(s)=>editJson(s,'authority',x=>{find(x.serialChain,'S5-CANDIDATE-SEAL').state='done';})],
 ['e3-unattested-status','gaps',(s)=>editJson(s,'gaps',x=>{find(x.gaps,'GAP-022').status='closed';})],
 ['e4-unattested-status','gaps',(s)=>editJson(s,'gaps',x=>{find(x.gaps,'GAP-007').status='closed';})],
 ['server-onboarding-bypass','server',(s)=>{s.server=replaceOnce(s.server,"if(requiresOnboardingForWrite(request.method||'GET',url.pathname,user))",'if(false)');}],
 ['store-revision-bypass','store',(s)=>{s.store=replaceOnce(s.store,"code:'revision-conflict'","code:'generic-success'");}],
 ['store-integrity-bypass','store',(s)=>{s.store=replaceOnce(s.store,'const persistedIntegrity=verifyStateIntegrity(persisted)','const persistedIntegrity={ok:true,stateBound:true}');}],
 ['slsa-verification-type','delivery',(s)=>{s.delivery=replaceOnce(s.delivery,'--predicate-type https://slsa.dev/provenance/v1','--predicate-type https://invalid.example/provenance');}],
 ['sbom-verification-type','delivery',(s)=>{s.delivery=replaceOnce(s.delivery,'--predicate-type https://cyclonedx.org/bom','--predicate-type https://invalid.example/bom');}],
 ['home-onboarding-replay','shell',(s)=>{s.shell=replaceOnce(s.shell,'data-onboarding-open data-onboarding-replay','data-onboarding-inert data-onboarding-replay');}],
 ['f13-false-closure','remediation',(s)=>editJson(s,'remediation',x=>{find(x.findings,'F-13').status='resolved';})],
 ['f15-false-closure','remediation',(s)=>editJson(s,'remediation',x=>{find(x.findings,'F-15').status='resolved';})]
]);

// Independent cross-file predicates, not an equality comparison with the mutated token.
function rejectedBecause(s){
  const pkg=JSON.parse(s.pkg),identity=JSON.parse(s.identity);
  const authority=JSON.parse(s.authority),gaps=JSON.parse(s.gaps),remediation=JSON.parse(s.remediation);
  const c=id=>find(authority.conditionalSlices,id)?.state;
  const serial=id=>find(authority.serialChain,id)?.state;
  const g=id=>find(gaps.gaps,id)?.status;
  const f=id=>find(remediation.findings,id)?.status;
  const debt=id=>find(authority.internalDebt,id)?.status;
  const docCodes=[...s.product.matchAll(/^\| ((?:RN|EC|AO|MC|AP|RC|AR)-01) \|/gm)].map(m=>m[1]);
  const reasons=[];
  if(pkg.version!==identity.productVersion)reasons.push('RELEASE_VERSION');
  if(new Set(identity.procedureMaturity.canonical).size!==7||
    new Set(docCodes).size!==7||
    PROCESS_CODES.some(x=>!docCodes.includes(x)||!identity.procedureMaturity.canonical.includes(x)))
    reasons.push('BUSINESS_PROCESS_IDENTITY');
  if(c('C1-COMPAT-CONTRACTION')==='done'&&
     !find(authority.conditionalSlices,'C1-COMPAT-CONTRACTION')?.evidenceRefs?.length)
    reasons.push('C1_NO_SCOPED_WITNESS');
  if(c('C3-CAPACITY-CONTRACT')==='done'&&f('F-13')!=='resolved')
    reasons.push('C3_UNRESOLVED_CAPACITY');
  if(c('C4-AI-EVAL-DRIFT')==='done'&&f('F-15')!=='resolved')
    reasons.push('C4_UNRESOLVED_EVALUATION');
  if(serial('S4-A6-CLOSE')==='done'&&
    ['C1-COMPAT-CONTRACTION','C3-CAPACITY-CONTRACT','C4-AI-EVAL-DRIFT'].some(x=>!['done','not-required'].includes(c(x))))
    reasons.push('S4_OPEN_DEPENDENCY');
  if(serial('S5-CANDIDATE-SEAL')==='done'&&serial('S4-A6-CLOSE')!=='done')
    reasons.push('S5_OPEN_DEPENDENCY');
  if(g('GAP-022')!=='open'&&find(authority.externalRails,'E3-GOV')?.state==='external')
    reasons.push('E3_UNATTESTED_STATUS');
  if(g('GAP-007')!=='open'&&find(authority.externalRails,'E4-DEPLOY')?.state==='external')
    reasons.push('E4_UNATTESTED_STATUS');
  if(!s.server.includes("if(requiresOnboardingForWrite(request.method||'GET',url.pathname,user))"))
    reasons.push('ONBOARDING_WRITE_BOUNDARY');
  if(!s.store.includes("code:'revision-conflict'"))
    reasons.push('STORE_REVISION_CONFLICT');
  if(!s.store.includes('const persistedIntegrity=verifyStateIntegrity(persisted)'))
    reasons.push('STORE_DURABLE_INTEGRITY');
  if(!s.delivery.includes('--predicate-type https://slsa.dev/provenance/v1'))
    reasons.push('BUILD_PROVENANCE_PREDICATE');
  if(!s.delivery.includes('--predicate-type https://cyclonedx.org/bom'))
    reasons.push('SBOM_PREDICATE');
  if(!s.shell.includes('data-onboarding-open data-onboarding-replay'))
    reasons.push('HOME_READONLY_REPLAY');
  if(f('F-13')!==debt('F-13'))reasons.push('F13_REGISTRY_DRIFT');
  if(f('F-15')!==debt('F-15'))reasons.push('F15_REGISTRY_DRIFT');
  return reasons.sort();
}

export function runSemanticDODMutations(root,{cases=100000,seed=0x056c0285}={}){
  assert.equal(cases,100000,'fixed pre-registered campaign size');
  const original=Object.fromEntries(Object.entries(PATHS).map(([key,path])=>
    [key,readFileSync(join(root,path),'utf8')]));
  assert.deepEqual(rejectedBecause(original),[],'canonical owner baseline must satisfy scoped cross-file invariants');
  // Each family must independently die; combination kills alone could hide weak individual oracles.
  for(const [name,owner,mutate] of FAMILIES){
    const trial={...original};
    mutate(trial,seed);
    assert.ok(rejectedBecause(trial).length>0,'single fault family escaped: '+name+' ('+owner+')');
  }
  let state=seed>>>0;
  const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
  const counts=Array(FAMILIES.length).fill(0);
  const classFirstSeen=new Map(),combinations=new Set();
  let multifamily=0,crossOwner=0,survivors=0,lastNovelty=-1;
  const transcript=createHash('sha256');
  for(let i=0;i<cases;i++){
    const size=1+(random()%4),selected=new Set();
    while(selected.size<size)selected.add(random()%FAMILIES.length);
    const keys=[...selected].sort((a,b)=>a-b);
    const mutated={...original},modifiedOwners=new Set();
    for(const idx of keys){
      const [name,owner,mutate]=FAMILIES[idx];
      mutate(mutated,random());
      counts[idx]++;
      modifiedOwners.add(owner);
    }
    const failures=rejectedBecause(mutated);
    if(!failures.length){
      survivors++;
      throw Error('unrejected source mutant #'+i+' families='+keys.map(k=>FAMILIES[k][0]).join(','));
    }
    if(keys.length>1)multifamily++;
    if(modifiedOwners.size>1)crossOwner++;
    combinations.add(keys.join(','));
    for(const reason of failures){
      if(!classFirstSeen.has(reason)){classFirstSeen.set(reason,i);lastNovelty=i;}
    }
    transcript.update(String(i)).update('\0').update(keys.join(',')).update('\0');
    for(const owner of [...modifiedOwners].sort()){
      transcript.update(owner).update('\0').update(mutated[owner]).update('\0');
    }
    transcript.update(failures.join(',')).update('\n');
  }
  assert.ok(multifamily>70000,'multifamily coverage collapsed');
  assert.ok(crossOwner>60000,'cross-owner coverage collapsed');
  assert.ok(cases-lastNovelty-1>=10000,'no-novelty final window incomplete for fixed fault classes');
  return {
    schema:'ictc.derived-reticular-source-mutations.v1',authority:'none',
    seed:'0x'+seed.toString(16).padStart(8,'0'),cases,killCount:cases,survivors,
    familyCount:FAMILIES.length,perFamily:Object.fromEntries(FAMILIES.map((f,i)=>[f[0],counts[i]])),
    multifamily,crossOwner,distinctFamilyCombinations:combinations.size,
    failureClasses:[...classFirstSeen.keys()].sort(),lastNewFailureClassAt:lastNovelty,
    finalNoNewFailureClassWindow:cases-lastNovelty-1,
    originalSourceSha256:createHash('sha256').update(
      Object.keys(original).sort().map(k=>k+'\0'+original[k]).join('\0')).digest('hex'),
    mutationTranscriptSha256:transcript.digest('hex'),
    scope:'Actual ICTC production source text and owner JSON mutated in memory (1-4 families per case). No mutant was compiled, launched, run through HTTP/SQLite or browser.',
    independentlyVerifiedRuntime:false,externalE3E4Qualified:false,globalDoD:false,
    compressionBoundary:'17 fault signatures cover 18 noninterchangeable mutation owners; no global semantic-minimality claim.'
  };
}
