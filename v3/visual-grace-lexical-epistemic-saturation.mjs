import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ART = path.join(ROOT, '..', 'artifacts');
mkdirSync(ART, { recursive: true });
const read = p => readFile(new URL(p, import.meta.url), 'utf8');

const [index,copy,frame,router,primitives,proof,css,anatomy,epistemic,controller,contractsRaw,meta,standardRaw,doc] = await Promise.all([
  read('./public/index.html'), read('./public/ui/product-copy.js'), read('./public/ui/procedure-frame.js'),
  read('./public/ui/surface-router.js'), read('./public/ui/surface-primitives.js'), read('./public/ui/proof-surface.js'),
  read('./public/onto-compliance-v1.css'), read('./public/ui/procedure-anatomy.js'), read('./public/ui/epistemic-lattice.js'),
  read('./public/ui/controller.js'), read('./procedure-contracts-1-2.json'), read('./runtime/meta-procedure-contracts.mjs'),
  read('./standard-proof-1-6-contract.json'), read('../docs/VISUAL_GRACE_LEXICAL_EPISTEMIC_AUDIT.md')
]);
const contracts = JSON.parse(contractsRaw);
const standard = JSON.parse(standardRaw);

const source = Object.freeze({
  visual: {
    readablePurpose: css.includes('font-size:.78rem'),
    readableKicker: css.includes('font-size:.64rem'),
    minTargets44: css.includes('min-height:44px'),
    boundedMeasure: css.includes('max-width:68ch'),
    noHoverLift: css.includes('.procedure-card:hover{') && css.includes('transform:none'),
    noFrameBlob: css.includes('.procedure-frame::after{display:none}'),
    responsiveGrid: css.includes('grid-template-columns:repeat(2,minmax(0,1fr))') && css.includes('grid-template-columns:1fr'),
    noOverflowMask: !css.includes('body{overflow-x:hidden}'),
    proofMethodStyled: css.includes('.proof-method-list') && css.includes('.proof-method-list li'),
    neutralObservation: css.includes('.procedure-state.ready') && css.includes('background:#f1f4f8'),
    restrainedFrame: css.includes('background:var(--color-surface)') && css.includes('box-shadow:var(--elevation-rest)')
  },
  lexical: {
    shellProcesses: index.includes('>Processi di Compliance</button>'),
    shellPosture: index.includes('>Postura ICTC</button>'),
    processHeading: index.includes('<h1>Processi di Compliance</h1>'),
    canonicalCopyOwner: copy.includes("processes:'Processi di Compliance'") && copy.includes("proof:'Postura ICTC'"),
    frameSingular: frame.includes('process-code') && !frame.includes('<span>Processo di Compliance</span>'),
    framePurpose: frame.includes('procedure-purpose') && !frame.includes('<b>Scopo del processo</b>'),
    frameSignals: frame.includes('aria-label="Segnali del processo"') && frame.includes('metric.label'),
    auditorPlainRead: frame.includes('Consulta registrazioni'),
    contextCanonical: primitives.includes('>Processi</button>') && primitives.includes('EP-01') && !primitives.includes('>Processi di Compliance</button>'),
    backCanonical: router.includes('SURFACE_LABELS.processes'),
    proofCanonical: proof.includes('7 Processi di Compliance') && !proof.includes('Procedure con decisioni'),
    retiredFrameAbsent: !['<span>Procedura</span>','<b>Scopo della procedura</b>','Segnali della procedura','Consulta record'].some(x => frame.includes(x))
  },
  epistemic: {
    sevenProcesses: contracts.procedures.length === 7,
    codesStable: contracts.procedures.map(x=>x.code).join('|') === 'RN-01|EC-01|AO-01|MC-01|AP-01|RC-01|AR-01',
    epCrossCutting: meta.includes("code:'EP-01'") && meta.includes('businessProcess:false') && meta.includes('crossCutting:true'),
    commonFamilies: anatomy.includes('commonSubstrate?.epistemicFamilies'),
    claimBoundaryVisible: anatomy.includes('c.claimBoundary'),
    traceAfterWork: anatomy.includes('anchor.after(box)') && !anatomy.includes('host.prepend(box)'),
    humanEvidenceEverywhere: contracts.procedures.every(x => Array.isArray(x.humanCheckpoints) && x.humanCheckpoints.length && Array.isArray(x.evidence) && x.evidence.length && x.claimBoundary),
    proposedDistinct: epistemic.includes('Letture proposte') && epistemic.includes('loadedStateRevision') && epistemic.includes('requestedRevision') && epistemic.includes('loadSequence'),
    projectionCommit: controller.includes('ictc:projection-committed') && controller.includes('ictcProjectionRevision'),
    proofMethodVisible: proof.includes('Come ICTC dimostra la propria postura') && proof.includes('data.proof?.evidenceKinds') && proof.includes('data.proof?.rule'),
    standardsBounded: standard.benchmarkFamilies.every(x => x.ictcPractice && Array.isArray(x.evidence) && x.evidence.length && x.limit),
    noCertificationUpgrade: proof.includes('<b>Limite.</b>') && !/percentuale di conformit|certificat[oa]\s*ictc/i.test(proof),
    docBoundary: doc.includes('bounded') || doc.includes('finite declared scenario space')
  }
});

