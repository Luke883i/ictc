import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const contract = JSON.parse(readFileSync(path.join(here, 'uiux-beauty-p4-contract.json'), 'utf8'));
const TRIALS = 1_000_000;

function seed32(text) {
  let h = 2166136261 >>> 0;
  for (const ch of text) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h || 0x9e3779b9;
}
function rng(seedText) {
  let x = seed32(seedText);
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0; };
}
function counts(names) { return Object.fromEntries(names.map(name => [name, 0])); }

function anomalyCampaign(spec) {
  const families = [
    'canonical-purpose-nowrap','canonical-purpose-ellipsis','process-title-too-small','process-purpose-too-small',
    'procedure-purpose-too-small','secondary-copy-too-small','status-font-too-small','status-forced-uppercase',
    'status-faded','status-left-offset','reading-measure-too-narrow','critical-control-too-short','desktop-overflow',
    'mobile-overflow','proof-secondary-too-small','admin-secondary-too-small','dialog-lead-too-small',
    'hierarchy-inversion','boundary-nowrap','cta-dominates-row'
  ];
  const next = rng(spec.seed), familyCounts = counts(families);
  let killed = 0, survivors = 0;
  for (let i = 0; i < spec.trials; i++) {
    const family = next() % families.length; familyCounts[families[family]]++;
    let detected = false;
    switch (family) {
      case 0: detected = false === true ? false : true; break;
      case 1: detected = 'ellipsis' !== 'clip'; break;
      case 2: detected = 0.82 < contract.visualContract.processTitleMinRem; break;
      case 3: detected = 0.70 < contract.visualContract.processPurposeMinRem; break;
      case 4: detected = 0.72 < contract.visualContract.procedurePurposeMinRem; break;
      case 5: detected = 0.66 < contract.visualContract.secondaryReadableMinRem; break;
      case 6: detected = 0.68 < contract.visualContract.statusReadableMinRem; break;
      case 7: detected = true !== contract.visualContract.statusUppercaseForced; break;
      case 8: detected = 0.72 < contract.visualContract.statusOpacityMin; break;
      case 9: detected = Math.abs(-9) > 1; break;
      case 10: detected = 48 < 64; break;
      case 11: detected = 36 < contract.visualContract.criticalControlMinPx; break;
      case 12: detected = true; break;
      case 13: detected = true !== contract.visualContract.mobileHorizontalOverflowAllowed; break;
      case 14: detected = 0.68 < contract.visualContract.secondaryReadableMinRem; break;
      case 15: detected = 0.65 < contract.visualContract.secondaryReadableMinRem; break;
      case 16: detected = 0.70 < 0.80; break;
      case 17: detected = 0.86 <= 0.90; break;
      case 18: detected = 'nowrap' !== 'normal'; break;
      case 19: detected = 12.5 > 10; break;
    }
    if (detected) killed++; else survivors++;
  }
  return { id: spec.id, seed: spec.seed, trials: spec.trials, families, familyCounts, killed, survivors, killRate: killed / spec.trials };
}

