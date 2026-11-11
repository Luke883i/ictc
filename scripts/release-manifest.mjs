/**
 * Historical diagnostic inventory, NOT the canonical C2 release manifest.
 * Use only Git-tracked, clean-tree files; never scan the filesystem recursively.
 * The actual exact-candidate SBOM and attestations remain in delivery-provenance-check.mjs.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, lstat, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const tracked=execFileSync('git',['ls-files','-z'],{cwd:root}).toString('utf8').split('\0').filter(Boolean).sort();
const forbidden=rel=> /^(?:runtime|artifacts)(?:\/|$)/.test(rel)
  ||/(^|\/)(?:\.git|\.ictc|node_modules)(\/|$)/.test(rel)
  ||/(^|\/)\.env(?!\.example$)(?:$|\.)/.test(rel)
  ||/(^|\/)(?:id_rsa|id_ed25519|private-key|secrets?)(?:\.|$)/i.test(rel);
const secrets=tracked.filter(forbidden);
if(secrets.length)throw new Error(`Manifest blocked: tracked sensitive/runtime paths ${secrets.join(', ')}`);
if(git('status','--porcelain','--untracked-files=no'))throw new Error('Manifest blocked: tracked worktree is dirty');
const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
const identity=JSON.parse(await readFile(path.join(root,'src/contracts/release-identity.json'),'utf8'));
if(pkg.version!==identity.productVersion||pkg.name!=='ictc'||identity.product!=='ICTC')
 throw new Error('Manifest blocked: package/release identity mismatch');
const files=[];
for(const rel of tracked){
 const absolute=path.resolve(root,rel),relative=path.relative(root,absolute);
 if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error(`Manifest path escape: ${rel}`);
 const info=await lstat(absolute);
 if(!info.isFile())throw new Error(`Manifest refuses non-regular tracked file: ${rel}`);
 const bytes=await readFile(absolute);
 files.push({path:rel,bytes:bytes.length,sha256:sha256(bytes)});
}
const manifest={schemaVersion:'2.0.0',product:'ICTC',version:pkg.version,releaseStage:identity.releaseStage,
 classification:'non-authoritative-diagnostic',releaseApproval:false,
 source:{gitSha:git('rev-parse','HEAD'),gitTree:git('rev-parse','HEAD^{tree}'),scope:'clean Git-tracked regular files only'},
 generatedAt:new Date().toISOString(),fileCount:files.length,files,
 limitation:'Not a release, deployed artifact, C2 provenance receipt, signed SBOM or approval.'};
await mkdir(path.join(root,'artifacts'),{recursive:true});
await writeFile(path.join(root,'artifacts','release-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
console.log(`release-manifest: diagnostic-only ${files.length} tracked files`);
