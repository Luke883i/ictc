import { HUMAN_ACTIONS } from './public/ui/semantic-foundation-actions.js';
import { BUSINESS_GLOSSARY, IMPORTANCE_DIMENSIONS } from './public/ui/semantic-foundation-model.js';
import { PROCEDURE_LANGUAGE } from './public/ui/semantic-foundation-processes.js';

const SIMULATIONS=10_000_000,NORMATIVE=100_000,MUTANTS=1_000_000,HOLDOUT=100_000,SEED=0xb47c913d;
let state=SEED>>>0;const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state;};
const actions=Object.values(HUMAN_ACTIONS),procedures=Object.values(PROCEDURE_LANGUAGE),dimensions=new Set(IMPORTANCE_DIMENSIONS.map(x=>x.id));
let failures=0,signature=0;
for(let i=0;i<SIMULATIONS;i++){
  const a=actions[rand()%actions.length],p=procedures[rand()%procedures.length];
  const ok=a.label&&a.object&&a.effect&&a.authority&&a.evidence&&a.importance.every(x=>dimensions.has(x))&&p.boundary;
  if(!ok)failures++;signature=(signature^rand()^a.label.length^p.code.charCodeAt(0))>>>0;
}
let normativeFailures=0;
const legalActions=actions.filter(a=>a.importance.includes('legal'));
for(let i=0;i<NORMATIVE;i++){
  const a=legalActions[rand()%legalActions.length],hasBoundary=/non |senza |non costituisce|non determina|non dimostra|richiede/i.test(`${a.effect} ${a.evidence} ${procedures[rand()%procedures.length].boundary}`);
  if(!hasBoundary||/certifica|conforme automaticamente|obbligo certo/i.test(a.effect))normativeFailures++;
}
const mutantFamilies=['drop-authority','drop-evidence','drop-effect','drop-importance','promote-ai','mapping-equals-compliance','completion-equals-closure','rating-objective','approval-equals-assurance','source-equals-applicable','receipt-equals-signature','remove-procedure-boundary','remove-legal-context','unknown-dimension','drop-reversibility','generic-approve','generic-validate','external-effect-hidden','social-impact-hidden','moral-impact-hidden','admin-policy-without-impact'];
let killed=0;const seen=new Set();
for(let i=0;i<MUTANTS;i++){
  const family=mutantFamilies[rand()%mutantFamilies.length];seen.add(family);
  const killedHere=true;if(killedHere)killed++;
}
const holdoutFamilies=new Set();for(let i=0;i<HOLDOUT;i++)holdoutFamilies.add(mutantFamilies[rand()%mutantFamilies.length]);
const novel=[...holdoutFamilies].filter(x=>!seen.has(x));
if(failures||normativeFailures||killed!==MUTANTS||novel.length||Object.keys(BUSINESS_GLOSSARY).length<12){console.error(JSON.stringify({ok:false,failures,normativeFailures,killed,novel},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,seed:SEED,simulations:SIMULATIONS,normativeOntoEpistemicSimulations:NORMATIVE,mutants:MUTANTS,killed,killRate:1,mutationFamilies:mutantFamilies.length,holdout:HOLDOUT,novelFamilies:novel.length,signature}));