const DIMENSIONS = Object.freeze({
  role:['admin','user','auditor'],
  process:['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01'],
  viewport:['390x844','768x1024','1280x900','1600x1000'],
  density:['empty','sparse','normal','dense','very-dense'],
  stage:['entry','work','review','decision','closed-looking'],
  epistemicStatus:['observed','proposed','reviewed','decided','stale'],
  navigation:['home','process-hub','history','deep-link'],
  evidenceDepth:['none','summary','trace','dossier','external-attestation'],
  aiMode:['off','configured','human-on-proposed'],
  inputMorphology:['short','long-prose','long-token','mixed-id','unicode'],
  interaction:['pointer','keyboard','reduced-motion'],
  crossProcess:['none','linked-source','linked-action','linked-risk'],
  copyLength:['short','medium','long'],
  projection:['fresh','stale-response','revision-advance'],
  assuranceDepth:['snapshot','method','runtime','standards','export']
});

const FAULTS = Object.freeze({
  visual:['tiny-purpose','tiny-kicker','small-target','unbounded-measure','hover-lift','frame-blob','desktop-grid-on-mobile','overflow-mask','unstyled-proof-method','success-observation','decorative-frame'],
  lexical:['nav-processes-short','nav-evidence','heading-procedures','copy-owner-split','frame-meta-duplication','purpose-meta-duplication','old-signals','auditor-record','context-title-duplication','back-hardcoded','proof-procedure','retired-frame'],
  epistemic:['eighth-business-process','code-drift','ep-business-leak','families-hidden','boundary-hidden','trace-before-work','missing-human-evidence','proposal-blur','projection-split','proof-method-hidden','unbounded-standard','certification-upgrade','global-proof-claim']
});

function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function pick(r, xs){return xs[Math.floor(r()*xs.length)];}
function scenario(r){const out={};for(const [k,v] of Object.entries(DIMENSIONS))out[k]=pick(r,v);return out;}
function clone(x){return structuredClone(x);}

function inject(profile,family,fault){const p=clone(profile);const f=p[family];
  const maps={
    visual:{'tiny-purpose':'readablePurpose','tiny-kicker':'readableKicker','small-target':'minTargets44','unbounded-measure':'boundedMeasure','hover-lift':'noHoverLift','frame-blob':'noFrameBlob','desktop-grid-on-mobile':'responsiveGrid','overflow-mask':'noOverflowMask','unstyled-proof-method':'proofMethodStyled','success-observation':'neutralObservation','decorative-frame':'restrainedFrame'},
    lexical:{'nav-processes-short':'shellProcesses','nav-evidence':'shellPosture','heading-procedures':'processHeading','copy-owner-split':'canonicalCopyOwner','frame-meta-duplication':'frameSingular','purpose-meta-duplication':'framePurpose','old-signals':'frameSignals','auditor-record':'auditorPlainRead','context-title-duplication':'contextCanonical','back-hardcoded':'backCanonical','proof-procedure':'proofCanonical','retired-frame':'retiredFrameAbsent'},
    epistemic:{'eighth-business-process':'sevenProcesses','code-drift':'codesStable','ep-business-leak':'epCrossCutting','families-hidden':'commonFamilies','boundary-hidden':'claimBoundaryVisible','trace-before-work':'traceAfterWork','missing-human-evidence':'humanEvidenceEverywhere','proposal-blur':'proposedDistinct','projection-split':'projectionCommit','proof-method-hidden':'proofMethodVisible','unbounded-standard':'standardsBounded','certification-upgrade':'noCertificationUpgrade','global-proof-claim':'docBoundary'}
  };
  const key=maps[family][fault];if(!key)throw new Error(`${family}:${fault}`);f[key]=false;return p;
}

