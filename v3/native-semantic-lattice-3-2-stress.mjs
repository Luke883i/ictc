import { EXPERIENCE_PHASES, EXPECTED_EXPERIENCE_PARTICIPANTS, analyzeExperienceParticipants, orderExperienceParticipants } from './public/ui/experience-constitution.js';

const TRIALS=1_000_000,SEED=0x3200c01;
function xorshift(v){v^=v<<13;v^=v>>>17;v^=v<<5;return v>>>0;}
function baseParticipants(){return EXPECTED_EXPERIENCE_PARTICIPANTS.map(row=>({...row,render(){}}));}
function shuffle(rows,seed){const out=[...rows];for(let i=out.length-1;i>0;i--){seed=xorshift(seed);const j=seed%(i+1);[out[i],out[j]]=[out[j],out[i]];}return[out,seed];}
function mutant(rows,family){const out=rows.map(row=>({...row}));switch(family){case 0:out[1].phase='annotation';break;case 1:out[1].authority='control-annotation';break;case 2:out[1].exclusive=false;break;case 3:out.push({...out[1],render(){}});break;case 4:out[0].exclusive=true;break;}return out;}
let seed=SEED,signature=2166136261,validExecutions=0,invalidExecutions=0;const mutationHits=new Uint32Array(5);const expectedOrder=EXPERIENCE_PHASES.join('>');
for(let i=0;i<TRIALS;i++){
  const base=baseParticipants();let rows;[rows,seed]=shuffle(base,seed);
  if((seed&7)===0){const family=seed%mutationHits.length,mutated=mutant(rows,family),failures=analyzeExperienceParticipants(mutated);mutationHits[family]++;invalidExecutions++;if(!failures.length)throw new Error(`constitution mutant escaped family=${family}`);signature=Math.imul(signature^family^failures.length^seed,16777619)>>>0;continue;}
  const ordered=orderExperienceParticipants(rows),order=ordered.map(x=>x.phase).join('>');if(order!==expectedOrder)throw new Error(`C0.1 phase drift: ${order}`);if(ordered.map(x=>x.id).join('|')!==EXPECTED_EXPERIENCE_PARTICIPANTS.map(x=>x.id).join('|'))throw new Error('C0.1 participant order drift');validExecutions++;signature=Math.imul(signature^ordered.length^seed,16777619)>>>0;
}
if(mutationHits.some(x=>x===0))throw new Error(`constitution mutation family uncovered: ${[...mutationHits]}`);
console.log(JSON.stringify({ok:true,profile:'native-semantic-lattice-3.2-constitution-stress',trials:TRIALS,codeBoundAuthority:'v3/public/ui/experience-constitution.js',validExecutions,invalidExecutions,mutationFamilies:mutationHits.length,mutationHits:[...mutationHits],c01Order:EXPERIENCE_PHASES,signature,limitations:['Code-bound deterministic stress of the executable C0.1 participant ordering/validation contract.','Not one million browser event replays and not evidence of human usability, legal compliance or deployment assurance.','Browser journeys and exact-head GitHub CI remain separate runtime acceptance evidence.']},null,2));
