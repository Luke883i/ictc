import { mkdir, writeFile } from 'node:fs/promises';

const token=process.env.GITHUB_TOKEN||'',repository=process.env.GITHUB_REPOSITORY||'',sha=process.env.HEAD_SHA||process.env.GITHUB_SHA||'',api=process.env.GITHUB_API_URL||'https://api.github.com';
const selfNames=new Set(String(process.env.ICTC_CENSUS_SELF_NAMES||'actions-census').split(',').map(x=>x.trim()).filter(Boolean));
const timeoutMs=Math.max(60_000,Math.min(70*60_000,Number(process.env.ICTC_CENSUS_TIMEOUT_MS||60*60_000))),pollMs=Math.max(5_000,Math.min(30_000,Number(process.env.ICTC_CENSUS_POLL_MS||15_000))),minObserveMs=Math.max(30_000,Math.min(5*60_000,Number(process.env.ICTC_CENSUS_MIN_OBSERVE_MS||90_000)));
const browserSourcePrefix='browser / ';
const professionalBrowserSources=new Map([['epistemic-professional-browser','v3/browser-epistemic-professional-demo.py']]);
const diagnosticPrefixes=Object.freeze(['diagnostic / ']);
const aggregateChecks=new Set(['ci-verdict']);
aggregateChecks.add('diagnostic / ci-verdict');
const annotationPhaseCache=new Map();
const artifactUrl=new URL('../artifacts/actions-census.json',import.meta.url);

if(!token||!repository||!/^[0-9a-f]{40}$/i.test(sha))throw new Error('GITHUB_TOKEN, GITHUB_REPOSITORY and exact HEAD_SHA are required');
const headers={accept:'application/vnd.github+json',authorization:`Bearer ${token}`,'x-github-api-version':'2022-11-28','content-type':'application/json'};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const retryable=status=>status===429||status>=500;

async function json(url,options={}){
  let lastError=null;
  for(let attempt=0;attempt<5;attempt++){
    try{
      const response=await fetch(url,{...options,headers:{...headers,...options.headers}});
      if(response.ok)return response.json();
      const text=await response.text();
      const error=new Error(`GitHub API ${response.status}: ${text}`);
      if(!retryable(response.status)||attempt===4)throw error;
      lastError=error;
      const retryAfter=Number(response.headers.get('retry-after')||0)*1000;
      await sleep(Math.max(1000,Math.min(15000,retryAfter||1000*(2**attempt))));
    }catch(error){
      lastError=error;
      if(attempt===4)throw error;
      await sleep(Math.min(15000,1000*(2**attempt)));
    }
  }
  throw lastError||new Error('GitHub API request failed without an error');
}

async function checkRuns(){
  const out=[];
  for(let page=1;page<=10;page++){
    const payload=await json(`${api}/repos/${repository}/commits/${sha}/check-runs?filter=latest&per_page=100&page=${page}`),rows=payload.check_runs||[];
    out.push(...rows);
    if(rows.length<100)break;
  }
  return out;
}

function conclusionState(run){if(run.status!=='completed')return'pending';return['success','neutral','skipped'].includes(run.conclusion)?'success':'failure';}
function authority(run){const name=String(run?.name||'');return diagnosticPrefixes.some(prefix=>name.startsWith(prefix))?'diagnostic':'required';}
function diagnosticPhase(run){const text=`${run?.output?.title||''}\n${run?.output?.summary||''}\n${run?.output?.text||''}`;const match=text.match(/ICTC_BROWSER_PHASE=([A-Za-z0-9._:-]+)/);return match?.[1]||'';}
function browserSourceFor(run){const name=String(run?.name||'');if(name.startsWith(browserSourcePrefix))return name.slice(browserSourcePrefix.length).trim();return professionalBrowserSources.get(name)||'';}

async function annotationPhase(run){
  const source=browserSourceFor(run);
  if(!run?.id||!source)return'';
  if(annotationPhaseCache.has(run.id))return annotationPhaseCache.get(run.id);
  let phase='';
  try{
    const annotations=await json(`${api}/repos/${repository}/check-runs/${run.id}/annotations?per_page=100`),text=(Array.isArray(annotations)?annotations:[]).map(row=>`${row?.title||''}\n${row?.message||''}\n${row?.raw_details||''}`).join('\n'),match=text.match(/ICTC_BROWSER_PHASE=([A-Za-z0-9._:-]+)/);
    phase=match?.[1]||'';
  }catch(error){
    console.warn(`browser annotation provenance unavailable for ${run.id}: ${error.message}`);
  }
  if(phase)annotationPhaseCache.set(run.id,phase);
  return phase;
}

async function resolvedPhase(run){return diagnosticPhase(run)||await annotationPhase(run);}
function sourceTarget(run,phase=diagnosticPhase(run)){
  const browserSource=browserSourceFor(run);
  if(browserSource&&/^v3\/browser-[A-Za-z0-9._/-]+\.py$/.test(browserSource)){
    const base=`https://github.com/${repository}/blob/${sha}/${browserSource}`;
    return phase?`${base}?phase=${encodeURIComponent(phase)}`:base;
  }
  return run?.details_url||run?.html_url||'';
}
function failureRank(run){const name=String(run?.name||'');if(name.startsWith(browserSourcePrefix))return 0;if(professionalBrowserSources.has(name))return 0;if(aggregateChecks.has(name))return 2;return 1;}
function rankedFailures(runs){return runs.filter(run=>authority(run)==='required'&&conclusionState(run)==='failure').sort((a,b)=>failureRank(a)-failureRank(b)||String(a.name||'').localeCompare(String(b.name||''))||Number(a.id||0)-Number(b.id||0));}
async function post(state,description,targetUrl=''){const body={state,context:'ictc/actions-census',description:String(description).slice(0,140)};if(targetUrl)body.target_url=targetUrl;await json(`${api}/repos/${repository}/statuses/${sha}`,{method:'POST',body:JSON.stringify(body)});}
async function writeReport(report){await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(artifactUrl,JSON.stringify(report,null,2));}

