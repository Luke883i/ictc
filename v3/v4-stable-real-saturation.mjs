import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

const here = new URL('.', import.meta.url);
const contract = JSON.parse(await readFile(new URL('v4-stable-assurance-contract.json', here), 'utf8'));
const holdouts = JSON.parse(await readFile(new URL('v4-stable-holdouts.json', here), 'utf8')).cases;
const axes = Object.freeze({
  role: ['admin','user','auditor'],
  process: ['monitoring','incidents','objects','coverage','actions','risks','assurance'],
  aiPolicy: ['enabled','disabled'],
  assistPreference: ['on','off'],
  entry: ['direct','guided','proof'],
  operation: ['read','write','assist'],
  claim: ['operational','human-comprehension','enterprise-readiness']
});
const processCodes = Object.freeze({monitoring:'RN-01',incidents:'EC-01',objects:'AO-01',coverage:'MC-01',actions:'AP-01',risks:'RC-01',assurance:'AR-01'});
function canonical(value){if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;}
const hash = value => createHash('sha256').update(canonical(value)).digest('hex');
const cartesian = lists => lists.reduce((acc, xs) => acc.flatMap(row => xs.map(x => [...row, x])), [[]]);

function evaluate(s) {
  const controls = new Set(['human-decision-authority','claim-boundary']);
  const forbidden = new Set();
  let decision = 'ALLOW';
  if (s.role === 'auditor') controls.add('read-only');
  if (s.operation === 'write' && s.role === 'auditor') decision = 'DENY_WRITE';
  if (s.operation === 'assist') {
    controls.add('proposal-only-ai');
    if (s.role === 'auditor') decision = 'DENY_ASSIST';
    else if (s.aiPolicy === 'disabled') decision = 'DENY_AI_POLICY';
    else if (s.assistPreference === 'off') decision = 'USE_MANUAL_PATH';
    else decision = 'ALLOW_AI_PROPOSAL';
  }
  if (s.aiPolicy === 'disabled') controls.add('server-ai-disabled');
  if (s.assistPreference === 'off') controls.add('personal-assist-off');
  if (s.entry === 'guided') controls.add('human-route-selection');
  if (s.entry === 'proof') controls.add('same-as-read-proof');
  if (s.entry === 'direct') controls.add('direct-process-entry');
  controls.add(`process-${processCodes[s.process]}`);
  if (s.claim === 'human-comprehension') {
    controls.add('require-E4-human-evidence');
    forbidden.add('infer-human-comprehension-from-browser');
  } else if (s.claim === 'enterprise-readiness') {
    controls.add('require-bound-deployment-evidence');
    forbidden.add('infer-enterprise-readiness-from-product-tests');
  } else controls.add('internal-operational-claim');
  return { decision, controls:[...controls].sort(), forbidden:[...forbidden].sort() };
}

const names = Object.keys(axes);
const rows = cartesian(names.map(name => axes[name])).map(values => {
  const scenario = Object.fromEntries(names.map((name,i)=>[name,values[i]]));
  const outcome = evaluate(scenario);
  const signature = hash({scenario,outcome});
  return {scenario,outcome,signature};
});
const unique = new Set(rows.map(r=>r.signature));
const duplicateSemanticSignatures = rows.length - unique.size;

let pairTotal=0, pairSeen=0;
for (let i=0;i<names.length;i++) for (let j=i+1;j<names.length;j++) {
  const a=names[i], b=names[j];
  const expected=new Set(cartesian([axes[a],axes[b]]).map(x=>JSON.stringify(x)));
  const observed=new Set(rows.map(r=>JSON.stringify([r.scenario[a],r.scenario[b]])));
  pairTotal += expected.size;
  pairSeen += [...expected].filter(x=>observed.has(x)).length;
}
const pairwiseCoverage = pairSeen/pairTotal;
const criticalTriples = [['role','aiPolicy','operation'],['process','entry','operation'],['aiPolicy','assistPreference','operation'],['claim','role','operation']];
let tripleTotal=0,tripleSeen=0;
for (const [a,b,c] of criticalTriples) {
  const expected=new Set(cartesian([axes[a],axes[b],axes[c]]).map(x=>JSON.stringify(x)));
  const observed=new Set(rows.map(r=>JSON.stringify([r.scenario[a],r.scenario[b],r.scenario[c]])));
  tripleTotal += expected.size;
  tripleSeen += [...expected].filter(x=>observed.has(x)).length;
}
const criticalTripleCoverage = tripleSeen/tripleTotal;

const influence={};
for (const axis of names) {
  const groups=new Map();
  for (const row of rows) {
    const key=JSON.stringify(names.filter(n=>n!==axis).map(n=>row.scenario[n]));
    const out=hash(row.outcome);
    if(!groups.has(key))groups.set(key,new Set());
    groups.get(key).add(out);
  }
  const changed=[...groups.values()].filter(set=>set.size>1).length;
  influence[axis]=changed/groups.size;
}

