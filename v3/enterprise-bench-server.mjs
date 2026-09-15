import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { sha256 } from './domain.mjs';
import { createEnterpriseBenchRuntime } from './runtime/enterprise-bench-runtime.mjs';

const json=(res,status,payload)=>{const body=JSON.stringify(payload);res.writeHead(status,{'content-type':'application/json; charset=utf-8','content-length':Buffer.byteLength(body)});res.end(body);};
const text=(value,max=2000)=>String(value??'').trim().slice(0,max);
async function bodyJson(req,limit=2_000_000){const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>limit)throw Object.assign(new Error('Request body too large'),{status:413,code:'body-too-large'});chunks.push(chunk);}if(!chunks.length)return{};try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Object.assign(new Error('Invalid JSON'),{status:400,code:'invalid-json'});}}
function decodeRateHeader(req){const raw=text(req.headers['x-ictc-rate-attestation'],12000);if(!raw)throw Object.assign(new Error('Distributed rate attestation required'),{status:401,code:'rate-attestation-required'});try{return JSON.parse(Buffer.from(raw,'base64url').toString('utf8'));}catch{throw Object.assign(new Error('Invalid distributed rate attestation'),{status:400,code:'rate-attestation-invalid'});}}
function statusFor(error){if(error?.status)return error.status;if(['subject-version-conflict','command-id-conflict','work-claim-fenced'].includes(error?.code))return 409;if(String(error?.code||'').startsWith('distributed-rate'))return 429;return 500;}
function normalizeSubjects(items=[]){return (Array.isArray(items)?items:[]).map(item=>({subject:item.subject,expectedVersion:item.expectedVersion??null,payload:item.payload??null,payloadSha256:sha256(item.payload??null)}));}
function requireRate(runtime,req,{tenantId,subject}){const attestation=decodeRateHeader(req),result=runtime.kernel.consumeRate({tenantId,subject,scope:'authenticated',attestation});if(!result.allowed)throw Object.assign(new Error('Rate limit denied'),{status:429,code:'rate-limited',details:result});return result;}

export async function createEnterpriseBenchServer({env=process.env,runtime=null}={}){
  const owned=!runtime,active=runtime||await createEnterpriseBenchRuntime({env}),server=http.createServer(async(req,res)=>{
    const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`),method=req.method||'GET';
    try{
      if(method==='GET'&&url.pathname==='/health'){json(res,200,{ok:true,service:'ictc-enterprise-bench',posture:active.posture(),persistence:active.persistence.runtimePosture(),blob:active.blob.runtimePosture(),telemetry:active.telemetry.runtimePosture()});return;}
      if(method==='POST'&&url.pathname==='/commit'){
        const input=await bodyJson(req),tenantId=input.tenantId,actorId=text(input.actorId,240)||'bench-user';requireRate(active,req,{tenantId,subject:actorId});
        const envelope=await active.kernel.commit({tenantId,commandId:input.commandId,actorId,action:input.action||'bench.commit',subjects:normalizeSubjects(input.subjects),event:input.event||{},providerWork:Array.isArray(input.providerWork)?input.providerWork:[]});
        json(res,200,envelope);return;
      }
      if(method==='GET'&&url.pathname==='/projection'){
        const tenantId=url.searchParams.get('tenantId'),subjectTypes=url.searchParams.getAll('type'),cursor=url.searchParams.get('cursor')||null,limit=Number(url.searchParams.get('limit')||80);
        json(res,200,await active.kernel.query({tenantId,subjectTypes,cursor,limit}));return;
      }
      if(method==='POST'&&url.pathname==='/work/enqueue'){const input=await bodyJson(req);requireRate(active,req,{tenantId:input.tenantId,subject:input.ownerId||'worker'});json(res,200,await active.kernel.enqueueProviderWork(input));return;}
      if(method==='POST'&&url.pathname==='/work/claim'){const input=await bodyJson(req);requireRate(active,req,{tenantId:input.tenantId,subject:input.ownerId});json(res,200,{claim:await active.kernel.claimWork(input)});return;}
      if(method==='POST'&&url.pathname==='/work/complete'){const input=await bodyJson(req);requireRate(active,req,{tenantId:input.tenantId,subject:input.ownerId});json(res,200,await active.kernel.completeWork(input));return;}
      if(method==='POST'&&url.pathname==='/blob/put'){const input=await bodyJson(req);requireRate(active,req,{tenantId:input.tenantId,subject:input.subject||'blob-writer'});const buffer=Buffer.from(String(input.dataBase64||''),'base64');json(res,200,await active.kernel.putBlob({...input,buffer}));return;}
      if(method==='POST'&&url.pathname==='/blob/promote'){const input=await bodyJson(req);requireRate(active,req,{tenantId:input.tenantId,subject:input.subject||'blob-writer'});json(res,200,await active.kernel.promoteBlob(input));return;}
      if(method==='GET'&&url.pathname==='/blob'){const tenantId=url.searchParams.get('tenantId'),attachmentId=url.searchParams.get('attachmentId'),digest=url.searchParams.get('digest'),state=url.searchParams.get('state')||'clean',blob=await active.kernel.getBlob({tenantId,attachmentId,digest,state});json(res,200,blob?{...blob,body:undefined,dataBase64:Buffer.from(blob.body).toString('base64')}:{blob:null});return;}
      if(method==='POST'&&url.pathname==='/telemetry'){const input=await bodyJson(req);requireRate(active,req,{tenantId:input.tenantId,subject:input.subject||'telemetry'});json(res,200,await active.kernel.emitTelemetry(input));return;}
      if(method==='POST'&&url.pathname==='/recover'){const input=await bodyJson(req);json(res,200,active.kernel.recover(input.clientRevision,input.delta));return;}
      json(res,404,{error:'Not found',code:'not-found'});
    }catch(error){json(res,statusFor(error),{error:error?.message||'Internal error',code:error?.code||'internal-error',details:error?.details||null});}
  });
  server.headersTimeout=15000;server.requestTimeout=60000;server.keepAliveTimeout=5000;
  return Object.freeze({runtime:active,server,listen:({host='127.0.0.1',port=Number(env.ICTC_ENTERPRISE_BENCH_PORT||4711)}={})=>new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,()=>{server.off('error',reject);resolve({host,port,address:server.address()});});}),close:()=>new Promise(resolve=>server.close(async()=>{if(owned)await active.close().catch(()=>{});resolve();}))});
}

async function main(){const bench=await createEnterpriseBenchServer();const host=process.env.ICTC_ENTERPRISE_BENCH_HOST||'127.0.0.1',port=Number(process.env.ICTC_ENTERPRISE_BENCH_PORT||4711),address=await bench.listen({host,port});console.log(JSON.stringify({ok:true,event:'ictc-enterprise-bench-listening',address,posture:bench.runtime.posture()}));const shutdown=async()=>{await bench.close();process.exit(0);};process.once('SIGTERM',shutdown);process.once('SIGINT',shutdown);}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(error=>{console.error(error);process.exit(1);});
