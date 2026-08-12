import path from 'node:path';
import { Store } from './store.mjs';
import { HardenedSqliteStatePersistence } from './runtime/hardened-persistence.mjs';
import { hardenAttachmentStorage } from './runtime/attachment-storage.mjs';
import { enforceAttachmentIntegrity } from './runtime/attachment-integrity.mjs';
export class RuntimeStore extends Store{
  constructor(root,{tenantId=null}={}){super(root);this.tenantId=tenantId||((process.env.ICTC_MULTI_TENANT==='1'&&path.basename(path.dirname(root))==='tenants')?path.basename(root):'local-default');this.persistence=new HardenedSqliteStatePersistence(root);}
  async init(){await super.init();await hardenAttachmentStorage(this);enforceAttachmentIntegrity(this);return this;}
}
