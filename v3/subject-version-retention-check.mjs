import assert from 'node:assert/strict';
import { appendSubjectVersion, resolveSubjectVersion, subjectVersionIndexProjection, SUBJECT_VERSION_PROJECTION_LIMIT } from './runtime/subject-version.mjs';

const state={revision:1,subjectVersions:[]};
const actor={id:'admin-1',role:'admin'};
for(let i=0;i<SUBJECT_VERSION_PROJECTION_LIMIT+1;i++)appendSubjectVersion(state,{subject:{type:'action',id:'a1'},payload:{sequence:i,value:`v-${i}`},actor,action:'action.updated',at:new Date(1700000000000+i).toISOString()});
assert.equal(state.subjectVersions.length,SUBJECT_VERSION_PROJECTION_LIMIT+1,'canonical history must not be silently truncated');
const oldest=state.subjectVersions[0];assert.equal(oldest.payload.sequence,0);assert.equal(resolveSubjectVersion(state,oldest.payloadSha256)?.payload.sequence,0,'oldest version must remain resolvable');
const projection=subjectVersionIndexProjection(state,actor,{asOf:'2026-08-09T00:00:00.000Z'});assert.equal(projection.count,SUBJECT_VERSION_PROJECTION_LIMIT);assert.equal(projection.totalCount,SUBJECT_VERSION_PROJECTION_LIMIT+1);assert.equal(projection.omittedCount,1);assert.equal(projection.truncatedForProjection,true);assert.equal(projection.retention.silentDeletion,false);assert.equal(projection.records.at(-1).subject.id,'a1');
console.log('subject-version-retention-check: ok',projection.retention);
