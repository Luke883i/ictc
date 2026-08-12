import path from 'node:path';
import { RuntimeStore } from './runtime-store.mjs';
import { createEncryptedRecoveryPoint, restoreEncryptedRecoveryPoint } from './runtime/recovery.mjs';
import { tenantDirectory, tenantRuntimePath } from './runtime/tenant-authority.mjs';
const [command,...args]=process.argv.slice(2),flag=name=>{const i=args.indexOf(`--${name}`);return i>=0?args[i+1]:null;};
try{
  if(command==='backup'){
    const runtimeRoot=process.env.ICTC_RUNTIME_DIR||path.join(process.cwd(),'runtime'),directory=tenantDirectory(process.env),tenantId=flag('tenant')||directory.defaultTenantId,destination=flag('destination')||process.env.ICTC_RECOVERY_DIR;if(!destination)throw Object.assign(new Error('Configura --destination o ICTC_RECOVERY_DIR'),{code:'recovery-destination-required'});const store=await new RuntimeStore(tenantRuntimePath(runtimeRoot,tenantId,directory)).init();try{console.log(JSON.stringify(await createEncryptedRecoveryPoint({store,tenantId,destinationRoot:path.resolve(destination)}),null,2));}finally{store.close();}
  }else if(command==='restore'){
    const source=flag('source'),target=flag('target');if(!source||!target)throw Object.assign(new Error('restore richiede --source e --target'),{code:'recovery-restore-args-required'});console.log(JSON.stringify(await restoreEncryptedRecoveryPoint({sourceDir:path.resolve(source),targetRuntimeDir:path.resolve(target)}),null,2));
  }else throw Object.assign(new Error('Uso: node v3/recovery-cli.mjs backup --tenant ID --destination DIR | restore --source DIR --target DIR'),{code:'recovery-command-invalid'});
}catch(error){console.error(JSON.stringify({ok:false,code:error.code||'recovery-failed',error:error.message,details:error.details||null}));process.exit(2);}
