import { mkdir, writeFile } from 'node:fs/promises';

const token=process.env.GITHUB_TOKEN||'',repository=process.env.GITHUB_REPOSITORY||'',sha=process.env.HEAD_SHA||process.env.GITHUB_SHA||'',api=process.env.GITHUB_API_URL||'https://api.github.com';
const selfNames=new Set(String(process.env.ICTC_CENSUS_SELF_NAMES||'actions-census').split(',').map(x=>x.trim()).filter(Boolean));
const timeoutMs=Math.max(60_000,Math.min(70*60_000,Number(process.env.ICTC_CENSUS_TIMEOUT_MS||60*60_000))),pollMs=Math.max(5_000,Math.min(30_000,Number(process.env.ICTC_CENSUS_POLL_MS||15_000))),minObserveMs=Math.max(30_000,Math.min(5*60_000,Number(process.env.ICTC_CENSUS_MIN_OBSERVE_MS||90_000)));
const browserSourcePrefix='browser / ';
const aggregateChecks=new Set(['ci-verdict']);

if(!token||!repository||!/^[0-9a-f]{40}$/i.test(sha))throw new Error('GITHUB_TOKEN, GITHUB_REPOSITORY and exact HEAD_SHA are required');
const headers={accept:'application/vnd.github+json',authorization:`Bearer ${token}`,'x-github-api-version':'2022-11-28','content-type':'application/json'};

async function json(url,options={}){
  const response=await fetch(url,{...options,headers:{...headers,...options.headers}});
  if(!response.ok)throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  return response.json();
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
function conclusionState(run){
  if(run.status!=='completed')return'pending';
  return['success','neutral','skipped'].includes(run.conclusion)?'success':'failure';
}
function sourceTarget(run){
  const name=String(run?.name||'');
  if(name.startsWith(browserSourcePrefix)){
    const browserSource=name.slice(browserSourcePrefix.length).trim();
    if(/^v3\/browser-[A-Za-z0-9._/-]+\.py$/.test(browserSource))return `https://github.com/${repository}/blob/${sha}/${browserSource}`;
  }
  return run?.details_url||run?.html_url||'';
}
function failureRank(run){
  const name=String(run?.name||'');
  if(name.startsWith(browserSourcePrefix))return 0;
  if(aggregateChecks.has(name))return 2;
  return 1;
}
function rankedFailures(runs){
  return runs.filter(run=>conclusionState(run)==='failure').sort((a,b)=>failureRank(a)-failureRank(b)||String(a.name||'').localeCompare(String(b.name||''))||Number(a.id||0)-Number(b.id||0));
}
async function post(state,description,targetUrl=''){
  const body={state,context:'ictc/actions-census',description:String(description).slice(0,140)};
  if(targetUrl)body.target_url=targetUrl;
  await json(`${api}/repos/${repository}/statuses/${sha}`,{method:'POST',body:JSON.stringify(body)});
}

const started=Date.now(),deadline=started+timeoutMs;
let previousSignature='',stablePolls=0,last=[];
await post('pending','enumerating exact-head GitHub Actions check-runs');

while(true){
  const all=await checkRuns(),runs=all.filter(run=>!selfNames.has(run.name));
  last=runs;
  const signature=runs.map(run=>`${run.id}:${run.name}:${run.status}:${run.conclusion||''}`).sort().join('|');
  stablePolls=signature===previousSignature?stablePolls+1:0;
  previousSignature=signature;
  const failures=rankedFailures(runs),pending=runs.filter(run=>conclusionState(run)==='pending'),observedFor=Date.now()-started,settled=observedFor>=minObserveMs&&pending.length===0&&stablePolls>=2;
  if(settled||Date.now()>=deadline)break;
  await post('pending',`exact head: ${runs.length} checks, ${failures.length} failed, ${pending.length} pending`,sourceTarget(failures[0]));
  await new Promise(resolve=>setTimeout(resolve,pollMs));
}

const rows=last.map(run=>({
  id:run.id,
  name:run.name,
  status:run.status,
  conclusion:run.conclusion||null,
  detailsUrl:run.details_url||run.html_url||null,
  sourceUrl:sourceTarget(run)||null,
  failureRank:failureRank(run),
  startedAt:run.started_at||null,
  completedAt:run.completed_at||null,
  state:conclusionState(run)
}));
const failures=rows.filter(row=>row.state==='failure').sort((a,b)=>a.failureRank-b.failureRank||String(a.name||'').localeCompare(String(b.name||''))||Number(a.id||0)-Number(b.id||0)),pending=rows.filter(row=>row.state==='pending'),report={schemaVersion:'1.4.0',authority:'github-check-runs-exact-head',rootSelection:'leaf-before-aggregate',headSha:sha,observedAt:new Date().toISOString(),checkCount:rows.length,failureCount:failures.length,pendingCount:pending.length,allGreen:failures.length===0&&pending.length===0,checks:rows};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
await writeFile(new URL('../artifacts/actions-census.json',import.meta.url),JSON.stringify(report,null,2));

if(report.allGreen){
  await post('success',`all ${rows.length} exact-head Actions checks completed without failure`);
  console.log(JSON.stringify(report));
  process.exit(0);
}
const roots=failures.slice(0,3).map(row=>row.name).join(', '),suffix=roots?` — ${roots}`:'';
await post('failure',`exact head: ${failures.length} failed, ${pending.length} pending of ${rows.length}${suffix}`,failures[0]?.sourceUrl||failures[0]?.detailsUrl||'');
console.error(JSON.stringify(report));
process.exit(1);
