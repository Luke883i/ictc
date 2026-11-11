/** Conservative source-to-route witness, derived from existing authorities. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {procedureAdapters} from '../../src/runtime/procedure-adapters.mjs';
import {runtimeHandlerKeysByProcedure,runtimeHandlerPlan} from '../../src/runtime/runtime-handler-registry.mjs';
import {deriveObservedConsumerWriterReticulum} from '../../src/lib/write-authority-census-lib.mjs';
const root=path.resolve(new URL('../..',import.meta.url).pathname);
const paths=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const sourceByPath={};for(const p of paths)if(((p.startsWith('src/')||p.startsWith('public/'))&&/\.(?:js|mjs|html|css)$/.test(p))||(p.startsWith('.github/workflows/')&&/\.ya?ml$/.test(p)))sourceByPath[p]=readFileSync(path.join(root,p),'utf8');
// Test witnesses, not a parallel route registry: each must match canonical adapter.
export const WITNESSES=[
 {code:'RN-01',id:'monitoring',route:'/api/contributions',owner:'src/runtime/contributions.mjs'},
 {code:'EC-01',id:'incidents',route:'/api/incidents/intake',owner:'src/runtime/incident-market-handler.mjs'},
 {code:'AO-01',id:'objects',route:'/api/grc/objects',owner:'src/runtime/procedure-invariant-handler.mjs'},
 {code:'MC-01',id:'coverage',route:'/api/grc/mappings',owner:'src/runtime/procedure-invariant-handler.mjs'},
 {code:'AP-01',id:'actions',route:'/api/grc/actions',owner:'src/runtime/grc-runtime-legacy.mjs'},
 {code:'RC-01',id:'risks',route:'/api/grc/risks',owner:'src/runtime/grc-runtime-legacy.mjs'},
 {code:'AR-01',id:'assurance',route:'/api/grc/assurance',owner:'src/runtime/grc-runtime-legacy.mjs'}
];
const reticulum=deriveObservedConsumerWriterReticulum({adapters:procedureAdapters(),handlerKeys:runtimeHandlerKeysByProcedure(),handlerPlan:runtimeHandlerPlan(),sourceByPath,trackedPaths:paths,witnesses:WITNESSES});
mkdirSync(path.join(root,'artifacts'),{recursive:true});writeFileSync(path.join(root,'artifacts/consumer-writer-reticulum.json'),JSON.stringify(reticulum,null,2)+'\n');
assert.deepEqual(reticulum.failures,[],JSON.stringify(reticulum.failures));assert.equal(reticulum.witnesses,7);
assert.equal(reticulum.externalConsumers,'UNKNOWN_HOLD');assert.equal(reticulum.automaticMoveOrDeleteAuthorized,false);
assert.equal(reticulum.browserProof,'REQUIRED_SEPARATELY');
console.log(JSON.stringify({ok:true,paths:reticulum.pathsScanned,edges:reticulum.staticEdges,witnesses:reticulum.witnesses,dynamic:reticulum.observedDynamicSources,unresolved:reticulum.unresolved.length,shadowCandidates:reticulum.procedures.filter(p=>p.otherWriterCandidates.length).length,externalConsumers:reticulum.externalConsumers}));
