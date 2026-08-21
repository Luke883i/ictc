import assert from 'node:assert/strict';
import { sha256 } from './domain.mjs';
import { canonicalProcedureContracts } from './runtime/procedure-contracts.mjs';
import { dependencyReviewProjection } from './runtime/dependency-review.mjs';
import { effectiveRiskReview,effectiveRiskTreatment,riskLifecycleState,riskPortfolioProjection } from './runtime/grc-risks.mjs';
import { resolveEvidenceRef } from './runtime/reference-contract.mjs';

const monitoring=canonicalProcedureContracts().find(item=>item.id==='monitoring');
const activate=monitoring.transitions.find(item=>item.id==='activate');
assert.equal(activate.human,true);
assert.equal(activate.reasonRequired,false,'RN activation contract must match the explicit human checkpoint implemented by runtime/UI');
assert.match(activate.implementationBoundary,/human activation/i);

const observedOnly=resolveEvidenceRef({scope:'external',uri:'https://example.test/evidence',observedAt:'2026-08-20T08:00:00.000Z'});
assert.equal(observedOnly.resolution,'observed-external-unversioned');
assert.equal(observedOnly.usable,false);
assert.equal(observedOnly.versioned,false);
const pinned=resolveEvidenceRef({scope:'external',uri:'https://example.test/evidence',observedAt:'2026-08-20T08:00:00.000Z',digest:'a'.repeat(64)});
assert.equal(pinned.resolution,'observed-external-versioned');
assert.equal(pinned.usable,true);
assert.equal(pinned.versioned,true);

const inherent1={assessmentType:'inherent',likelihood:4,impact:4,score:16,band:'high',reason:'cycle 1 inherent',at:'2026-01-01T00:00:00.000Z'};
const residual1={assessmentType:'residual',likelihood:2,impact:2,score:4,band:'low',reason:'cycle 1 residual',at:'2026-02-01T00:00:00.000Z'};
const inherent2={assessmentType:'inherent',likelihood:5,impact:4,score:20,band:'critical',reason:'cycle 2 inherent',at:'2026-03-01T00:00:00.000Z'};
const oldTreatment={decision:'mitigate',reason:'cycle 1 treatment',at:'2026-02-02T00:00:00.000Z',reviewAt:'2026-02-20T00:00:00.000Z',assessmentSha256:sha256(residual1),assessmentType:'residual'};
const risk={id:'risk-cycle',title:'Multi-cycle risk',reviews:[inherent1,residual1,inherent2],treatments:[oldTreatment],objectBindings:[],controlBindings:[],actionIds:[]};
assert.equal(effectiveRiskReview(risk),inherent2,'new inherent review must open a new assessment cycle');
assert.equal(effectiveRiskTreatment(risk),null,'old treatment must not leak into the new assessment cycle');
assert.equal(riskLifecycleState(risk,'2026-03-02T00:00:00.000Z'),'inherent');
const newTreatment={decision:'accept',reason:'cycle 2 treatment',at:'2026-03-03T00:00:00.000Z',reviewAt:'2026-04-01T00:00:00.000Z',assessmentSha256:sha256(inherent2),assessmentType:'inherent'};risk.treatments.push(newTreatment);
assert.equal(effectiveRiskTreatment(risk),newTreatment);
assert.equal(riskLifecycleState(risk,'2026-03-20T00:00:00.000Z'),'treated');
assert.equal(riskLifecycleState(risk,'2026-04-02T00:00:00.000Z'),'review-due');
const portfolio=riskPortfolioProjection({grcRisks:[risk],grcObjects:[],grcMappings:[]},{id:'admin',role:'admin'});
assert.equal(portfolio.reviewed[0].assessmentType,'inherent');
assert.equal(portfolio.reviewed[0].treatment.decision,'accept');
assert.equal(portfolio.assessmentBasis.startsWith('latest-cycle-review'),true);
const reviewProjection=dependencyReviewProjection({revision:1,grcObjects:[],grcMappings:[],grcActions:[],grcRisks:[risk],grcAssurance:[],catalog:[]},{id:'admin',role:'admin'},{validAsOf:'2026-04-02T00:00:00.000Z',transactionAsOf:'2026-04-02T00:00:00.000Z'});
const riskReviewNeed=reviewProjection.items.find(item=>item.processId==='risks');
assert.ok(riskReviewNeed);
assert.equal(riskReviewNeed.causes.find(cause=>cause.kind==='scheduled-review-due')?.assessmentSha256,newTreatment.assessmentSha256);

console.log('semantic-closure-2-8-runtime-check: ok (RN contract parity + external evidence stability + RC multi-cycle temporal closure)');
