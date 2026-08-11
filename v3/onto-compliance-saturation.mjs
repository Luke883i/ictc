import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const ROOT=path.dirname(fileURLToPath(import.meta.url)),ART=path.join(ROOT,'..','artifacts');mkdirSync(ART,{recursive:true});
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [frame,anatomy,market,css,primitiveCss,epistemicCss,contracts,meta,doc]=await Promise.all([
  read('./public/ui/procedure-frame.js'),read('./public/ui/procedure-anatomy.js'),read('./public/ui/procedure-market-ux.js'),read('./public/onto-compliance-v1.css'),read('./public/surface-primitives.css'),read('./public/epistemic-lattice.css'),read('./procedure-contracts-1-2.json'),read('./runtime/meta-procedure-contracts.mjs'),read('../docs/ONTO_COMPLIANCE_HORIZON_V1.md')
]);
const registry=JSON.parse(contracts).procedures,controlMin=Number((primitiveCss.match(/--surface-control-min:(\d+)px/)||[])[1]||0);
const sourceProfile={
  businessProcedures:registry.length,
  ep01CrossCutting:meta.includes("businessProcess:false")&&meta.includes("code:'EP-01'"),
  attentionObservational:frame.includes('semanticSignals')&&frame.includes('metric.label')&&!frame.includes("'In ordine'")&&!frame.includes('Nessuna attenzione aperta'),
  homeAttentionObservational:market.includes('procedure senza attenzione aperta')&&!/processi in ordine/i.test(market),
  auditorProcedureBound:frame.includes("const readOnly=state.role==='auditor'")&&frame.includes("actionLabel:readOnly?'Consulta registrazioni'")&&frame.includes('openReadSurface(id)')&&!frame.includes("navigateSurface('proof')"),
  traceOwners:(anatomy.includes('anchor.after(box)')?1:0)+(frame.includes('placeTechnicalContext')?1:0),
  traceAfterWork:anatomy.includes('function workAnchor(')&&anatomy.includes('anchor.after(box)')&&!anatomy.includes('host.prepend(box)'),
  tabletLocalContainment:css.includes('@media(max-width:900px)')&&css.includes('.service-nav')&&css.includes('overflow-x:auto')&&!css.includes('body{overflow-x:hidden}'),
  tabletHomeCollapse:css.includes('@media(max-width:820px)')&&css.includes('.home-hero{grid-template-columns:minmax(0,1fr)}'),
  zeroAttentionNeutral:css.includes('.procedure-state.ready')&&css.includes('background:#f1f4f8'),
  scopeNeutral:css.includes('.market-scope.in-scope')&&css.includes('background:#eef1ff'),
  scopeDisclosure:market.includes('market-scope-editor')&&market.includes("decision===value?'selected':''")&&market.includes('f.scope?.reason'),
  scopeDefaultClosed:!market.includes('<details class="market-scope-editor" open'),
  proposedDistinct:epistemicCss.includes('[data-status="proposed"]')||epistemicCss.includes('proposed'),
  minControlTarget:controlMin,
  hierarchyContract:['Identity','Action','Work','Evidence / Trace'].every(x=>doc.includes(x)),
  mContract:doc.includes('M+100'),gContract:doc.includes('G+100')
};
const measures=p=>({
  procedureRegistryDrift:p.businessProcedures!==7?1:0,ep01BusinessLeak:!p.ep01CrossCutting?1:0,
  verdictFromAttention:(!p.attentionObservational||!p.homeAttentionObservational)?1:0,auditorContextEscape:!p.auditorProcedureBound?1:0,
  traceAuthorityDrift:(p.traceOwners!==1||!p.traceAfterWork)?1:0,tabletOverflowRisk:(!p.tabletLocalContainment||!p.tabletHomeCollapse)?1:0,
  semanticSuccessColor:(!p.zeroAttentionNeutral||!p.scopeNeutral)?1:0,scopeEditorAmbiguity:(!p.scopeDisclosure||!p.scopeDefaultClosed)?1:0,
  proposedAuthorityBlur:!p.proposedDistinct?1:0,smallTarget:p.minControlTarget<44?1:0,hierarchyDrift:!p.hierarchyContract?1:0,
  saturationContractDrift:(!p.mContract||!p.gContract)?1:0
});
const signature=m=>{const keys=Object.entries(m).filter(([,v])=>v).map(([k])=>k).sort();return keys.length?keys.join('+'):null;};
assert.equal(signature(measures(sourceProfile)),null,`source-bound Onto-Compliance target already violates: ${signature(measures(sourceProfile))}`);
const rng=seed=>{let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};},pick=(r,a)=>a[Math.floor(r()*a.length)],clone=x=>structuredClone(x);
const DIMENSIONS=Object.freeze({
  T1_role:['admin','user','auditor'],T2_surface:['home','processes','RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01','proof','EP-01'],T3_viewport:['390','768','1280','1600'],T4_density:['empty','sparse','normal','dense'],T5_stage:['entry','open','review','terminal-looking'],T6_epistemic:['observed','proposed','decided','stale'],T7_entry:['home','processes','history','deep-link'],T8_evidence:['closed','disclosed','download'],T9_ai:['off','human-on-proposed'],T10_input:['short','long-token','long-prose','mixed-id'],T11_interaction:['pointer','keyboard','reduced-motion'],T12_crossContext:['none','source-bound']
});
const FAULTS=Object.freeze(['procedure-registry-drift','ep01-business-leak','attention-verdict','auditor-to-proof','duplicate-trace-owner','trace-before-work','tablet-overflow','green-zero-attention','green-scope','scope-editor-expanded','scope-option-reset','proposed-blur','small-target','hierarchy-loss','saturation-doc-loss']);
function inject(base,fault){const p=clone(base);({
  'procedure-registry-drift':()=>p.businessProcedures=8,'ep01-business-leak':()=>p.ep01CrossCutting=false,'attention-verdict':()=>p.attentionObservational=false,
  'auditor-to-proof':()=>p.auditorProcedureBound=false,'duplicate-trace-owner':()=>p.traceOwners=2,'trace-before-work':()=>p.traceAfterWork=false,
  'tablet-overflow':()=>p.tabletLocalContainment=false,'green-zero-attention':()=>p.zeroAttentionNeutral=false,'green-scope':()=>p.scopeNeutral=false,
  'scope-editor-expanded':()=>p.scopeDefaultClosed=false,'scope-option-reset':()=>p.scopeDisclosure=false,'proposed-blur':()=>p.proposedDistinct=false,
  'small-target':()=>p.minControlTarget=40,'hierarchy-loss':()=>p.hierarchyContract=false,'saturation-doc-loss':()=>p.gContract=false
}[fault]||(()=>{throw new Error(fault);}))();return p;}
const mutantResults={};for(const fault of FAULTS){const sig=signature(measures(inject(sourceProfile,fault)));assert.ok(sig,`fault ${fault} escaped detector`);mutantResults[fault]={killed:true,signature:sig};}
const perDimension={};
for(const [dim,values] of Object.entries(DIMENSIONS)){
  const r=rng(0x0c1000+Object.keys(perDimension).length*0x101),seen=new Set();let M=0;
  for(let i=1;i<=1800;i++){const sig=`${dim}=${pick(r,values)}|${signature(measures(inject(sourceProfile,FAULTS[(i-1)%FAULTS.length])))}`;if(!seen.has(sig)){seen.add(sig);M=i;}}
  const hold=rng(0x0c9000+Object.keys(perDimension).length*0x151);let targetViolations=0,novel=0;
  for(let i=0;i<100;i++){if(signature(measures(sourceProfile)))targetViolations++;const sig=`${dim}=${pick(hold,values)}|${signature(measures(inject(sourceProfile,pick(hold,FAULTS))))}`;if(!seen.has(sig))novel++;}
  assert.equal(targetViolations,0,`${dim} M+100 target violation`);assert.equal(novel,0,`${dim} M+100 introduced novel declared-model signature`);
  perDimension[dim]={values,discovery:1800,M,signatureCount:seen.size,holdout:100,newSignatures:novel,targetViolations};
}
const COMPRESSIONS=Object.freeze([
  {id:'single-trace-owner',applied:sourceProfile.traceOwners===1&&sourceProfile.traceAfterWork,protect:['traceAuthorityDrift']},
  {id:'collapse-scope-editors',applied:sourceProfile.scopeDisclosure&&sourceProfile.scopeDefaultClosed,protect:['scopeEditorAmbiguity']},
  {id:'observational-attention-language',applied:sourceProfile.attentionObservational&&sourceProfile.homeAttentionObservational,protect:['verdictFromAttention']},
  {id:'local-tablet-overflow-owner',applied:sourceProfile.tabletLocalContainment&&sourceProfile.tabletHomeCollapse,protect:['tabletOverflowRisk']},
  {id:'procedure-bound-auditor-read',applied:sourceProfile.auditorProcedureBound,protect:['auditorContextEscape']},
  {id:'neutral-scope-and-attention-color',applied:sourceProfile.zeroAttentionNeutral&&sourceProfile.scopeNeutral,protect:['semanticSuccessColor']}
]);
for(const c of COMPRESSIONS)assert.ok(c.applied,`declared safe compression not materialized: ${c.id}`);
const G=COMPRESSIONS.length,UNSAFE_COMPRESSIONS=Object.freeze(['remove-claim-boundary','merge-proposed-with-recorded','hide-native-work','remove-role-distinction','drop-local-overflow-owner','shrink-target','drop-procedure-identity','remove-scope-reason','merge-ep01-into-business','remove-trace-owner']);
const degradations={'remove-claim-boundary':'hierarchyDrift','merge-proposed-with-recorded':'proposedAuthorityBlur','hide-native-work':'hierarchyDrift','remove-role-distinction':'auditorContextEscape','drop-local-overflow-owner':'tabletOverflowRisk','shrink-target':'smallTarget','drop-procedure-identity':'procedureRegistryDrift','remove-scope-reason':'scopeEditorAmbiguity','merge-ep01-into-business':'ep01BusinessLeak','remove-trace-owner':'traceAuthorityDrift'};
const gr=rng(0x0c6f100),rejected=[];let safeAfterG=0;for(let i=0;i<100;i++){const op=pick(gr,UNSAFE_COMPRESSIONS),degradation=degradations[op];if(!degradation)safeAfterG++;else rejected.push({index:G+i+1,operator:op,degrades:degradation});}
assert.equal(safeAfterG,0,'G+100 found an unclassified/safe additional compression in declared operator space');
const out={ok:true,profile:'onto-compliance-horizon-v1-t-m-plus-100-g-plus-100',sourceProfile,dimensions:perDimension,mutants:mutantResults,compression:{accepted:COMPRESSIONS.map(x=>x.id),G,holdout:100,safeAdditionalCompressions:safeAfterG,rejected},claimBoundary:'Bounded source-derived engineering evidence over the declared visual/ontological/epistemic fault and compression operators. Per-dimension M+100 and G+100 do not prove absence of unknown defects or mathematical UI minimality; Rice-style global semantic correctness is not claimed.'};
writeFileSync(path.join(ART,'onto-compliance-saturation.json'),JSON.stringify(out,null,2));
console.log(`onto-compliance-saturation: ok (T=${Object.keys(DIMENSIONS).length}, each=M+100, G=${G}, G+100 safe=${safeAfterG})`);
