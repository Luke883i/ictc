/** Canonical declared-step denominator; a path appearing in a test is not execution evidence. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {root} from './repository-inventory.mjs';
const source='docs/04_USER_JOURNEYS.md';
const text=readFileSync(join(root,source),'utf8');
const headings=[...text.matchAll(/^##\s+((?:RN|EC|AO|MC|AP|RC|AR)-01)([^\n]*)$/gm)];
if(headings.length!==9||new Set(headings.map(x=>x[1])).size!==7)throw Error('journey document changed: must review E2E denominator');
const journeys=headings.map((h,i)=>{
 const next=headings[i+1]?.index??text.length;const segment=text.slice(h.index+h[0].length,next);
 const steps=[...segment.matchAll(/^(\d+)\.\s+(.+)$/gm)].map(x=>({number:Number(x[1]),description:x[2].trim(),e2eStatus:'NOT_ATTESTED',reason:'No exact-step setup/action/human decision/persistence/readback/receipt linked to an executed test at this HEAD'}));
 if(!steps.length||steps.some((s,j)=>s.number!==j+1))throw Error('ambiguous journey numbering: '+h[0]);
 return {id:h[1],scenario:h[2].trim().replace(/^·\s*/,''),source,steps};
});
const total=journeys.reduce((n,j)=>n+j.steps.length,0);
const result={schema:'ictc-journey-e2e-denominator/v1',source,journeys:journeys.length,processes:new Set(journeys.map(j=>j.id)).size,declaredStepDenominator:total,fullStepRuntimeAttestations:0,fullStepCoveragePercentage:0,scopedReadbackWitness:{test:'v3/e2e-coverage-7x3-check.mjs',cells:21,semantics:'process x role projection only; deliberately not mapped to workflow steps'},globalProductE2ECoverage:null,
 status:'OPEN_NOT_GLOBALLY_PROVEN',claimBoundary:'Counts numbered steps for nine documented journey variants (7 processes); not exhaustive of all UI, roles, branches, APIs, deployments or negative outcomes. The 0 attested here is an evidence-mapping deficit, NOT an assertion that no separate test exercises these steps. Require independent exact-head step-level runtime receipts for numerator.',details:journeys};
mkdirSync(join(root,'artifacts'),{recursive:true});writeFileSync(join(root,'artifacts/e2e-journey-denominator.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,processes:result.processes,journeys:result.journeys,steps:total,fullStepAttestations:0,globalProductE2ECoverage:null}));