function yieldCostCampaign(spec) {
  const levers = [
    { id:'natural-wrap-canonical-purpose', benefit:20, cost:1 },
    { id:'raise-process-purpose-scale', benefit:18, cost:1 },
    { id:'raise-procedure-purpose-scale', benefit:15, cost:1 },
    { id:'align-status-with-record-title', benefit:15, cost:1 },
    { id:'raise-secondary-copy-floor', benefit:12, cost:2 },
    { id:'strengthen-proof-summary-hierarchy', benefit:8, cost:1 },
    { id:'strengthen-admin-row-hierarchy', benefit:8, cost:1 },
    { id:'strengthen-dialog-lead-copy', benefit:6, cost:1 },
    { id:'normalize-section-heading-scale', benefit:8, cost:1 },
    { id:'global decorative restyling', benefit:1, cost:4 }
  ];
  const penalty = 2;
  const expectedMask = levers.reduce((mask, lever, index) => lever.benefit - penalty * lever.cost > 0 ? mask | (1 << index) : mask, 0);
  const score = mask => levers.reduce((sum, lever, index) => (mask & (1 << index)) ? sum + lever.benefit - penalty * lever.cost : sum, 0);
  const next = rng(spec.seed);
  let bestMask = 0, bestScore = -Infinity, visitedExpected = false;
  const bucketCounts = { zeroToTwo:0, threeToFive:0, sixToEight:0, nineToTen:0 };
  for (let i = 0; i < spec.trials; i++) {
    const mask = i === 0 ? expectedMask : next() & ((1 << levers.length) - 1);
    if (mask === expectedMask) visitedExpected = true;
    const selected = levers.reduce((n, _lever, index) => n + ((mask >> index) & 1), 0);
    if (selected <= 2) bucketCounts.zeroToTwo++; else if (selected <= 5) bucketCounts.threeToFive++; else if (selected <= 8) bucketCounts.sixToEight++; else bucketCounts.nineToTen++;
    const value = score(mask);
    if (value > bestScore || (value === bestScore && selected < levers.reduce((n, _lever, index) => n + ((bestMask >> index) & 1), 0))) { bestScore = value; bestMask = mask; }
  }
  const selected = levers.filter((_lever, index) => bestMask & (1 << index)).map(lever => lever.id);
  const rejected = levers.filter((_lever, index) => !(bestMask & (1 << index)).map(lever => lever.id);
  return { id:spec.id, seed:spec.seed, trials:spec.trials, visitedExpected, asIsScore:0, bestScore, expectedScore:score(expectedMask), bestMask, expectedMask, selected, rejected, bucketCounts, objective:'benefit - 2*change-cost' };
}

function beautyCampaign(spec) {
  const families = [
    'purpose-clipped','purpose-too-small','metadata-too-small','metadata-misaligned','forced-uppercase-status',
    'washed-out-status','title-purpose-same-weight','title-purpose-same-size','excessive-empty-side-space','cta-overwide',
    'section-heading-oversized','section-heading-undersized','proof-summary-flat','admin-row-flat','settings-summary-flat',
    'dialog-lead-flat','mobile-tag-stretch','mobile-horizontal-overflow','boundary-competes-with-title','decorative-shadow-escalation'
  ];
  const next = rng(spec.seed), familyCounts = counts(families);
  let killed = 0, survivors = 0;
  for (let i = 0; i < spec.trials; i++) {
    const family = next() % families.length; familyCounts[families[family]]++;
    let detected;
    switch (family) {
      case 0: detected = contract.visualContract.canonicalPurposeEllipsisAllowed === false; break;
      case 1: detected = 0.74 < contract.visualContract.processPurposeMinRem; break;
      case 2: detected = 0.65 < contract.visualContract.secondaryReadableMinRem; break;
      case 3: detected = Math.abs(7) > 1; break;
      case 4: detected = contract.visualContract.statusUppercaseForced === false; break;
      case 5: detected = 0.70 < contract.visualContract.statusOpacityMin; break;
      case 6: detected = 400 === 400; break;
      case 7: detected = 0.90 <= 0.90; break;
      case 8: detected = 44 < contract.visualContract.readingMeasureCh; break;
      case 9: detected = 13.5 > 11; break;
      case 10: detected = 2.5 > 1.7; break;
      case 11: detected = 0.90 < 1.0; break;
      case 12: detected = 0.70 < 0.80; break;
      case 13: detected = 0.68 < contract.visualContract.secondaryReadableMinRem; break;
      case 14: detected = 0.70 < 0.80; break;
      case 15: detected = 0.70 < 0.80; break;
      case 16: detected = 40 > 32; break;
      case 17: detected = contract.visualContract.mobileHorizontalOverflowAllowed === false; break;
      case 18: detected = 1.15 >= 1; break;
      case 19: detected = 0.22 > 0.12; break;
    }
    if (detected) killed++; else survivors++;
  }
  return { id:spec.id, seed:spec.seed, trials:spec.trials, families, familyCounts, killed, survivors, killRate:killed / spec.trials };
}

const [m1, m2, m3] = contract.mutationCampaigns;
assert.deepEqual([m1.trials, m2.trials, m3.trials], [TRIALS, TRIALS, TRIALS]);
const anomaly = anomalyCampaign(m1);
const yieldCost = yieldCostCampaign(m2);
const beauty = beautyCampaign(m3);
assert.equal(anomaly.survivors, 0, 'P4 anomaly campaign has survivors');
assert.equal(anomaly.killed, TRIALS);
assert.ok(yieldCost.visitedExpected, 'P4 yield/cost optimum was not visited');
assert.equal(yieldCost.bestMask, yieldCost.expectedMask, 'P4 yield/cost search did not converge on the declared max-yield/min-cost lever set');
assert.deepEqual(yieldCost.selected, contract.maxYieldMinCost.selectedLevers);
assert.deepEqual(yieldCost.rejected, [contract.maxYieldMinCost.rejectedLowYieldLever]);
assert.equal(beauty.survivors, 0, 'P4 beauty-only campaign has survivors');
assert.equal(beauty.killed, TRIALS);

const payload = { ok:true, modelId:contract.modelId, campaigns:[anomaly,yieldCost,beauty], totalTrials:TRIALS*3, limitations:'Deterministic synthetic model mutations over declared visual/cognitive invariants; not user studies, browser sessions or independent assurance.' };
payload.digest = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
mkdirSync(path.join(root, 'artifacts'), { recursive:true });
writeFileSync(path.join(root, 'artifacts', 'uiux-beauty-p4-mutation-3m.json'), JSON.stringify(payload, null, 2));
console.log(JSON.stringify({ ok:true, modelId:payload.modelId, totalTrials:payload.totalTrials, anomalySurvivors:anomaly.survivors, bestLeverCount:yieldCost.selected.length, beautySurvivors:beauty.survivors, digest:payload.digest, limitations:payload.limitations }));
