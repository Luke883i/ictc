import assert from 'node:assert/strict';
import { canonicalReviewInbox } from './runtime/review-inbox.mjs';

const state={catalog:[{id:'s1',title:'Fonte',state:'candidate',summary:'AI summary'}],incidents:[{id:'i1',createdBy:'alice',state:'review',analysis:{proposedKind:'event'}}],grcObjects:[{id:'o1',type:'server',name:'ERP',status:'candidate',criticality:'high',createdBy:'alice',relations:[],reviews:[]}],grcMappings:[],grcActions:[],grcRisks:[],grcAssurance:[]};
const admin=canonicalReviewInbox(state,{id:'admin',role:'admin',permissions:['read','manage-grc']});assert.ok(admin.items.some(x=>x.id==='source:s1'));assert.ok(admin.items.some(x=>x.id==='incident:i1'));assert.ok(admin.items.some(x=>x.id==='grc-object:o1'));assert.ok(admin.items.every(x=>x.humanRequired));assert.ok(admin.items.every(x=>x.checkpoint));
const user=canonicalReviewInbox(state,{id:'bob',role:'user',permissions:['read','contribute-grc']});assert.equal(user.items.some(x=>x.id==='incident:i1'),false,'private incident must not leak');assert.equal(user.items.some(x=>x.id==='source:s1'),false,'user is not source reviewer');
const owner=canonicalReviewInbox(state,{id:'alice',role:'user',permissions:['read','contribute-grc']});assert.equal(owner.items.some(x=>x.id==='incident:i1'),true);
const auditor=canonicalReviewInbox(state,{id:'audit',role:'auditor',permissions:['read']});assert.ok(auditor.items.every(x=>x.readOnly));
console.log(`review-inbox-check: ok (admin=${admin.counts.total}, auditor=${auditor.counts.total})`);
