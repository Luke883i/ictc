import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { ASSURANCE_RISK_CODES as R, evaluateAssuranceScenario as evaluate } from './assurance-risk-model.mjs';

const TOTAL = 100000;
const FAMILIES = ['positive', 'negative', 'adversarial', 'edge'];
const SURFACES = ['small', 'medium', 'large', 'massive'];
const COUPLING = ['independent', 'partial', 'same-circuit'];
const SUITE = ['contraction', 'flat', 'expansion'];
const COVERAGE = ['coverage', 'minimum-count'];

function randomFor(seed) {
  let state = seed >>> 0;
  return () => ((state = (state * 1664525 + 1013904223) >>> 0) / 0x100000000);
}
const pick = (items, random) => items[Math.floor(random() * items.length)];
const chance = (random, p) => random() < p;

function scenario(family, index) {
  const random = randomFor((0x9e3779b9 ^ ((index + 1) * 2654435761) ^ FAMILIES.indexOf(family)) >>> 0);
  const common = {
    changeSurface: pick(SURFACES, random), suiteChange: pick(SUITE, random),
    coverageContract: pick(COVERAGE, random), deliveryMode: chance(random, .85) ? 'pr' : 'direct-push'
  };
  if (family === 'positive') return { ...common, branchProtection: chance(random,.96), independentReviewer:chance(random,.94), externalStaticAnalysis:chance(random,.90), exactHeadEvidence:true, postMergeEvidence:true, modelOracleCoupling:pick(['independent','partial'],random), coverageContract:'coverage', coveragePreserved:true, mutationSensitivity:true, skippedExternalTruthful:true, deliveryMode:'pr' };
  if (family === 'adversarial') return { ...common, branchProtection:false, independentReviewer:chance(random,.08), externalStaticAnalysis:chance(random,.15), exactHeadEvidence:true, postMergeEvidence:true, changeSurface:pick(['large','massive'],random), modelOracleCoupling:'same-circuit', coveragePreserved:chance(random,.90), mutationSensitivity:true, skippedExternalTruthful:true, deliveryMode:'pr' };
  const p = family === 'negative' ? .30 : .50;
  return { ...common, branchProtection:chance(random,p), independentReviewer:chance(random,p), externalStaticAnalysis:chance(random,p), exactHeadEvidence:chance(random,p), postMergeEvidence:chance(random,p), modelOracleCoupling:pick(COUPLING,random), coveragePreserved:chance(random,family === 'negative' ? .65 : .50), mutationSensitivity:chance(random,p), skippedExternalTruthful:chance(random,family === 'negative' ? .80 : .50) };
}

const MUTANTS = {
  postMergeAsPrevention: s => ({ ...s, branchProtection:s.branchProtection || s.postMergeEvidence }),
  sastAsReview: s => ({ ...s, independentReviewer:s.independentReviewer || s.externalStaticAnalysis }),
  exactHeadAsIndependence: s => ({ ...s, modelOracleCoupling:s.exactHeadEvidence ? 'independent' : s.modelOracleCoupling }),
  countAsCoverage: s => ({ ...s, coverageContract:s.coverageContract === 'minimum-count' ? 'coverage' : s.coverageContract }),
  skipAsSast: s => ({ ...s, externalStaticAnalysis:s.externalStaticAnalysis || s.skippedExternalTruthful }),
  ignoreCoverageLoss: s => ({ ...s, coveragePreserved:true })
};
const signature = result => result.risks.join('|');

export async function runAssuranceRiskSaturation() {
  const families = Object.fromEntries(FAMILIES.map(name => [name,0]));
  const risks = new Map();
  const mutants = Object.fromEntries(Object.keys(MUTANTS).map(name => [name,0]));
  const digest = createHash('sha256');

  for (const family of FAMILIES) for (let index = 0; index < TOTAL / 4; index += 1) {
    const input = scenario(family,index);
    const result = evaluate(input);
    families[family] += 1;
    digest.update(`${family}:${index}:${JSON.stringify(input)}:${signature(result)}\n`);
    for (const risk of result.risks) risks.set(risk,(risks.get(risk)||0)+1);
    for (const [name,mutate] of Object.entries(MUTANTS)) if (signature(evaluate(mutate(input))) !== signature(result)) mutants[name] += 1;
  }

  const boundedGreen = evaluate({ branchProtection:false, independentReviewer:false, externalStaticAnalysis:false, exactHeadEvidence:true, postMergeEvidence:true, changeSurface:'massive', modelOracleCoupling:'same-circuit', suiteChange:'contraction', coverageContract:'minimum-count', coveragePreserved:true, skippedExternalTruthful:true, deliveryMode:'pr' });
  for (const risk of [R.PREVENTIVE_GOVERNANCE_GAP,R.INDEPENDENT_REVIEW_GAP,R.CORRELATED_ASSURANCE_GAP,R.REVIEW_BANDWIDTH_GAP,R.COMPLEXITY_RATCHET]) assert.ok(boundedGreen.risks.includes(risk));
  assert.equal(evaluate({ branchProtection:true, independentReviewer:true, externalStaticAnalysis:true, exactHeadEvidence:true, postMergeEvidence:true, suiteChange:'contraction', coverageContract:'coverage', coveragePreserved:true }).risks.includes(R.COMPLEXITY_RATCHET),false);
  assert.ok(evaluate({ branchProtection:true, independentReviewer:true, externalStaticAnalysis:true, exactHeadEvidence:true, postMergeEvidence:true, coveragePreserved:false }).risks.includes(R.COVERAGE_REGRESSION));
  for (const count of Object.values(mutants)) assert.ok(count > 0);
  assert.equal(Object.values(families).reduce((a,b)=>a+b,0),TOTAL);

  const report = { schemaVersion:'1.0.0', authority:'bounded-assurance-risk-model', totalScenarios:TOTAL, families, dimensions:13, riskCounts:Object.fromEntries([...risks].sort()), mutantWitnesses:mutants, replaySha256:digest.digest('hex'), claimBoundary:'Bounded engineering simulation; not observed branch governance, independent review, SAST, product correctness or certification.' };
  await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
  await writeFile(new URL('../artifacts/assurance-risk-saturation.json',import.meta.url),JSON.stringify(report,null,2));
  return report;
}

if (process.argv[1]?.endsWith('assurance-risk-check.mjs')) {
  const report = await runAssuranceRiskSaturation();
  console.log(JSON.stringify({ok:true,totalScenarios:report.totalScenarios,families:report.families,mutantWitnesses:report.mutantWitnesses,replaySha256:report.replaySha256}));
}
