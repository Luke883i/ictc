const stages=[
  ['fixture','./runtime/demo-suite-2-2-fixture.mjs'],
  ['foundation','./runtime/demo-suite-2-2-replay-foundation.mjs'],
  ['work','./runtime/demo-suite-2-2-replay-work.mjs'],
  ['replay','./runtime/demo-suite-2-2-replay.mjs'],
  ['materializer','./runtime/demo-suite-2-2.mjs']
];
const slug=value=>String(value||'error').toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,42)||'error';
async function publish(stage,error){
  const token=process.env.GH_TOKEN||'',repository=process.env.GITHUB_REPOSITORY||'',sha=process.env.HEAD_SHA||'';
  if(!token||!repository||!/^[0-9a-f]{40}$/i.test(sha))return;
  const context=`ictc/demo-load-failure-${slug(stage)}-${slug(error?.code||error?.name)}-${slug(error?.message)}`.slice(0,100);
  await fetch(`https://api.github.com/repos/${repository}/statuses/${sha}`,{method:'POST',headers:{authorization:`Bearer ${token}`,accept:'application/vnd.github+json','x-github-api-version':'2022-11-28','content-type':'application/json'},body:JSON.stringify({state:'failure',context,description:`${stage}: ${error?.message||error}`.slice(0,140)})}).catch(()=>{});
}
for(const [stage,path] of stages){
  try{await import(path);console.log(`demo-suite-2-2-module-load: ${stage} ok`);}catch(error){await publish(stage,error);console.error(`demo-suite-2-2-module-load: ${stage} failed`,error);process.exitCode=1;break;}
}
if(!process.exitCode)console.log('demo-suite-2-2-module-load: ok');
