// A1: mutate ACTUAL product/runtime source files on disk in an isolated clone.
// This is not a compiled-bitmask campaign; each mutant executes the actual E2 gate.
import assert from 'node:assert/strict';
import {mkdtemp,cp,rm,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=await mkdtemp(join(tmpdir(),'ictc-prod-mutants-'));
const dest=join(dir,'repository');
const specimens=[
 ['duplicate-enabled-services','v3/server.mjs','services:enabledProcedureIds(snapshot)','services:Array(7).fill(procedureAdapterIds()[0])'],
 ['duplicate-supported-services','v3/server.mjs','supportedServices:procedureAdapterIds()','supportedServices:Array(7).fill(procedureAdapterIds()[0])'],
 ['spoof-health-integrity','v3/server.mjs','roles:ROLES,integrity:store.verifyChain()','roles:ROLES,integrity:{ok:true}'],
 ['false-health-version','v3/server.mjs','version:VERSION,product:PRODUCT_NAME',"version:'9.9.9',product:PRODUCT_NAME"],
 ['registry-id-corruption','v3/runtime/procedure-adapters.mjs',"id:'monitoring',surface:'monitoring'","id:'not-monitoring',surface:'monitoring'"],
 ['registry-identifier-duplication','v3/runtime/procedure-adapters.mjs','return ADAPTERS.map(item=>item.id);}','return Array(7).fill(ADAPTERS[0].id);}' ],
 ['product-scope-corruption','docs/PRODUCT.md','RN-01','REMOVED-PROCESS'],
 ['missing-release-version','v3/release-identity.json','"productVersion":"1.8.0"','"productVersion":"9.9.9"'],
 ['security-binding-expression','v3/runtime/http.mjs','assertSafeRuntimeBinding','assertUnsafeRuntimeBinding'],
 ['missing-doc-router','docs/documentation-manifest.json','"entrypoint": "docs/START_HERE.md"','"entrypoint": "README.md"']
];
const receipt={schemaVersion:'ictc-real-product-mutants/v1',authority:'E2 source/runtime falsification only',cases:[],mutants:specimens.length};
try{
  await cp(root,dest,{recursive:true,filter:path=>!/(?:^|\/)\.git(?:\/|$)|(?:^|\/)node_modules(?:\/|$)|(?:^|\/)artifacts(?:\/|$)/.test(path)});
  const check=()=>spawnSync(process.execPath,['v3/release-readiness-e2-gate.mjs'],{cwd:dest,encoding:'utf8',timeout:45000,env:{...process.env,ICTC_RELEASE_RUNTIME_WITNESS:''}});
  const baseline=check();assert.equal(baseline.status,0,`preseed failed: ${baseline.stderr?.slice(-500)} ${baseline.stdout?.slice(-100)}`);
  for(const [id,path,needle,replacement] of specimens){
    const f=join(dest,path),original=await readFile(f,'utf8');
    assert.ok(original.includes(needle),`mutant fixture stale ${id}`);
    const mutated=original.replace(needle,replacement);assert.notEqual(mutated,original);
    await writeFile(f,mutated);
    try{
      const run=check();const detected=run.status!==0;
      receipt.cases.push({id,path,sha256:createHash('sha256').update(mutated).digest('hex'),exit:run.status,detected,reason:(run.stderr||run.stdout||'').slice(-280)});
      assert.ok(detected,`product mutant survived: ${id}`);
    }finally{await writeFile(f,original);}
  }
  receipt.killed=receipt.cases.filter(c=>c.detected).length;receipt.survivors=receipt.mutants-receipt.killed;
  assert.equal(receipt.survivors,0);
  console.log(JSON.stringify(receipt));
}finally{await rm(dir,{recursive:true,force:true});}
