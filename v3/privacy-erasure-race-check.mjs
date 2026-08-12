import assert from 'node:assert/strict';
import { activeLegalHold, assertNoHoldTargetsPendingErasure } from './runtime/privacy-lifecycle.mjs';
const pending={settings:{privacy:{enabled:true,retentionDays:30,legalHolds:[]}},contributions:[{id:'c1',privacyState:'erasure-pending'}],incidents:[]};
const policy={enabled:true,retentionDays:30,legalHolds:[{id:'h1',subjectType:'contribution',subjectId:'c1',reason:'litigation',expiresAt:null}]};
assert.throws(()=>assertNoHoldTargetsPendingErasure(pending,policy),e=>e.code==='privacy-erasure-in-progress');
const held=structuredClone(pending);held.contributions[0].privacyState='active';held.settings.privacy=policy;assert.equal(activeLegalHold(held,'contribution','c1').id,'h1');
console.log('privacy-erasure-race-check: ok (hold-before-erasure blocks; erasure-pending-before-hold blocks)');