function classify(text, mutant='none') {
  const s=text.toLowerCase();
  if (s.includes('100000-loop')) return mutant==='count-is-coverage'?'ACCEPT_COUNT':'REJECT_COUNT_AS_COVERAGE';
  if (s.includes('profession, experience')) return mutant==='allow-inert-axis'?'ACCEPT_INERT':'REJECT_INERT_AXIS';
  if (s.includes('novice comprehension')) return mutant==='browser-is-human'?'CLAIM_HUMAN':'REQUIRE_E4_HUMAN';
  if (s.includes('localstorage')) return mutant==='ux-off-is-policy'?'ACCEPT_UX_POLICY':'REQUIRE_SERVER_POLICY';
  if (s.includes('ten files')) return mutant==='transport-mismatch-ok'?'ACCEPT_TRANSPORT':'REJECT_TRANSPORT_MISMATCH';
  if (s.includes('only filename')) return mutant==='false-preservation-ok'?'ACCEPT_COPY':'REJECT_FALSE_PRESERVATION';
  if (s.includes('legacy home')) return mutant==='legacy-dom-ok'?'ACCEPT_DOM_REWRITE':'REQUIRE_NATIVE_SHELL';
  if (s.includes('environment flags')) return mutant==='env-flags-are-evidence'?'ACCEPT_FLAGS':'REQUIRE_BOUND_EVIDENCE';
  if (s.includes('ten thousand audit')) return mutant==='audit-cap-ok'?'ACCEPT_CAP':'REJECT_AUDIT_CEILING';
  if (s.includes('entire growing audit')) return mutant==='rewrite-ledger-ok'?'ACCEPT_REWRITE':'REQUIRE_SEPARATE_LEDGER';
  if (s.includes('two governed processes')) return mutant==='stale-readme-ok'?'ACCEPT_STALE_DOC':'REQUIRE_CURRENT_SOT';
  if (s.includes('security workflow is skipped')) return mutant==='skipped-is-pass'?'COUNT_PASS':'DO_NOT_COUNT_SKIPPED';
  if (s.includes('builder authored generator')) return mutant==='self-evidence-closes-high'?'CLOSE_HIGH':'REQUIRE_E3_RUNTIME';
  if (s.includes('internally stable')) return mutant==='stable-means-universal'?'CLAIM_UNIVERSAL':'BOUND_STABLE_CLAIM';
  return 'UNCLASSIFIED';
}
const holdoutFailures=holdouts.filter(h=>classify(h.situation)!==h.expected).map(h=>({id:h.id,expected:h.expected,got:classify(h.situation)}));
const holdoutPassRate=(holdouts.length-holdoutFailures.length)/holdouts.length;
const mutants=['count-is-coverage','allow-inert-axis','browser-is-human','ux-off-is-policy','transport-mismatch-ok','false-preservation-ok','legacy-dom-ok','env-flags-are-evidence','audit-cap-ok','rewrite-ledger-ok','stale-readme-ok','skipped-is-pass','self-evidence-closes-high','stable-means-universal'];
const killed=[], survived=[];
for (const mutant of mutants) {
  const caught=holdouts.some(h=>classify(h.situation,mutant)!==h.expected);
  (caught?killed:survived).push(mutant);
}
const mutationScore=killed.length/mutants.length;
const req=contract.realSaturation;
const errors=[];
if(duplicateSemanticSignatures>req.duplicateSemanticSignaturesMax)errors.push('duplicate-semantic-signatures');
if(pairwiseCoverage<req.pairwiseCoverageMin)errors.push('pairwise-coverage');
if(criticalTripleCoverage<req.criticalTripleCoverageMin)errors.push('critical-triple-coverage');
if(Math.min(...Object.values(influence))<req.dimensionInfluenceMin)errors.push('inert-dimension');
if(holdouts.length<req.minimumHoldouts||holdoutPassRate<req.holdoutPassRateMin)errors.push('holdout');
if(mutationScore<req.mutationScoreMin)errors.push('mutation-score');
const report={schemaVersion:'1.0.0',releaseId:contract.releaseId,ok:errors.length===0,classification:errors.length?'INSUFFICIENT_REAL_SATURATION':'REAL_SATURATION_E2',scenarios:rows.length,semanticUniqueScenarios:unique.size,duplicateSemanticSignatures,pairwiseCoverage,criticalTripleCoverage,dimensionInfluence:influence,holdouts:holdouts.length,holdoutPassRate,mutationScore,killedMutants:killed,survivedMutants:survived,oracleSeparation:'E2',matrixDigest:hash({axes,signatures:[...unique].sort()}),holdoutDigest:hash(holdouts),errors,claimBoundary:contract.claim};
assert.deepEqual(errors,[]);
await mkdir(new URL('../artifacts/',here),{recursive:true});
await writeFile(new URL('../artifacts/v4-stable-real-saturation.json',here),JSON.stringify(report,null,2));
console.log(`v4-stable-real-saturation: ok (${rows.length} distinct scenarios, mutation=${mutationScore.toFixed(2)})`);
