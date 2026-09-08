export const ADMIN_SLICE_ENDPOINTS=Object.freeze({
  readiness:'/api/admin/readiness',
  usage:'/api/admin/usage',
  users:'/api/admin/users',
  identity:'/api/admin/identity'
});
export const ADMIN_SLICE_KEYS=Object.freeze(Object.keys(ADMIN_SLICE_ENDPOINTS));

export function normalizeAdminSliceError(error){
  return Object.freeze({
    message:String(error?.message||'Dati amministrativi non disponibili'),
    status:Number.isFinite(Number(error?.status))?Number(error.status):null,
    code:error?.code?String(error.code):null
  });
}

export function createAdminSliceCoordinator({request,onState=()=>{}}={}){
  if(typeof request!=='function')throw new TypeError('request function is required');
  const epochs=new Map();
  const latest=new Map();

  async function load(key){
    const path=ADMIN_SLICE_ENDPOINTS[key];
    if(!path)throw new TypeError(`unknown admin slice: ${key}`);
    const epoch=(epochs.get(key)||0)+1;
    epochs.set(key,epoch);
    onState(Object.freeze({key,path,status:'loading',epoch}));
    let result;
    try{
      const value=await request(path);
      result=Object.freeze({key,path,status:'ready',value,error:null,epoch,stale:false});
    }catch(error){
      result=Object.freeze({key,path,status:'error',value:null,error:normalizeAdminSliceError(error),epoch,stale:false});
    }
    if(epochs.get(key)!==epoch)return Object.freeze({...result,stale:true});
    latest.set(key,result);
    onState(result);
    return result;
  }

  async function loadMany(keys=ADMIN_SLICE_KEYS){
    const requested=[...new Set(keys)];
    const settled=await Promise.allSettled(requested.map(key=>load(key)));
    return Object.freeze(settled.map((entry,index)=>entry.status==='fulfilled'?entry.value:Object.freeze({key:requested[index],path:ADMIN_SLICE_ENDPOINTS[requested[index]]||null,status:'internal-error',value:null,error:normalizeAdminSliceError(entry.reason),epoch:null,stale:false})));
  }

  return Object.freeze({
    load,
    loadMany,
    snapshot:()=>Object.freeze(Object.fromEntries([...latest.entries()])),
    epoch:key=>epochs.get(key)||0
  });
}
