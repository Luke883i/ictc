const text=(v,max=300)=>String(v??'').slice(0,max);
export function createAbuseBudget({capacity=120,refillPerSecond=2,maxKeys=4096,clock=()=>Date.now()}={}){
  const cap=Math.max(1,Math.min(100000,Number(capacity)||120)),refill=Math.max(0.01,Math.min(10000,Number(refillPerSecond)||2)),limit=Math.max(16,Math.min(100000,Number(maxKeys)||4096)),buckets=new Map();
  function evict(){if(buckets.size<limit)return;const oldest=[...buckets.entries()].sort((a,b)=>a[1].seenAt-b[1].seenAt).slice(0,Math.max(1,Math.ceil(limit*.1)));for(const[key]of oldest)buckets.delete(key);}
  function consume(keyValue,cost=1){const key=text(keyValue)||'anonymous',now=clock();let bucket=buckets.get(key);if(!bucket){evict();bucket={tokens:cap,at:now,seenAt:now};buckets.set(key,bucket);}const elapsed=Math.max(0,(now-bucket.at)/1000);bucket.tokens=Math.min(cap,bucket.tokens+elapsed*refill);bucket.at=now;bucket.seenAt=now;const need=Math.max(.01,Number(cost)||1);if(bucket.tokens>=need){bucket.tokens-=need;return{allowed:true,remaining:Math.floor(bucket.tokens),retryAfterSeconds:0};}const missing=need-bucket.tokens;return{allowed:false,remaining:0,retryAfterSeconds:Math.max(1,Math.ceil(missing/refill))};}
  return Object.freeze({consume,projection:()=>({schemaVersion:'1.0.0',capacity:cap,refillPerSecond:refill,trackedKeys:buckets.size,maxKeys:limit,scope:'process-local',distributedReady:false})});
}
