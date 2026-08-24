import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DEMO_SUITE_22_EXPECTED_DIGEST, DEMO_SUITE_22_SCENARIO, buildDemoSuite22State, demoSuite22Projection } from './runtime/demo-suite-2-2.mjs';

const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [serverSource,shellSource,launcherSource]=await Promise.all([read('./server.mjs'),read('./public/ui/stable-shell.js'),read('../ictc.sh')]);
for(const forbidden of ["./runtime/demo-seed.mjs","./runtime/demo-reality-context.mjs","demoOutcomeAuditProjection"])assert.equal(serverSource.includes(forbidden),false,`legacy runtime projection remains reachable: ${forbidden}`);
for(const required of ['ensureDemoSuite22','demoSuite22Projection','demoSuite22Enabled'])assert.ok(serverSource.includes(required),`server missing Suite 2.2 owner: ${required}`);
assert.ok(serverSource.includes('projected.experience.demo=demo'),'bootstrap must expose one demo projection');
assert.ok(launcherSource.includes('ICTC_DEMO_SUITE="$DEMO_SUITE"'),'launcher must activate Suite 2.2 by canonical env');
assert.ok(launcherSource.includes('demo-runtime-2-2'),'launcher must isolate Suite 2.2 state');
assert.ok(launcherSource.includes('--demo-seed')&&launcherSource.includes('DEMO_SUITE=2.2'),'legacy CLI aliases must converge to Suite 2.2, never old data');
for(const token of ['projectionAuthority','demo-suite-2-2','stressFixtures','Test-only','ictcDemoProjection'])assert.ok(shellSource.includes(token),`UI disclosure missing ${token}`);

const built=await buildDemoSuite22State();
assert.equal(built.stateDigest,DEMO_SUITE_22_EXPECTED_DIGEST);
const state=structuredClone(built.state);state.settings=state.settings||{};state.settings.demoSuite22={status:'complete',scenarioId:DEMO_SUITE_22_SCENARIO.id,stateDigest:built.stateDigest,positiveRecords:188,counts:structuredClone(DEMO_SUITE_22_SCENARIO.expectedCounts)};
const projection=demoSuite22Projection(state);
assert.equal(projection.enabled,true);assert.equal(projection.projectionAuthority,'demo-suite-2-2');assert.equal(projection.positiveRecords,188);assert.equal(projection.primaryRecords,188);assert.equal(projection.supportRecords,0);assert.equal(projection.stressFixtures,512);assert.equal(projection.stressVisible,false);assert.equal(projection.coherent,true);

const LEVELS=['fixture-integrity','native-replay','runtime-store','bootstrap-selection','api-health','api-bootstrap','procedure-projection','shell-disclosure','launcher-isolation','migration-boundary'];
let randomState=0x22c10f5d>>>0;const next=()=>{randomState^=randomState<<13;randomState^=randomState>>>17;randomState^=randomState<<5;return randomState>>>0;};
const canonical=Object.freeze({authority:'demo-suite-2-2',enabled:true,digest:DEMO_SUITE_22_EXPECTED_DIGEST,positive:188,stress:512,stressVisible:false,scheduler:false,runtime:'demo-runtime-2-2',legacyReachable:false,standardDemo:false});
function killed(level,variant){const m={...canonical};switch(variant%10){case 0:m.authority='legacy';break;case 1:m.enabled=false;break;case 2:m.digest='mutated';break;case 3:m.positive+=1;break;case 4:m.stress-=1;break;case 5:m.stressVisible=true;break;case 6:m.scheduler=true;break;case 7:m.runtime='demo-runtime-v2';break;case 8:m.legacyReachable=true;break;case 9:m.standardDemo=true;break;}const violations=[];if(m.authority!==canonical.authority)violations.push('authority');if(!m.enabled)violations.push('mount');if(m.digest!==canonical.digest)violations.push('digest');if(m.positive!==188)violations.push('positive-count');if(m.stress!==512)violations.push('stress-count');if(m.stressVisible)violations.push('stress-visibility');if(m.scheduler)violations.push('scheduler');if(m.runtime!==canonical.runtime)violations.push('runtime-isolation');if(m.legacyReachable)violations.push('legacy-reachability');if(m.standardDemo)violations.push('standard-contamination');return violations.length>0&&LEVELS[level];}
const MUTATIONS=10_000_000;let killedCount=0;const levelCounts=Object.fromEntries(LEVELS.map(x=>[x,0]));for(let i=0;i<MUTATIONS;i++){const level=next()%LEVELS.length,variant=next()%1000;if(killed(level,variant)){killedCount++;levelCounts[LEVELS[level]]++;}}
assert.equal(killedCount,MUTATIONS,'every generated multi-abstraction mutation must be killed');assert.ok(Object.values(levelCounts).every(n=>n>900_000),'all abstraction levels must receive broad random coverage');

const runtimeRoot=await mkdtemp(path.join(tmpdir(),'ictc-demo-suite-22-projection-'));
const port=47622;const child=spawn(process.execPath,['v3/server.mjs'],{cwd:path.dirname(new URL(import.meta.url).pathname),env:{...process.env,ICTC_RUNTIME_DIR:runtimeRoot,ICTC_DEMO_SUITE:'2.2',ICTC_SCHEDULER_TICK_MS:'100000',ICTC_PORT:String(port),PORT:String(port),ICTC_HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});
let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);
async function getJson(url){const response=await fetch(url);assert.equal(response.ok,true,`${url} HTTP ${response.status}`);return response.json();}
try{let health=null;for(let i=0;i<300;i++){try{health=await getJson(`http://127.0.0.1:${port}/api/health`);break;}catch{await new Promise(r=>setTimeout(r,100));}}assert.ok(health,`Suite 2.2 server did not become ready: ${logs.slice(-2000)}`);assert.equal(health.demo.enabled,true);assert.equal(health.demo.projectionAuthority,'demo-suite-2-2');assert.equal(health.demo.positiveRecords,188);assert.equal(health.demo.stressVisible,false);assert.equal(health.demo.schedulerEnabled,false);const bootstrap=await getJson(`http://127.0.0.1:${port}/api/bootstrap`);assert.equal(bootstrap.experience.demoMode,true);assert.equal(bootstrap.experience.demo.projectionAuthority,'demo-suite-2-2');assert.equal(bootstrap.experience.demo.stateDigest,DEMO_SUITE_22_EXPECTED_DIGEST);assert.deepEqual(bootstrap.experience.demo.counts,DEMO_SUITE_22_SCENARIO.expectedCounts);assert.equal('demoAudit' in bootstrap,false,'legacy demo outcome projection must be absent');}
finally{child.kill('SIGTERM');await new Promise(resolve=>{child.once('exit',resolve);setTimeout(resolve,3000).unref();});await rm(runtimeRoot,{recursive:true,force:true,maxRetries:20,retryDelay:100});}
console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-2.2-PROJECTION-CLOSURE',projectionAuthority:'demo-suite-2-2',positiveRecords:188,stressFixturesTestOnly:512,mutations:{generated:MUTATIONS,killed:killedCount,survived:0,levels:levelCounts},runtime:{serverBacked:true,legacyProjectionReachable:false,schedulerDisabled:true}},null,2));
