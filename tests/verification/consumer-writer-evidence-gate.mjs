/** Three witness families must agree on exact HEAD; absence is never PASS.
 * Existing product/handler/SQLite owners remain authoritative.
 */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {WITNESSES} from './consumer-writer-reticular-check.mjs';
const root=path.resolve(fileURLToPath(new URL('../..',import.meta.url))),out=path.join(root,'artifacts');
const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const browserOnly=process.argv.includes('--browser-only');
const requireBrowser=browserOnly||process.argv.includes('--require-browser');
const failures=[];
const must=(bool,label)=>{if(!bool)failures.push(label);};
const load=file=>{const p=path.join(out,file);return existsSync(p)?JSON.parse(readFileSync(p,'utf8')):null;};
const graph=load('consumer-writer-reticulum.json');
must(graph?.authority==='NONE_DERIVED'&&graph?.gitHead===sha&&graph?.failures?.length===0&&graph?.witnesses===7,'observed-source-graph-exact-sha');
must(graph?.externalConsumers==='UNKNOWN_HOLD'&&graph?.automaticMoveOrDeleteAuthorized===false,'no-external-consumer-clearance');
const runtime=browserOnly?null:load('e2e-cross-process-receipts.json');
if(!browserOnly){
 must(runtime?.schema==='ictc-e2e-7process-real-write/v2'&&runtime?.gitHead===sha,'runtime-receipt-exact-sha');
 must(runtime?.runtimeCommands===12&&runtime?.commandReceipts?.length===12,'runtime-command-denominator');
 must(runtime?.asserts?.sevenProcesses===true&&runtime?.asserts?.integrityBinding===true&&runtime?.asserts?.semanticEventBindings===true&&runtime?.asserts?.privateActorIsolation===true&&runtime?.asserts?.deniedAuditorWrite===true&&runtime?.asserts?.deniedAuditorRoutes===7,'runtime-readback-and-negative');
 must(runtime?.negative?.results?.length===7&&runtime.negative.results.every(r=>r.status===403)&&runtime.negative.revisionBeforeDenials===runtime.negative.revisionAfterDenials,'seven-denials-no-write');
 must(runtime?.commandReceipts?.every(r=>/^[0-9a-f]{64}$/.test(r.receiptHash)&&Number.isInteger(r.revision)),'runtime-receipt-hashes');
 must(runtime?.processes?.length===7&&WITNESSES.every(w=>runtime.processes.includes(w.code)),'runtime-process-mapping');
}
const native=load('browser-consumer-writer-witness.json'),journey=load('browser-v2-1-procedure-journey.json');
let browserOK=Boolean(native?.ok&&native?.schema==='ictc-browser-consumer-writer-witness/v1'&&native.gitHead===sha&&journey?.gitHead===sha&&typeof native.witnessRunId==='string'&&/^[a-f0-9]{32}$/.test(native.witnessRunId)&&journey?.witnessRunId===native.witnessRunId&&journey?.ok===true&&journey.networkWriteWitnessCount===7&&native.finalRevision===journey.finalRevision&&native.baseRevision===journey.baseRevision&&native.finalRevision>native.baseRevision);
if(browserOK)for(const w of WITNESSES){const p=native.procedures?.[w.code];if(p?.method!=='POST'||p.path!==w.route||!(p.status>=200&&p.status<300)){browserOK=false;break;}}
if(requireBrowser)must(browserOK,'native-browser-network-witness');
const result={schema:'ictc-consumer-writer-convergence/v1',gitHead:sha,observedSourceGraph:graph?.failures?.length===0?'PASS':'FAIL',
 liveHttpSevenProcess:browserOnly?'NOT_RUN_IN_BROWSER_JOB':runtime?.gitHead===sha?'PASS':'FAIL',nativeBrowser:browserOK?'PASS':'BLOCKED_NO_EXECUTED_WITNESS',
 externalConsumers:'UNKNOWN_HOLD',writerCandidates:'DISPATCH_AMBIGUITY_REQUIRES_PER_ROUTE_PROOF',
 localVerdict:failures.length?'FAIL':browserOnly?'PASS_SOURCE_BROWSER_ONLY':browserOK?'PASS_SOURCE_RUNTIME_BROWSER':'PASS_SOURCE_RUNTIME_BROWSER_HOLD',globalE2E:browserOK&&runtime?.gitHead===sha?'REPOSITORY_BOUND_SCOPE_ONLY':'NOT_PROVEN',failures,
 claimBoundary:'A Git-bound conjunction of observed source, HTTP/SQLite and native Playwright evidence. No claim of exhaustive external/dynamic consumer reachability, independent validation or Zero-Debt.'};
mkdirSync(out,{recursive:true});writeFileSync(path.join(out,'consumer-writer-convergence.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));if(failures.length)process.exitCode=27;
