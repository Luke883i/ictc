import { randomUUID } from 'node:crypto';

const buckets=Object.freeze([5,25,100,250,500,1000,2500,5000,10000]);
const text=(v,max=200)=>String(v??'').replace(/[\r\n\t]/g,' ').slice(0,max);
export function routeTemplate(pathname=''){
  const parts=String(pathname||'/').split('/').map((part,index)=>{
    if(index<3||!part)return part;
    if(/^\d+$/.test(part)||part.length>20||/^[a-f0-9-]{16,}$/i.test(part))return ':id';
    return part;
  });
  return parts.join('/')||'/';
}
export function createOperationalObservability({service='ictc',sink=line=>console.log(line),clock=()=>Date.now()}={}){
  const startedAt=new Date(clock()).toISOString(),durationBuckets=Object.fromEntries(buckets.map(v=>[String(v),0]));
  const counters={requestsTotal:0,errorsTotal:0,rateLimitedTotal:0,inFlight:0};const byStatusClass={};const byRoute=new Map();
  function log(event,fields={}){const safe={};for(const[key,value]of Object.entries(fields)){if(/secret|token|authorization|cookie|body|payload|email/i.test(key))continue;if(value==null||['string','number','boolean'].includes(typeof value))safe[key]=typeof value==='string'?text(value,500):value;}sink(JSON.stringify({ts:new Date(clock()).toISOString(),service,event,...safe}));}
  function start({method='GET',pathname='/',tenantId='unknown'}={}){
    const requestId=randomUUID(),started=clock(),route=routeTemplate(pathname);counters.requestsTotal+=1;counters.inFlight+=1;
    return{requestId,route,finish({status=200,code=null,rateLimited=false}={}){const durationMs=Math.max(0,clock()-started);counters.inFlight=Math.max(0,counters.inFlight-1);if(status>=500)counters.errorsTotal+=1;if(rateLimited)counters.rateLimitedTotal+=1;const cls=`${Math.floor(Number(status)/100)}xx`;byStatusClass[cls]=(byStatusClass[cls]||0)+1;let bucketed=false;for(const bucket of buckets)if(!bucketed&&durationMs<=bucket){durationBuckets[String(bucket)]+=1;bucketed=true;}if(!bucketed)durationBuckets['+Inf']=(durationBuckets['+Inf']||0)+1;const key=`${method} ${route}`;const row=byRoute.get(key)||{count:0,errors:0,totalDurationMs:0};row.count+=1;row.totalDurationMs+=durationMs;if(status>=500)row.errors+=1;byRoute.set(key,row);log('http_request',{requestId,method,route,tenantId,status,code,durationMs});return{requestId,durationMs};}};
  }
  function snapshot(){return{schemaVersion:'1.0.0',service,startedAt,generatedAt:new Date(clock()).toISOString(),counters:{...counters},byStatusClass:{...byStatusClass},durationMsBuckets:{...durationBuckets},routes:[...byRoute.entries()].slice(0,200).map(([route,row])=>({route,...row,meanDurationMs:row.count?Number((row.totalDurationMs/row.count).toFixed(2)):0})),claimBoundary:'Process-local operational telemetry; deployment observability still requires external collection, alerting and drill evidence.'};}
  return Object.freeze({start,log,snapshot});
}
