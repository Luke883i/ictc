import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const TRIALS=10_000_000;
const SEED=0xC0FFEE26;
const families=[
  ['surface-count',s=>{s.surfaceCount=12;}],
  ['procedure-count',s=>{s.procedureCount=8;}],
  ['new-presentation-owner',s=>{s.newPresentationOwner=true;}],
  ['new-business-route',s=>{s.newBusinessRoute=true;}],
  ['write-authority-change',s=>{s.writeAuthorityChange=true;}],
  ['global-final-resolver',s=>{s.globalFinalResolver=true;}],
  ['new-beauty-stylesheet',s=>{s.newBeautyStylesheet=true;}],
  ['human-decision-loss',s=>{s.humanDecision=false;}],
  ['ai-authority-promotion',s=>{s.aiAssistOnly=false;}],
  ['p5-nonblocking',s=>{s.p5Blocking=false;}],
  ['exact-head-loss',s=>{s.exactHead=false;}],
  ['governance-term-loss',s=>{s.terms.delete('governance');}],
  ['assurance-term-loss',s=>{s.terms.delete('assurance interna');}],
  ['gdpr-term-loss',s=>{s.terms.delete('GDPR');}],
  ['nis2-term-loss',s=>{s.terms.delete('NIS2');}],
  ['proposition-overflow',s=>{s.propositionLength=241;}],
  ['search-icon-loss',s=>{s.icons.delete('search');}],
  ['sparkles-icon-loss',s=>{s.icons.delete('sparkles');}],
  ['alert-icon-loss',s=>{s.icons.delete('triangle-alert');}],
  ['plain-trigger-loss',s=>{s.triggerLabel='Comandi';}],
  ['dialog-purpose-loss',s=>{s.dialogEyebrow='';}],
  ['placeholder-loss',s=>{s.placeholder='';}],
  ['typed-kinds-loss',s=>{s.typedKinds=9;}],
  ['keyboard-loss',s=>{s.keyboard=false;}],
  ['accessible-name-loss',s=>{s.accessibleName=false;}],
  ['state-detail-loss',s=>{s.stateDetail=false;}],
  ['background-drift',s=>{s.background='#ffffff';}],
  ['header-gradient-drift',s=>{s.headerGradient=false;}],
  ['footer-gradient-drift',s=>{s.footerGradient=false;}],
  ['semantic-colors-drift',s=>{s.semanticColors=false;}],
  ['native-check-loss',s=>{s.nativeCheck=false;}],
  ['native-order-inversion',s=>{s.nativeOrder=false;}]
];
assert.equal(families.length,32);

function baseline(){return{
  surfaceCount:13,procedureCount:7,newPresentationOwner:false,newBusinessRoute:false,writeAuthorityChange:false,
  globalFinalResolver:false,newBeautyStylesheet:false,humanDecision:true,aiAssistOnly:true,p5Blocking:true,exactHead:true,
  terms:new Set(['governance','assurance interna','GDPR','NIS2']),propositionLength:211,
  icons:new Set(['search','sparkles','triangle-alert']),triggerLabel:'Vai a',dialogEyebrow:'Ricerca e navigazione',
  placeholder:'Cerca processo, oggetto, fonte o evento',typedKinds:10,keyboard:true,accessibleName:true,stateDetail:true,
  background:'#eef2f6',headerGradient:true,footerGradient:true,semanticColors:true,nativeCheck:true,nativeOrder:true
};}
function violations(s){const out=[];
  if(s.surfaceCount!==13)out.push('surface-count');if(s.procedureCount!==7)out.push('procedure-count');
  if(s.newPresentationOwner)out.push('new-presentation-owner');if(s.newBusinessRoute)out.push('new-business-route');
  if(s.writeAuthorityChange)out.push('write-authority-change');if(s.globalFinalResolver)out.push('global-final-resolver');
  if(s.newBeautyStylesheet)out.push('new-beauty-stylesheet');if(!s.humanDecision)out.push('human-decision-loss');
  if(!s.aiAssistOnly)out.push('ai-authority-promotion');if(!s.p5Blocking)out.push('p5-nonblocking');if(!s.exactHead)out.push('exact-head-loss');
  for(const term of ['governance','assurance interna','GDPR','NIS2'])if(!s.terms.has(term))out.push(`term:${term}`);
  if(s.propositionLength>240)out.push('proposition-overflow');for(const icon of ['search','sparkles','triangle-alert'])if(!s.icons.has(icon))out.push(`icon:${icon}`);
  if(s.triggerLabel!=='Vai a')out.push('plain-trigger-loss');if(s.dialogEyebrow!=='Ricerca e navigazione')out.push('dialog-purpose-loss');
  if(s.placeholder!=='Cerca processo, oggetto, fonte o evento')out.push('placeholder-loss');if(s.typedKinds!==10)out.push('typed-kinds-loss');
  if(!s.keyboard)out.push('keyboard-loss');if(!s.accessibleName)out.push('accessible-name-loss');if(!s.stateDetail)out.push('state-detail-loss');
  if(s.background!=='#eef2f6')out.push('background-drift');if(!s.headerGradient)out.push('header-gradient-drift');if(!s.footerGradient)out.push('footer-gradient-drift');
  if(!s.semanticColors)out.push('semantic-colors-drift');if(!s.nativeCheck)out.push('native-check-loss');if(!s.nativeOrder)out.push('native-order-inversion');return out;}
assert.deepEqual(violations(baseline()),[],'baseline must be valid');
for(const [name,mutate] of families){const s=baseline();mutate(s);assert.ok(violations(s).length>0,`material family survived preflight: ${name}`);}

let x=SEED>>>0;function rnd(){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
const counts=new Uint32Array(families.length);let survivors=0,multi=0;const digest=createHash('sha256');
for(let i=0;i<TRIALS;i++){
  const s=baseline();const first=rnd()%families.length;families[first][1](s);counts[first]++;
  if((rnd()&3)===0){let second=rnd()%families.length;if(second===first)second=(second+1)%families.length;families[second][1](s);counts[second]++;multi++;}
  if((rnd()&15)===0){let third=rnd()%families.length;if(third===first)third=(third+7)%families.length;families[third][1](s);counts[third]++;multi++;}
  const killed=violations(s).length>0;if(!killed)survivors++;
  if((i&0x3fff)===0)digest.update(`${i}:${first}:${killed?1:0};`);
}
assert.equal(survivors,0,'P6 mutation survivors detected');for(let i=0;i<counts.length;i++)assert.ok(counts[i]>0,`unsampled family: ${families[i][0]}`);
console.log(JSON.stringify({ok:true,suite:'uiux-experience-p6-saturation-10m',seed:`0x${SEED.toString(16).toUpperCase()}`,trials:TRIALS,families:families.length,survivors,multiMutations:multi,minFamilySamples:Math.min(...counts),maxFamilySamples:Math.max(...counts),digest:digest.digest('hex'),claimBoundary:'Deterministic contract-model falsification only; not users, browser sessions, independent code mutants, human usability evidence or deployment assurance.'}));
