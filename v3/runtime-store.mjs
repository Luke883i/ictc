import { AsyncLocalStorage } from 'node:async_hooks';
import path from 'node:path';
import { Store } from './store.mjs';
import { HardenedSqliteStatePersistence } from './runtime/hardened-persistence.mjs';
import { assertPersistenceCapability } from './runtime/persistence-capability.mjs';
import { hardenAttachmentStorage } from './runtime/attachment-storage.mjs';
import { enforceAttachmentIntegrity } from './runtime/attachment-integrity.mjs';
import { capacityContractProjection } from './runtime/capacity-contract.mjs';
export class RuntimeStore extends Store{
  constructor(root,{tenantId=null}={}){super(root);this.tenantId=tenantId||((process.env.ICTC_MULTI_TENANT==='1'&&path.basename(path.dirname(root))==='tenants')?path.basename(root):'local-default');this.persistence=new HardenedSqliteStatePersistence(root);assertPersistenceCapability(this.persistence);this.schedulerExecution=new AsyncLocalStorage();}
  async init(){await super.init();await hardenAttachmentStorage(this);enforceAttachmentIntegrity(this);return this;}
  capacityPosture(evidence=null){return capacityContractProjection({architecture:{sharedDurableAuthority:false,tenantIsolationEnforced:null,subjectScopedConcurrency:false,atomicCommitReceipt:null,incrementalIntegrity:false,durableCommandLedger:true,durableWorkClaims:false,projectionDelta:null,revisionGapRecovery:null,sharedBlobAuthority:false,distributedIngressBudget:null,statelessReplicas:false,externalObservability:null},evidence,context:{scope:'runtime-store',tenantId:this.tenantId,adapter:'sqlite-hardened',claim:'local adapter posture declassifies enterprise scale; unknown cross-runtime capabilities remain blockers'}});}
  withSchedulerClaim(claim,fn){if(typeof fn!=='function')throw new TypeError('scheduler claim callback required');return this.schedulerExecution.run(claim,fn);}
  async mutate(actor,action,subject,input,change,command={}){const claim=this.schedulerExecution.getStore();if(!claim)return super.mutate(actor,action,subject,input,change,command);const guarded=async draft=>{this.persistence.assertSchedulerClaim(claim);const result=await change(draft);this.persistence.assertSchedulerClaim(claim);return result;};return super.mutate(actor,action,subject,input,guarded,command);}
}