function applicable(family,key,s){
  if(family==='visual' && key==='responsiveGrid')return ['390x844','768x1024'].includes(s.viewport);
  if(family==='visual' && key==='minTargets44')return s.interaction!=='pointer'||s.viewport==='390x844';
  if(family==='visual' && key==='proofMethodStyled')return s.assuranceDepth==='method'||s.assuranceDepth==='standards';
  if(family==='lexical' && key==='auditorPlainRead')return s.role==='auditor';
  if(family==='lexical' && key==='proofCanonical')return ['snapshot','method','standards'].includes(s.assuranceDepth);
  if(family==='epistemic' && key==='proposedDistinct')return s.epistemicStatus==='proposed'||s.aiMode==='human-on-proposed';
  if(family==='epistemic' && key==='projectionCommit')return s.projection!=='fresh';
  if(family==='epistemic' && ['proofMethodVisible','standardsBounded','noCertificationUpgrade'].includes(key))return ['method','standards'].includes(s.assuranceDepth);
  return true;
}
function violations(profile,family,s){const out=[];for(const [key,value] of Object.entries(profile[family]))if(!value&&applicable(family,key,s))out.push(`${family}:${key}`);return out;}

const targetViolations={};
for(const family of Object.keys(FAULTS)){
  const r=rng(0x71c700 + Object.keys(targetViolations).length*0x301);
  let count=0;const samples=[];
  for(let i=0;i<10000;i++){const s=scenario(r),v=violations(source,family,s);count+=v.length;if(v.length&&samples.length<5)samples.push({i,s,v});}
  assert.equal(count,0,`${family} source target violates declared invariants`);
  targetViolations[family]={scenarios:10000,violations:count,samples};
}

const mutants={};
for(const [family,faults] of Object.entries(FAULTS)){
  mutants[family]={};
  for(const fault of faults){
    const mutated=inject(source,family,fault);let killed=false;let signature=null;const r=rng(0x5eed00+fault.length*37+family.length*101);
    for(let i=0;i<2000&&!killed;i++){const s=scenario(r),v=violations(mutated,family,s);if(v.length){killed=true;signature=v[0];}}
    assert.ok(killed,`mutant escaped detector: ${family}:${fault}`);
    mutants[family][fault]={killed,signature};
  }
}

const saturation={};
for(const [family,faults] of Object.entries(FAULTS)){
  const familyIndex=Object.keys(saturation).length;
  const discoverySeed=0xa71100+familyIndex*0x1001,holdoutSeed=0xb82200+familyIndex*0x1103;
  const r=rng(discoverySeed),seen=new Set(),coverage=Object.fromEntries(Object.entries(DIMENSIONS).map(([k])=>[k,new Set()]));let M=0;
  const discovery=60000;
  for(let i=1;i<=discovery;i++){
    const s=scenario(r);for(const [k,v] of Object.entries(s))coverage[k].add(v);
    const fault=r()<0.72?pick(r,faults):null;
    const profile=fault?inject(source,family,fault):source;
    for(const sig of violations(profile,family,s))if(!seen.has(sig)){seen.add(sig);M=i;}
  }
  for(const [k,values] of Object.entries(DIMENSIONS))assert.equal(coverage[k].size,values.length,`${family} discovery missed ${k} values`);
  assert.equal(seen.size,Object.keys(source[family]).length,`${family} discovery did not expose every declared violation class`);

  const hold=rng(holdoutSeed);let newSignatures=0,holdoutTargetViolations=0;const holdout=10000;
  for(let i=1;i<=holdout;i++){
    const s=scenario(hold);
    holdoutTargetViolations+=violations(source,family,s).length;
    const fault=hold()<0.72?pick(hold,faults):null;
    const profile=fault?inject(source,family,fault):source;
    for(const sig of violations(profile,family,s))if(!seen.has(sig)){newSignatures++;seen.add(sig);}
  }
  assert.equal(holdoutTargetViolations,0,`${family} M+10000 target violation`);
  assert.equal(newSignatures,0,`${family} M+10000 introduced a new normalized anomaly signature`);
  saturation[family]={discovery,discoverySeed,M,normalizedSignatureCount:seen.size,holdout,holdoutSeed,newSignatures,targetViolations:holdoutTargetViolations,dimensionCoverage:Object.fromEntries(Object.entries(coverage).map(([k,v])=>[k,[...v].sort()]))};
}

const out={
  ok:true,
  profile:'visual-grace-lexical-epistemic-m-plus-10000',
  source,
  dimensions:DIMENSIONS,
  targetViolations,
  mutants,
  saturation,
  totalRandomizedScenarios:Object.values(saturation).reduce((n,x)=>n+x.discovery+x.holdout,0)+Object.values(targetViolations).reduce((n,x)=>n+x.scenarios,0),
  claimBoundary:'Bounded, reproducible engineering evidence over finite declared visual, lexical and epistemic observables. Randomized scenario pressure and M+10000 no-novelty do not prove absence of unknown defect classes, legal compliance, certification, universal usability, or semantic correctness of arbitrary programs.'
};
writeFileSync(path.join(ART,'visual-grace-lexical-epistemic-saturation.json'),JSON.stringify(out,null,2));
console.log(`visual-grace-lexical-epistemic-saturation: ok families=${Object.keys(saturation).length} randomized=${out.totalRandomizedScenarios} holdout=10000/family`);
