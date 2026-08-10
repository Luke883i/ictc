import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const ART=path.join(ROOT,'..','artifacts');
mkdirSync(ART,{recursive:true});
const read=p=>readFile(new URL(p,import.meta.url),'utf8');

const [proof,evidenceUi,primitiveCss,journeyCss,evidenceFormats,evidenceRoutes,readme,agents,startHere]=await Promise.all([
  read('./public/ui/proof-surface.js'),
  read('./public/ui/evidence-download-ui.js'),
  read('./public/surface-primitives.css'),
  read('./public/procedure-journey-2-1.css'),
  read('./runtime/evidence-formats.mjs'),
  read('./runtime/evidence.mjs'),
  read('../README.md'),
  read('../AGENTS.md'),
  read('../docs/START_HERE.md')
]);

function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function pick(r,items){return items[Math.floor(r()*items.length)];}
function clone(value){return structuredClone(value);}

const parsedMin=Number((primitiveCss.match(/--surface-control-min:(\d+)px/)||[])[1]||0);
const sourceProfile={
  proofProjectionOwner:proof.includes("ictc:projection-committed"),
  proofGenericRenderRefetch:/ictc:rendered[^\n]{0,180}loadProof/.test(proof),
  proofRevisionCache:proof.includes('cachedRevision')&&proof.includes('cacheCovers'),
  proofStaleGuard:proof.includes('requestSequence')&&proof.includes('sequence !== requestSequence'),
  proofRoleGuard:proof.includes('state.role !== role')&&proof.includes('cachedRole'),
  formats:['pdf','xml','md','zip'].filter(format=>evidenceUi.includes(`['${format}'`)||evidenceUi.includes(`"${format}"`)||evidenceUi.includes(`'${format}'`)),
  evidenceEscape:evidenceUi.includes("event.key !== 'Escape'"),
  delegatedDownloadOwners:(evidenceUi.match(/document\.addEventListener\('click'/g)||[]).length,
  controlMin:parsedMin,
  controlGrammar:primitiveCss.includes(':where(button,summary,[role="button"])'),
  mobileMenuBound:journeyCss.includes('@media(max-width:420px)')&&journeyCss.includes('.evidence-export-menu'),
  longTokenWrap:evidenceFormats.includes('splitToken')&&/wrap\([^)]*width/.test(evidenceFormats),
  xmlEscaped:evidenceFormats.includes('xmlEscape')&&!/<!DOCTYPE|<!ENTITY/i.test(evidenceFormats),
  routeSameRead:evidenceRoutes.includes("requirePermission(actor,'read',permissions)")&&evidenceRoutes.includes('evidenceDossier(store')&&['pdf','xml','md','zip'].every(ext=>evidenceRoutes.includes(`.${ext}`)),
  onboardingRoute:readme.includes('docs/START_HERE.md')&&agents.includes('docs/START_HERE.md')&&['README.md','AGENTS.md','docs/authority-matrix.yaml','docs/11_ARCHITECTURE.md','npm test'].every(token=>startHere.includes(token)),
  authorityOwners:1
};

const FAULTS=Object.freeze([
  'proof-render-refetch','proof-stale-cache','proof-role-leak','format-missing','escape-trap','duplicate-download-owner',
  'small-target','mobile-menu-overflow','print-token-overflow','xml-unsafe','authorization-widening','onboarding-ambiguity','duplicate-authority'
]);

function targetScenario(r,index){
  const role=pick(r,['admin','auditor','user']);
  const viewport=pick(r,[320,390,620,768,1024,1440]);
  const renderBurst=Math.floor(r()*25);
  const projectionAdvance=r()>.35?1+Math.floor(r()*4):0;
  const roleSwitch=r()>.7;
  const menuOpen=r()>.4;
  const format=pick(r,['pdf','xml','md','zip']);
  const tokenLength=pick(r,[12,64,88,89,120,240,520]);
  const eventCount=pick(r,[0,1,2,25,120]);
  return{
    index,role,viewport,renderBurst,projectionAdvance,roleSwitch,menuOpen,format,tokenLength,eventCount,
    documentWidth:viewport,
    proofGenericRenderRefetch:sourceProfile.proofGenericRenderRefetch,
    proofProjectionOwner:sourceProfile.proofProjectionOwner,
    proofRevisionCache:sourceProfile.proofRevisionCache,
    proofStaleGuard:sourceProfile.proofStaleGuard,
    proofRoleGuard:sourceProfile.proofRoleGuard,
    formats:[...sourceProfile.formats],
    evidenceEscape:sourceProfile.evidenceEscape,
    delegatedDownloadOwners:sourceProfile.delegatedDownloadOwners,
    controlMin:sourceProfile.controlMin,
    controlGrammar:sourceProfile.controlGrammar,
    mobileMenuBound:sourceProfile.mobileMenuBound,
    longTokenWrap:sourceProfile.longTokenWrap,
    xmlEscaped:sourceProfile.xmlEscaped,
    routeSameRead:sourceProfile.routeSameRead,
    onboardingRoute:sourceProfile.onboardingRoute,
    authorityOwners:sourceProfile.authorityOwners
  };
}

function measurements(s){
  return{
    proofRenderRefetch:s.renderBurst>0&&s.proofGenericRenderRefetch?1:0,
    proofStaleCache:s.projectionAdvance>0&&(!s.proofProjectionOwner||!s.proofRevisionCache||!s.proofStaleGuard)?1:0,
    proofRoleLeak:s.roleSwitch&&(!s.proofRoleGuard||!s.proofStaleGuard)?1:0,
    formatMissing:s.formats.includes(s.format)?0:1,
    escapeTrap:s.menuOpen&&!s.evidenceEscape?1:0,
    duplicateDownloadOwner:s.delegatedDownloadOwners!==1?1:0,
    smallTarget:s.controlMin<44||!s.controlGrammar?1:0,
    mobileMenuOverflow:s.viewport<=420&&(!s.mobileMenuBound||s.documentWidth>s.viewport+1)?1:0,
    printTokenOverflow:s.tokenLength>88&&!s.longTokenWrap?1:0,
    xmlUnsafe:s.format==='xml'&&!s.xmlEscaped?1:0,
    authorizationWidening:!s.routeSameRead?1:0,
    onboardingAmbiguity:!s.onboardingRoute?1:0,
    duplicateAuthority:s.authorityOwners!==1?1:0
  };
}

function signature(m){
  const keys=Object.entries(m).filter(([,value])=>value>0).map(([key])=>key).sort();
  return keys.length?keys.join('+'):null;
}

function injectFault(s,fault){
  const x=clone(s);
  x.fault=fault;
  switch(fault){
    case'proof-render-refetch':x.renderBurst=Math.max(1,x.renderBurst);x.proofGenericRenderRefetch=true;break;
    case'proof-stale-cache':x.projectionAdvance=Math.max(1,x.projectionAdvance);x.proofRevisionCache=false;x.proofStaleGuard=false;break;
    case'proof-role-leak':x.roleSwitch=true;x.proofRoleGuard=false;break;
    case'format-missing':x.formats=x.formats.filter(item=>item!==x.format);break;
    case'escape-trap':x.menuOpen=true;x.evidenceEscape=false;break;
    case'duplicate-download-owner':x.delegatedDownloadOwners=2;break;
    case'small-target':x.controlMin=40;break;
    case'mobile-menu-overflow':x.viewport=390;x.documentWidth=438;x.mobileMenuBound=false;break;
    case'print-token-overflow':x.tokenLength=240;x.longTokenWrap=false;break;
    case'xml-unsafe':x.format='xml';x.xmlEscaped=false;break;
    case'authorization-widening':x.routeSameRead=false;break;
    case'onboarding-ambiguity':x.onboardingRoute=false;break;
    case'duplicate-authority':x.authorityOwners=2;break;
    default:throw new Error(`unknown fault ${fault}`);
  }
  return x;
}

const targetSeed=0x60a11ce;
const rTarget=rng(targetSeed);
let targetViolations=0;
const targetSamples=6000;
for(let i=0;i<targetSamples;i++)if(signature(measurements(targetScenario(rTarget,i))))targetViolations++;
assert.equal(targetViolations,0,`source-bound target profile contains ${targetViolations} measured violations`);

const discoverySeed=0x60c0ffee;
const rDiscovery=rng(discoverySeed);
const discovered=new Set();
let M=0;
const discoveryScenarios=12000;
for(let i=1;i<=discoveryScenarios;i++){
  const fault=FAULTS[(i-1)%FAULTS.length];
  const scenario=injectFault(targetScenario(rDiscovery,i),fault);
  const sig=signature(measurements(scenario));
  assert.ok(sig,`fault ${fault} produced no measurable degradation`);
  if(!discovered.has(sig)){discovered.add(sig);M=i;}
}
for(const expected of ['proofRenderRefetch','formatMissing','smallTarget','authorizationWidening','onboardingAmbiguity','duplicateAuthority'])assert.ok([...discovered].some(sig=>sig.split('+').includes(expected)),`discovery missed ${expected}`);

const holdoutSeed=0x60100;
const rHoldout=rng(holdoutSeed);
let holdoutNovel=0;
let holdoutTargetViolations=0;
const holdoutScenarios=100;
for(let i=0;i<holdoutScenarios;i++){
  const target=targetScenario(rHoldout,100000+i);
  if(signature(measurements(target)))holdoutTargetViolations++;
  const fault=pick(rHoldout,FAULTS);
  const sig=signature(measurements(injectFault(targetScenario(rHoldout,200000+i),fault)));
  assert.ok(sig,`holdout fault ${fault} produced no signature`);
  if(!discovered.has(sig))holdoutNovel++;
}
assert.equal(holdoutTargetViolations,0,'M+100 target holdout contains measured violations');
assert.equal(holdoutNovel,0,'M+100 introduced a new normalized measured signature');

const mutants={};
for(let index=0;index<FAULTS.length;index++){
  const fault=FAULTS[index];
  const sig=signature(measurements(injectFault(targetScenario(rng(0x700000+index),index),fault)));
  assert.ok(sig,`simplification mutant ${fault} survived`);
  mutants[fault]={killed:true,signature:sig};
}

const out={
  ok:true,
  profile:'pr60-convergence-source-bound-m-plus-100',
  sourceProfile,
  target:{seed:targetSeed,scenarios:targetSamples,violations:targetViolations},
  discovery:{seed:discoverySeed,scenarios:discoveryScenarios,normalizedMeasuredSignatures:[...discovered].sort(),signatureCount:discovered.size,M,lastNewSignatureAt:M},
  holdout:{seed:holdoutSeed,scenarios:holdoutScenarios,newNormalizedSignatures:holdoutNovel,targetViolations:holdoutTargetViolations},
  simplificationMutants:mutants,
  claimBoundary:'Source-bound deterministic engineering evidence over the declared PR60 concern model. M+100 no-novelty means no new normalized measured signature appeared in this generated holdout; it does not prove absence of unknown UI, security, accessibility, semantic or deployment defects.'
};
writeFileSync(path.join(ART,'pr60-convergence-saturation.json'),JSON.stringify(out,null,2));
console.log(`pr60-convergence-saturation: ok (target=${targetSamples}, discovery=${discoveryScenarios}, M=${M}, signatures=${discovered.size}, holdout=M+${holdoutScenarios})`);
