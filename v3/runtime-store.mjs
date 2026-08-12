import { Store } from './store.mjs';
import { HardenedSqliteStatePersistence } from './runtime/hardened-persistence.mjs';
import { hardenAttachmentStorage } from './runtime/attachment-storage.mjs';
import { enforceAttachmentIntegrity } from './runtime/attachment-integrity.mjs';
export class RuntimeStore extends Store{
  constructor(root){super(root);this.persistence=new HardenedSqliteStatePersistence(root);}
  async init(){await super.init();await hardenAttachmentStorage(this);enforceAttachmentIntegrity(this);return this;}
}
