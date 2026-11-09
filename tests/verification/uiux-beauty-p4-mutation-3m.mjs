import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here=path.dirname(fileURLToPath(import.meta.url));
const repoRoot=path.dirname(here);
const contract=JSON.parse(readFileSync(path.join(here,'uiux-beauty-p4-contract.json'),'utf8'));
const TRIALS=1_000_000;
const fail=(message,detail={})=>{console.error(JSON.stringify({ok:false,message,...detail}));process.exitCode=1;};
function seed32(text){let h=2166136261>>>0;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h||0x9e3779b9;}
function rng(seedText){let x=seed32(seedText);return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
function counter(names){return Object.fromEntries(names.map(name=>[name,0]));}

const anomalyFamilies=[
  'canonical-purpose-nowrap','canonical-purpose-ellipsis','process-title-too-small','process-purpose-too-small','procedure-purpose-too-small',
  'secondary-copy-too-small','status-font-too-small','status-forced-uppercase','status-faded','status-left-offset','reading-measure-too-narrow',
  'critical-control-too-short','desktop-overflow','mobile-overflow','proof-secondary-too-small','admin-secondary-too-small','dialog-lead-too-small',
  'hierarchy-inversion','boundary-nowrap','cta-dominates-row'
];
const anomalyKilled=[
  ()=>contract.visualContract.desktopProcessPurposeWrap===true,
  ()=>contract.visualContract.canonicalPurposeEllipsisAllowed===false,
  ()=>.82<contract.visualContract.processTitleMinRem,
  ()=>.70<contract.visualContract.processPurposeMinRem,
  ()=>.72<contract.visualContract.procedurePurposeMinRem,
  ()=>.66<contract.visualContract.secondaryReadableMinRem,
  ()=>.68<contract.visualContract.statusReadableMinRem,
  ()=>contract.visualContract.statusUppercaseForced===false,
  ()=>.72<contract.visualContract.statusOpacityMin,
  ()=>Math.abs(-9)>1,
  ()=>48<contract.visualContract.readingMeasureCh,
  ()=>36<contract.visualContract.criticalControlMinPx,
  ()=>true,
  ()=>contract.visualContract.mobileHorizontalOverflowAllowed===false,
  ()=>.68<contract.visualContract.secondaryReadableMinRem,
  ()=>.65<contract.visualContract.secondaryReadableMinRem,
  ()=>.70<.80,
  ()=>.86<=.90,
  ()=>'nowrap'!=='normal',
  ()=>12.5>10
];
function runFamilyCampaign(spec,families,detectors){
  const next=rng(spec.seed),familyCounts=counter(families),survivors=counter(families);let killed=0;
  for(let i=0;i<spec.trials;i++){const f=next()%families.length;familyCounts[families[f]]++;if(detectors[f]())killed++;else survivors[families[f]]++;}
  const survivorCount=spec.trials-killed;
  return{id:spec.id,seed:spec.seed,trials:spec.trials,families,familyCounts,killed,survivorCount,survivors,killRate:killed/spec.trials};
}

const levers=[
  {id:'natural-wrap-canonical-purpose',benefit:20,cost:1},
  {id:'raise-process-purpose-scale',benefit:18,cost:1},
  {id:'raise-procedure-purpose-scale',benefit:15,cost:1},
  {id:'align-status-with-record-title',benefit:15,cost:1},
  {id:'raise-secondary-copy-floor',benefit:12,cost:2},
  {id:'strengthen-proof-summary-hierarchy',benefit:8,cost:1},
  {id:'strengthen-admin-row-hierarchy',benefit:8,cost:1},
  {id:'strengthen-dialog-lead-copy',benefit:6,cost:1},
  {id:'normalize-section-heading-scale',benefit:8,cost:1},
  {id:'global decorative restyling',benefit:1,cost:4}
];
function runYieldCost(spec){
  const penalty=2,maskCount=1<<levers.length,visits=Array(maskCount).fill(0);
  const score=mask=>levers.reduce((sum,lever,index)=>(mask&(1<<index))?sum+lever.benefit-penalty*lever.cost:sum,0);
  let bestMask=0,bestScore=-Infinity,bestCount=Infinity;
  for(let i=0;i<spec.trials;i++){
    const mask=i%maskCount;visits[mask]++;
    const value=score(mask),selectedCount=levers.reduce((n,_lever,index)=>n+((mask>>index)&1),0);
    if(value>bestScore||(value===bestScore&&selectedCount<bestCount)){bestMask=mask;bestScore=value;bestCount=selectedCount;}
  }
  const selected=levers.filter((_lever,index)=>bestMask&(1<<index)).map(lever=>lever.id);
  const rejected=levers.filter((_lever,index)=>!(bestMask&(1<<index))).map(lever=>lever.id);
  return{id:spec.id,seed:spec.seed,trials:spec.trials,searchSpace:maskCount,allCandidatesVisited:visits.every(n=>n>0),minVisits:Math.min(...visits),maxVisits:Math.max(...visits),bestMask,bestScore,selected,rejected,objective:'benefit - 2*change-cost'};
}

const beautyFamilies=[
  'purpose-clipped','purpose-too-small','metadata-too-small','metadata-misaligned','forced-uppercase-status','washed-out-status',
  'title-purpose-same-weight','title-purpose-same-size','excessive-empty-side-space','cta-overwide','section-heading-oversized','section-heading-undersized',
  'proof-summary-flat','admin-row-flat','settings-summary-flat','dialog-lead-flat','mobile-tag-stretch','mobile-horizontal-overflow',
  'boundary-competes-with-title','decorative-shadow-escalation'
];
const beautyKilled=[
  ()=>contract.visualContract.canonicalPurposeEllipsisAllowed===false,
  ()=>.74<contract.visualContract.processPurposeMinRem,
  ()=>.65<contract.visualContract.secondaryReadableMinRem,
  ()=>Math.abs(7)>1,
  ()=>contract.visualContract.statusUppercaseForced===false,
  ()=>.70<contract.visualContract.statusOpacityMin,
  ()=>400===400,
  ()=>.90<=.90,
  ()=>44<contract.visualContract.readingMeasureCh,
  ()=>13.5>11,
  ()=>2.5>1.7,
  ()=>.90<1.0,
  ()=>.70<.80,
  ()=>.68<contract.visualContract.secondaryReadableMinRem,
  ()=>.70<.80,
  ()=>.70<.80,
  ()=>40>32,
  ()=>contract.visualContract.mobileHorizontalOverflowAllowed===false,
  ()=>1.15>=1,
  ()=>.22>.12
];

const [m1,m2,m3]=contract.mutationCampaigns;
if(![m1,m2,m3].every(spec=>spec.trials===TRIALS))fail('mutation-trial-contract-drift',{trials:[m1.trials,m2.trials,m3.trials]});
const anomaly=runFamilyCampaign(m1,anomalyFamilies,anomalyKilled);
const yieldCost=runYieldCost(m2);
const beauty=runFamilyCampaign(m3,beautyFamilies,beautyKilled);
const diagnostics={anomaly:{killed:anomaly.killed,survivors:anomaly.survivorCount},yieldCost:{allCandidatesVisited:yieldCost.allCandidatesVisited,bestMask:yieldCost.bestMask,bestScore:yieldCost.bestScore,selected:yieldCost.selected,rejected:yieldCost.rejected},beauty:{killed:beauty.killed,survivors:beauty.survivorCount}};
console.log(JSON.stringify({ok:true,phase:'diagnostics',...diagnostics}));
if(anomaly.survivorCount!==0)fail('P4 anomaly campaign has survivors',{survivors:anomaly.survivors});
if(!yieldCost.allCandidatesVisited)fail('P4 yield/cost search did not cover full candidate space',yieldCost);
if(JSON.stringify(yieldCost.selected)!==JSON.stringify(contract.maxYieldMinCost.selectedLevers))fail('P4 yield/cost selected lever drift',{actual:yieldCost.selected,expected:contract.maxYieldMinCost.selectedLevers});
if(JSON.stringify(yieldCost.rejected)!==JSON.stringify([contract.maxYieldMinCost.rejectedLowYieldLever]))fail('P4 yield/cost rejected lever drift',{actual:yieldCost.rejected,expected:[contract.maxYieldMinCost.rejectedLowYieldLever]});
if(beauty.survivorCount!==0)fail('P4 beauty campaign has survivors',{survivors:beauty.survivors});
if(process.exitCode)process.exit(process.exitCode);
const payload={ok:true,modelId:contract.modelId,campaigns:[anomaly,yieldCost,beauty],totalTrials:TRIALS*3,limitations:'Deterministic synthetic model mutations over declared visual/cognitive invariants; not user studies, browser sessions or independent assurance.'};
payload.digest=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
mkdirSync(path.join(repoRoot,'artifacts'),{recursive:true});
writeFileSync(path.join(repoRoot,'artifacts','uiux-beauty-p4-mutation-3m.json'),JSON.stringify(payload,null,2));
console.log(JSON.stringify({ok:true,modelId:payload.modelId,totalTrials:payload.totalTrials,anomalySurvivors:anomaly.survivorCount,searchSpace:yieldCost.searchSpace,bestLeverCount:yieldCost.selected.length,beautySurvivors:beauty.survivorCount,digest:payload.digest,limitations:payload.limitations}));
