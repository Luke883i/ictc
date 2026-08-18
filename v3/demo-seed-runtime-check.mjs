import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),headers={'content-type':'application/json','x-ictc-role':'admin'};
const {PORT:_ignoredRunnerPort,...runtimeEnv}=process.env;
const EXPECTED=Object.freeze({monitoring:17,incidents:25,objects:60,coverage:50,actions:34,risks:20,assurance:13});
async function freePort(){return await new Promise((resolve,reject)=>{const probe=net.createServer();probe.unref();probe.once('error',reject);probe.listen({host:'127.0.0.1',port:0,exclusive:true},()=>{const address=probe.address(),port=typeof address==='object'&&address?address.port:0;probe.close(error=>error?reject(error):port>0?resolve(port):reject(new Error('ephemeral port allocation failed')));});});}
async function startOnPort(runtime,port,demo){const child=spawn(process.execPath,[path.join(root,'server.mjs')],{env:{...runtimeEnv,ICTC_RUNTIME_DIR:runtime,ICTC_PORT:String(port),ICTC_HOST:'127.0.0.1',ICTC_DEMO_SEED:demo?'1':'0'},stdio:['ignore','pipe','pipe']}),base=`http://127.0.0.1:${port}`;let stdout='',stderr='';const append=(current,chunk)=>`${current}${chunk}`.slice(-32_768);child.stdout.on('data',d=>{stdout=append(stdout,d);});child.stderr.on('data',d=>{stderr=append(stderr,d);});async function request(url){const r=await fetch(base+url,{headers}),text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text}if(!r.ok)throw new Error(`GET ${url} ${r.status}: ${text}`);return data;}const attempts=process.platform==='win32'?1200:420;for(let i=0;i<attempts;i++){if(child.exitCode!=null)throw new Error(`server exited ${child.exitCode} pid=${child.pid} port=${port}:\nstdout:\n${stdout}\nstderr:\n${stderr}`);try{await request('/api/health');return{child,request,diagnostics:()=>({stdout,stderr,pid:child.pid,port})};}catch(error){if(i===attempts-1)throw new Error(`server not ready after ${attempts*100}ms pid=${child.pid} port=${port}:\nstdout:\n${stdout}\nstderr:\n${stderr}\n${error.message}`);await new Promise(r=>setTimeout(r,100));}}throw new Error('unreachable');}
async function start(runtime,demo){let lastError;for(let attempt=0;attempt<4;attempt++){const port=await freePort();try{return await startOnPort(runtime,port,demo);}catch(error){lastError=error;if(!/EADDRINUSE/.test(String(error?.stack||error)))throw error;}}throw lastError||new Error('server start failed after collision retries');}
async function waitExit(child,timeoutMs=10000){if(child.exitCode!==null)return child.exitCode;return await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{cleanup();reject(new Error(`child did not exit within ${timeoutMs}ms`));},timeoutMs);const onExit=code=>{cleanup();resolve(code);};const cleanup=()=>{clearTimeout(timeout);child.off('exit',onExit);};child.once('exit',onExit);});}
async function stop(handle){if(handle.child.exitCode!==null)return;handle.child.kill('SIGTERM');try{await waitExit(handle.child,5000);}catch{handle.child.kill('SIGKILL');await waitExit(handle.child,5000);}}
async function removeRuntime(runtime){await rm(runtime,{recursive:true,force:true,maxRetries:20,retryDelay:100});}
function assertDemoCounts(boot,grc){
  assert.equal(boot.experience.demoMode,true,'demo-mode');
  assert.equal(boot.experience.demo.enabled,true,'demo-enabled');
  assert.equal(boot.experience.demo.synthetic,true,'demo-synthetic');
  assert.equal(boot.experience.demo.schedulerEnabled,false,'demo-scheduler-disabled');
  assert.equal(boot.experience.demo.primaryRecords,700,'persisted-primary-records');
  assert.ok(boot.experience.demo.supportRecords>=20,'support-records');
  assert.equal(boot.experience.demo.reality.enabled,true,'reality-enabled');
  assert.equal(boot.experience.demo.reality.records,700,'reality-persisted-records');
  assert.equal(boot.experience.demo.reality.threads,12,'reality-thread-catalog');
  assert.equal(boot.experience.demo.reality.operatingYear,true,'operating-year-marker');
  assert.equal(boot.experience.demo.reality.company,'Meccanica Selene S.r.l. · DEMO','operating-year-company');
  assert.deepEqual(boot.experience.demo.reality.showcaseCounts,EXPECTED,'showcase-count-marker');
  assert.equal(boot.experience.demo.reality.showcaseRecords,Object.values(EXPECTED).reduce((sum,value)=>sum+value,0),'showcase-total-marker');
  assert.match(boot.experience.demo.reality.claimBoundary,/synthetic|sintetico/i,'reality-claim-boundary');
  assert.equal(boot.settings.organization.name,'Meccanica Selene S.r.l. · DEMO','organization-company');
  assert.equal(boot.missions.length,EXPECTED.monitoring,'RN-visible-cohort');
  assert.equal(boot.incidents.length,EXPECTED.incidents,'EC-visible-cohort');
  assert.equal(grc.objects.objects.length,EXPECTED.objects,'AO-visible-cohort');
  assert.equal(grc.coverage.mappings.length,EXPECTED.coverage,'MC-visible-cohort');
  assert.equal(grc.actions.actions.length,EXPECTED.actions,'AP-visible-cohort');
  assert.equal(grc.risks.risks.length,EXPECTED.risks,'RC-visible-cohort');
  assert.equal(grc.assurance.cases.length,EXPECTED.assurance,'AR-visible-cohort');
  assert.ok(boot.subjectVersions.totalCount>=1400,`semantic-successors:${boot.subjectVersions.totalCount}`);
  for(const risk of grc.risks.risks)assert.equal(Object.prototype.hasOwnProperty.call(risk,'legalClassification'),false,'RC-no-legal-classification');
  assert.equal(grc.coverage.mappings.some(x=>x.state==='not-applicable'),false,'MC-no-legacy-not-applicable-state');
  assert.ok(grc.coverage.mappings.some(x=>x.state==='mapped')&&grc.coverage.mappings.some(x=>x.state==='gap')&&grc.coverage.mappings.some(x=>x.state==='rejected')&&grc.coverage.mappings.some(x=>x.state==='proposed'),'MC-maturity-diversity');
  assert.equal(grc.coverage.workflow.legacyNotApplicable,0,'MC-legacy-not-applicable-count');
  assert.equal(grc.coverage.workflow.mapped+grc.coverage.workflow.gap+grc.coverage.workflow.rejected+grc.coverage.workflow.unresolved,EXPECTED.coverage,'MC-workflow-total');
  assert.ok(boot.requirementScopes.counts.notApplicable>0&&boot.requirementScopes.counts.unknown>0&&boot.requirementScopes.counts.deferred>0,'MC-requirement-scope-diversity');
  assert.ok(grc.actions.actions.some(x=>x.state==='closed')&&grc.actions.actions.some(x=>x.state==='ready-for-review')&&grc.actions.actions.some(x=>x.state==='blocked'),'AP-maturity-diversity');
  assert.ok(grc.assurance.cases.some(x=>x.state==='approved')&&grc.assurance.cases.some(x=>x.state==='review')&&grc.assurance.cases.some(x=>x.state==='intake'),'AR-maturity-diversity');
  assert.equal(boot.demoAudit.enabled,true,'demo-audit-enabled');
  assert.equal(boot.demoAudit.available,true,'demo-audit-available');
  assert.equal(boot.demoAudit.verdict,'coherent','demo-audit-verdict');
  assert.equal(boot.demoAudit.counts.localPassed,boot.demoAudit.counts.localTotal,'demo-audit-local');
  assert.equal(boot.demoAudit.counts.globalPassed,boot.demoAudit.counts.globalTotal,'demo-audit-global');
  assert.equal(boot.experience.demo.audit.verdict,'coherent','experience-demo-audit-verdict');
  for(const [name,rows] of Object.entries({monitoring:boot.missions,incidents:boot.incidents,objects:grc.objects.objects,coverage:grc.coverage.mappings,actions:grc.actions.actions,risks:grc.risks.risks,assurance:grc.assurance.cases})){
    assert.ok(new Set(rows.map(x=>x.demo?.businessThread?.id).filter(Boolean)).size>=2,`${name}-thread-diversity`);
    assert.ok(rows.every(x=>x.demo?.businessThread?.synthetic===true),`${name}-thread-synthetic`);
    assert.ok(rows.every(x=>x.demo?.operatingYear?.showcase===true),`${name}-showcase-only`);
  }
}
async function assertEpistemic(server){const lattice=await server.request('/api/epistemic-lattice?offset=0&limit=80');assert.equal(lattice.schemaVersion,'1.3.0','lattice-schema');assert.equal(lattice.professionalLenses.lenses.length,12,'lattice-lenses');assert.equal(lattice.diagnostics.counts.businessThreads,12,'lattice-thread-catalog');assert.ok(lattice.diagnostics.counts.contextualizedBusinessAtoms>0,'lattice-contextualized-atoms');assert.equal(lattice.diagnostics.counts.proposedWithoutBasis,0,'lattice-no-proposed-without-basis');assert.ok(lattice.projection.rnSemanticAtoms>=0,'lattice-rn-atoms');assert.equal(lattice.professionalLenses.lenses.some(x=>x.id==='executive-sme'),true,'lattice-executive-sme');assert.equal(lattice.professionalLenses.lenses.some(x=>x.id==='legal-231-reviewer'),true,'lattice-legal-231');return lattice;}
const demoRuntime=await mkdtemp(path.join(tmpdir(),'ictc-demo-seed-')),normalRuntime=await mkdtemp(path.join(tmpdir(),'ictc-normal-seed-'));let live=[];try{let server=await start(demoRuntime,true);live.push(server);const health1=await server.request('/api/health'),boot1=await server.request('/api/bootstrap'),grc1=await server.request('/api/grc');assert.equal(health1.demo.enabled,true,'health-demo-enabled');assert.equal(health1.demo.schedulerMode,'disabled-in-demo','health-demo-scheduler');assert.equal(health1.demo.reality.enabled,true,'health-reality-enabled');assertDemoCounts(boot1,grc1);const lattice1=await assertEpistemic(server),revision1=boot1.revision,digest1=lattice1.projection.projectionSha256;await stop(server);live=live.filter(x=>x!==server);server=await start(demoRuntime,true);live.push(server);const boot2=await server.request('/api/bootstrap'),grc2=await server.request('/api/grc');assertDemoCounts(boot2,grc2);const lattice2=await assertEpistemic(server);assert.equal(boot2.revision,revision1,'restart-idempotent-revision');assert.equal(lattice2.projection.projectionSha256,digest1,'restart-lattice-digest');const normal=await start(normalRuntime,false);live.push(normal);const health0=await normal.request('/api/health'),boot0=await normal.request('/api/bootstrap'),grc0=await normal.request('/api/grc');assert.equal(health0.demo.enabled,false,'normal-demo-disabled');assert.equal(boot0.experience.demoMode,false,'normal-demo-mode-disabled');assert.equal(boot0.demoAudit.enabled,false,'normal-demo-audit-disabled');assert.equal(boot0.missions.length,0,'normal-RN-empty');assert.equal(boot0.incidents.length,0,'normal-EC-empty');assert.equal(grc0.objects.counts.total,0,'normal-AO-empty');assert.equal(grc0.coverage.declared,0,'normal-MC-empty');assert.equal(grc0.actions.counts.total,0,'normal-AP-empty');assert.equal(grc0.risks.counts.total,0,'normal-RC-empty');assert.equal(grc0.assurance.counts.total,0,'normal-AR-empty');await stop(normal);live=live.filter(x=>x!==normal);await stop(server);live=live.filter(x=>x!==server);console.log(`demo-seed-runtime-check: ok (Meccanica Selene year-one projection ${JSON.stringify(EXPECTED)} over 700 persisted stress records / semantic successors / coherent demo audit / idempotent restart revision=${revision1} / concurrently isolated normal runtime)`);}catch(error){console.error(`::error title=demo-seed-runtime-check::${String(error?.stack||error).replace(/\r?\n/g,'%0A')}`);throw error;}finally{for(const handle of live)await stop(handle).catch(()=>{});await removeRuntime(demoRuntime);await removeRuntime(normalRuntime);}
