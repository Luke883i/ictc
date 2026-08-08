import assert from 'node:assert/strict';
import { deterministicInsightBase } from './runtime/insights.mjs';

const state={missions:[{id:'m1',state:'active'}],catalog:[{id:'s1',state:'candidate'}],incidents:[],grcObjects:[],grcMappings:[],grcActions:[],grcRisks:[],grcAssurance:[]};
const actor={id:'admin',role:'admin',permissions:['read','manage-grc']};
const first=deterministicInsightBase(state,actor),second=deterministicInsightBase(structuredClone(state),actor);
assert.equal(first.authority,'runtime-deterministic-insights');assert.equal(first.basisSha256,second.basisSha256);assert.equal(first.metrics.find(x=>x.id==='monitoring-active').value,1);assert.equal(first.metrics.find(x=>x.id==='sources-review').value,1);assert.ok(first.signals.some(x=>x.metricId==='sources-review'));assert.ok(first.limitations.some(x=>x.includes('conformità')));
console.log(`insight-projection-check: ok (metrics=${first.metrics.length}, digest=${first.basisSha256.slice(0,12)})`);