async function main(){
  const started=Date.now(),deadline=started+timeoutMs;
  let previousSignature='',stablePolls=0,last=[];
  await post('pending','enumerating exact-head GitHub Actions check-runs');
  while(true){
    const all=await checkRuns(),runs=all.filter(run=>!selfNames.has(run.name));
    last=runs;
    const signature=runs.map(run=>`${run.id}:${run.name}:${run.status}:${run.conclusion||''}:${authority(run)}`).sort().join('|');
    stablePolls=signature===previousSignature?stablePolls+1:0;
    previousSignature=signature;
    const required=runs.filter(run=>authority(run)==='required'),failures=rankedFailures(required),pending=required.filter(run=>conclusionState(run)==='pending'),diagnostic=runs.filter(run=>authority(run)==='diagnostic'),observedFor=Date.now()-started,settled=observedFor>=minObserveMs&&pending.length===0&&stablePolls>=2;
    if(settled||Date.now()>=deadline)break;
    const diagnosticPending=diagnostic.filter(run=>conclusionState(run)==='pending').length,root=failures[0],rootPhase=root?await resolvedPhase(root):'';
    await post('pending',`required: ${required.length} checks, ${failures.length} failed, ${pending.length} pending${rootPhase?` — ${rootPhase}`:''}; diagnostic pending ${diagnosticPending}`,sourceTarget(root,rootPhase));
    await sleep(pollMs);
  }

  const phases=new Map();
  for(const run of last)if(conclusionState(run)==='failure'&&browserSourceFor(run))phases.set(run.id,await resolvedPhase(run));
  const rows=last.map(run=>{const phase=phases.get(run.id)||diagnosticPhase(run)||'';return{id:run.id,name:run.name,authority:authority(run),status:run.status,conclusion:run.conclusion||null,detailsUrl:run.details_url||run.html_url||null,sourceUrl:sourceTarget(run,phase)||null,diagnosticPhase:phase||null,failureRank:failureRank(run),startedAt:run.started_at||null,completedAt:run.completed_at||null,state:conclusionState(run)};});
  const requiredRows=rows.filter(row=>row.authority==='required'),diagnosticRows=rows.filter(row=>row.authority==='diagnostic');
  const failures=requiredRows.filter(row=>row.state==='failure').sort((a,b)=>a.failureRank-b.failureRank||String(a.name||'').localeCompare(String(b.name||''))||Number(a.id||0)-Number(b.id||0)),pending=requiredRows.filter(row=>row.state==='pending'),diagnosticFailures=diagnosticRows.filter(row=>row.state==='failure'),diagnosticPending=diagnosticRows.filter(row=>row.state==='pending'),report={schemaVersion:'1.9.0',authority:'github-check-runs-exact-head',acceptanceAuthority:'required-checks-only',aggregateStatusAuthority:'ictc/actions-census',nativeJobPolicy:'observer-only',diagnosticPolicy:'reported-not-gating',browserPhaseAuthority:'native-check-annotations+output-fallback',professionalBrowserSourceAuthority:'explicit-required-leaf-map',rootSelection:'leaf-before-aggregate',headSha:sha,observedAt:new Date().toISOString(),checkCount:rows.length,requiredCheckCount:requiredRows.length,diagnosticCheckCount:diagnosticRows.length,failureCount:failures.length,pendingCount:pending.length,diagnosticFailureCount:diagnosticFailures.length,diagnosticPendingCount:diagnosticPending.length,allGreen:failures.length===0&&pending.length===0,checks:rows};
  await writeReport(report);
  if(report.allGreen){
    await post('success',`all ${requiredRows.length} required exact-head checks completed without failure; diagnostics ${diagnosticRows.length}`);
    console.log(JSON.stringify(report));
    return;
  }
  const roots=failures.slice(0,3).map(row=>row.diagnosticPhase?`${row.name}@${row.diagnosticPhase}`:row.name).join(', '),suffix=roots?` — ${roots}`:'';
  await post('failure',`required exact head: ${failures.length} failed, ${pending.length} pending of ${requiredRows.length}${suffix}`,failures[0]?.sourceUrl||failures[0]?.detailsUrl||'');
  console.error(JSON.stringify(report));
  console.error('actions-census native job is observational; ictc/actions-census is the sole aggregate acceptance status');
}

try{
  await main();
}catch(error){
  const message=String(error?.stack||error?.message||error);
  const report={schemaVersion:'1.9.0',authority:'github-check-runs-exact-head',acceptanceAuthority:'required-checks-only',aggregateStatusAuthority:'ictc/actions-census',headSha:sha,observedAt:new Date().toISOString(),allGreen:false,internalError:{type:error?.name||'Error',message:String(error?.message||error)}};
  try{await writeReport(report);}catch(writeError){console.error(`actions-census artifact failure: ${writeError.message}`);}
  try{await post('failure',`actions-census internal error: ${String(error?.message||error).slice(0,96)}`,`https://github.com/${repository}/blob/${sha}/v3/actions-census.mjs`);}catch(postError){console.error(`actions-census final status publication failure: ${postError.message}`);}
  console.error(message);
  process.exitCode=1;
}
