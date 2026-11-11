import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { appendFile, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'../..');
const ARTIFACTS=path.join(ROOT,'artifacts');
const SHA_RE=/^[0-9a-f]{40}$/i;
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const readText=rel=>readFile(path.join(ROOT,rel),'utf8');
const readJson=async rel=>JSON.parse(await readText(rel));
function git(args){const r=spawnSync('git',['-C',ROOT,...args],{encoding:'utf8',maxBuffer:16*1024*1024});if(r.status!==0)throw Object.assign(new Error(`git ${args.join(' ')} failed: ${String(r.stderr||'').trim()}`),{code:'C2_GIT_FAILED',status:r.status});return String(r.stdout||'').trim();}
async function fileDigest(file){const bytes=await readFile(file);return Object.freeze({sha256:sha256(bytes),bytes:bytes.length});}
async function output(name,value){if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,`${name}=${value}\n`);}

const BUILD_ATTEST='actions/attest-build-provenance@4d101475d8b20a2381f78447822ac1eab6504dd8';
const SBOM_ATTEST='actions/attest@1e69f48acb82d1966a394da916b4c1698aa569d6';
const UPLOAD='actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a';

// Repository-bounded semantic check of the SINGLE canonical npm CycloneDX SBOM.
// This is a negative-control oracle, not an independent SBOM generator or 2026 certification.
export function validateSbomGraph({pkg,lock,sbom}){
 const insist=(condition,reason)=>assert.ok(condition,`C2_SBOM_SEMANTIC: ${reason}`);
 insist(sbom && typeof sbom==='object' && sbom.bomFormat==='CycloneDX','CycloneDX format');
 insist(/^1\.(?:[5-9]|[1-9][0-9])$/.test(String(sbom.specVersion||'')),'CycloneDX spec >=1.5');
 insist(Number.isInteger(sbom.version) && sbom.version>0,'CycloneDX document revision');
 const root=sbom.metadata?.component;
 insist(root && root.name===pkg.name && root.version===pkg.version,'root package identity/version');
 const tools=Array.isArray(sbom.metadata?.tools)?sbom.metadata.tools:(sbom.metadata?.tools?.components||[]);
 insist(tools.some(x=>x.name==='cli' && (x.vendor==='npm'||x.publisher==='npm')),'npm generator identity');
 insist(Array.isArray(sbom.components) && Array.isArray(sbom.dependencies),'components and dependency graph required');
 const componentRef=c=>String(c?.['bom-ref']||'');
 const parsePurl=c=>{
  const p=String(c?.purl||'');
  insist(p.startsWith('pkg:npm/'),'npm package URL required');
  const nameVersion=p.slice('pkg:npm/'.length).split(/[?#]/,1)[0];
  const sep=nameVersion.lastIndexOf('@');insist(sep>0,'versioned package URL required');
  let name,version;try{name=decodeURIComponent(nameVersion.slice(0,sep));version=decodeURIComponent(nameVersion.slice(sep+1));}catch{insist(false,'invalid package URL encoding');}
  insist(name&&version,'package URL must carry name and version');
  return {name,version};
 };
 insist(parsePurl(root).name===pkg.name && parsePurl(root).version===pkg.version,'root package purl');
 const refs=new Map();const components=new Map();const rootRef=componentRef(root);
 insist(rootRef,'root bom-ref required');refs.set(rootRef,root);
 for(const c of sbom.components){
  const ref=componentRef(c);insist(ref && !refs.has(ref),'duplicate or absent component bom-ref');
  const identity=parsePurl(c);insist(c.version===identity.version,'component purl/version disagreement');
  insist(c.name===identity.name || c.name===identity.name.split('/').at(-1),'component purl/name disagreement');
  const key=`${identity.name}@${identity.version}`;
  insist(!components.has(key),'duplicate component identity');refs.set(ref,c);components.set(key,{component:c,ref});
 }
 const lockPackages=lock?.packages;
 insist(lock.lockfileVersion>=2 && lockPackages && lockPackages[''],'versioned npm lockfile required');
 insist(lockPackages[''].name===pkg.name && lockPackages[''].version===pkg.version,'lock root identity');
 const paths=new Map();
 const pathName=p=>p.slice(p.lastIndexOf('node_modules/')+'node_modules/'.length);
 for(const [p,entry] of Object.entries(lockPackages))if(p&&p.includes('node_modules/')){
  insist(typeof entry.version==='string','locked component version required');
  paths.set(p,{entry,name:pathName(p),version:entry.version});
 }
 const resolveChild=(parentPath,name)=>{
  let prefix=parentPath;
  for(;;){const candidate=prefix?`${prefix}/node_modules/${name}`:`node_modules/${name}`;
   if(paths.has(candidate))return candidate;
   if(!prefix)break;
   const pos=prefix.lastIndexOf('/node_modules/');prefix=pos<0?'':prefix.slice(0,pos);
  }
  return null;
 };
 const visited=new Set();const mandatory=new Set();const expectedEdges=[];const ignoredOptional=[];
 function traverse(parentPath,entry,optionalContext=false){
  for(const [name,optional] of [...Object.keys(entry.dependencies||{}).map(n=>[n,false]),...Object.keys(entry.optionalDependencies||{}).map(n=>[n,true])]){
   const target=resolveChild(parentPath,name);
   if(!target){if(optional || optionalContext){ignoredOptional.push(name);continue;}insist(false,`locked required dependency ${parentPath||'root'} -> ${name} unresolved`);}
   const child=paths.get(target);const key=`${child.name}@${child.version}`;
   const present=components.has(key);
   if(!optional && !optionalContext)insist(present,`missing required locked component ${key}`);
   if(!present){ignoredOptional.push(key);continue;}
   if(!optional && !optionalContext)mandatory.add(key);
   expectedEdges.push([parentPath,target]);
   if(!visited.has(target)){visited.add(target);traverse(target,child.entry,optional || optionalContext);}
  }
 }
 traverse('',lockPackages['']);
 // Every component must correspond to this exact lockfile, even when optional.
 for(const [key] of components){insist([...paths.values()].some(x=>`${x.name}@${x.version}`===key),`unlocked SBOM component ${key}`);}
 // A component list can be complete yet falsely attribute different bytes or a
 // different licence. Compare fields only when backed by the committed lock.
 // This does NOT claim legal licence clearance or authenticity of downloaded bytes.
 let integrityMatches=0,licenceMatches=0;
 for(const {entry,name,version} of paths.values()){
  const actual=components.get(`${name}@${version}`)?.component;
  if(!actual)continue; // uninstalled optional platform package
  if(entry.integrity){
   const candidates=String(entry.integrity).trim().split(/\s+/).filter(Boolean);
   const expected=candidates.map(token=>{
    const match=/^(sha256|sha384|sha512)-([A-Za-z0-9+/]+={0,2})$/i.exec(token);
    insist(match,`unrecognized locked integrity for ${name}`);
    return {algorithm:match[1].toUpperCase(),content:Buffer.from(match[2],'base64').toString('hex')};
   });
   const hashes=Array.isArray(actual.hashes)?actual.hashes:[];
   insist(expected.some(x=>hashes.some(h=>String(h.alg||'').replace(/-/g,'').toUpperCase()===x.algorithm && String(h.content||'').toLowerCase()===x.content)),`locked digest disagreement ${name}@${version}`);
   integrityMatches++;
  }
  if(entry.license){
   const licenses=Array.isArray(actual.licenses)?actual.licenses:[];
   insist(licenses.some(x=>x?.license?.id===entry.license || x?.expression===entry.license),`locked license disagreement ${name}@${version}`);
   licenceMatches++;
  }
 }
 const graph=new Map();
 for(const record of sbom.dependencies){
  insist(record && refs.has(record.ref) && Array.isArray(record.dependsOn),'invalid dependency source');
  insist(!graph.has(record.ref),'duplicate dependency graph row');
  const edges=new Set();
  for(const to of record.dependsOn){insist(refs.has(to),'unresolved dependency graph ref');insist(!edges.has(to),'duplicate dependency graph edge');edges.add(to);}
  graph.set(record.ref,edges);
 }
 insist(graph.has(rootRef),'missing root dependency row');
 const refForPath=p=>p?components.get(`${paths.get(p).name}@${paths.get(p).version}`)?.ref:rootRef;
 for(const [fromPath,toPath] of expectedEdges){
  const from=refForPath(fromPath),to=refForPath(toPath);
  insist(from && to && graph.get(from)?.has(to),`missing locked dependency edge ${fromPath||'root'} -> ${toPath}`);
 }
 for(const key of mandatory)insist(graph.has(components.get(key).ref),`missing required component dependency row ${key}`);
 let missingLicense=0,missingHashes=0;
 for(const {component} of components.values()){
  if(!Array.isArray(component.licenses)||!component.licenses.length)missingLicense++;
  if(!Array.isArray(component.hashes)||!component.hashes.length)missingHashes++;
 }
 return {schema:'C2-SBOM-SOURCE-VALIDATION/3',ok:true,requiredComponents:mandatory.size,listedComponents:components.size,dependencyEdges:expectedEdges.length,lockedDigestMatches:integrityMatches,lockedLicenseMatches:licenceMatches,ignoredOptional:ignoredOptional.length,advisory:{componentsMissingLicense:missingLicense,componentsMissingHashes:missingHashes},claimBoundary:'Exact-lock component graph, digest and declared license matching only. Does not prove binary authenticity, license clearance, external attestation or deployment assurance.'};
}

async function staticCheck(){
 const [registry,workflow,security,manifest,gates,release]=await Promise.all([
  readJson('audit/remediation-registry.json'),readText('.github/workflows/enterprise-candidate.yml'),readText('.github/workflows/security.yml'),readJson('.github/enterprise-gate-manifest.json'),readText('scripts/current-gate-registry.mjs'),readText('docs/RELEASE.md')
 ]);
 const f06=registry.findings.find(x=>x.id==='F-06');
 assert.ok(f06,'F-06 missing');assert.equal(f06.gate,'repository');assert.equal(f06.requiredGrade,'E2');assert.equal(f06.status,'resolved');
 assert.match(f06.rootControl,/SBOM\/provenance\/signature pipeline/i);assert.match(f06.repositoryPosture,/exact-candidate|post-merge main/i);
 const claimBoundary='Repository-bounded E2 delivery evidence only. Candidate attestation/signing does not itself mean merge approval, release, deployment, independent review, Enterprise Candidate or Enterprise Ready. F-06/C2 transition to terminal only after merge plus post-merge ACT.';
 for(const token of [
  "id-token: write","attestations: write","artifact-metadata: write","contents: read","ICTC_EXPECTED_SHA: ${{ github.event.pull_request.head.sha || github.sha }}",
  'node tests/verification/delivery-provenance-check.mjs --prepare',BUILD_ATTEST,SBOM_ATTEST,'gh attestation verify',
  'node tests/verification/delivery-provenance-check.mjs --finalize',UPLOAD
 ])assert.ok(workflow.includes(token),`enterprise workflow missing ${token}`);
 assert.ok(workflow.includes('ref: "${{ github.event.pull_request.head.sha || github.sha }}"'),'enterprise checkout must remain exact-head');
 assert.equal(security.includes('Generate CycloneDX SBOM'),false,'security workflow must not retain a second canonical SBOM producer');
 const gate=manifest.localGates.find(x=>x.id==='delivery-provenance');assert.deepEqual(gate,{id:'delivery-provenance',command:'node tests/verification/delivery-provenance-check.mjs',grade:'E2'});assert.equal(manifest.externalBlockers.includes('signed build provenance verification'),false);
 assert.equal(gates.split("'tests/verification/delivery-provenance-check.mjs'").length-1,1,'delivery gate must be mounted once');
 for(const token of ['exact candidate','CycloneDX','GitHub OIDC','Sigstore','gh attestation verify','merge non equivale a release'])assert.ok(release.includes(token),`RELEASE missing ${token}`);
 const report={schemaVersion:'1.0.0',ok:true,control:'C2-DELIVERY-PROVENANCE',mode:'static-contract',owner:'F-06',actionPins:{build:BUILD_ATTEST,sbom:SBOM_ATTEST,upload:UPLOAD},claimBoundary};
 const falsify=spawnSync(process.execPath,['tests/verification/delivery-provenance-semantic-falsification.mjs','--cases=80','--physical=0'],{cwd:ROOT,encoding:'utf8',maxBuffer:4*1024*1024});assert.equal(falsify.status,0,`C2 source-bound semantic falsification failed: ${falsify.stderr||falsify.stdout}`);
 await mkdir(ARTIFACTS,{recursive:true});await writeFile(path.join(ARTIFACTS,'delivery-provenance-contract.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}

async function prepare(){
 const expected=String(process.env.ICTC_EXPECTED_SHA||'').trim().toLowerCase();assert.match(expected,SHA_RE,'ICTC_EXPECTED_SHA must be exact 40-hex candidate SHA');
 const executionSha=git(['rev-parse','HEAD']).toLowerCase();assert.equal(executionSha,expected,'checkout is not exact candidate HEAD');
 const dirty=git(['status','--porcelain','--untracked-files=no']);assert.equal(dirty,'','tracked working tree must be clean before provenance preparation');
 const treeSha=git(['rev-parse','HEAD^{tree}']).toLowerCase();assert.match(treeSha,SHA_RE);
 const [pkgBytes,lockBytes,sbomBytes]=await Promise.all([readFile(path.join(ROOT,'package.json')),readFile(path.join(ROOT,'package-lock.json')),readFile(path.join(ARTIFACTS,'ictc-sbom.cdx.json'))]);
 const pkg=JSON.parse(pkgBytes),lock=JSON.parse(lockBytes),sbom=JSON.parse(sbomBytes);assert.equal(pkg.name,'ictc');const validation=validateSbomGraph({pkg,lock,sbom});
 await mkdir(ARTIFACTS,{recursive:true});const bundleName=`ictc-candidate-${executionSha}.zip`,bundlePath=path.join(ARTIFACTS,bundleName);
 const archive=spawnSync('git',['-C',ROOT,'archive','--format=zip',`--output=${bundlePath}`,'HEAD'],{encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(archive.status,0,String(archive.stderr||'git archive failed'));
 const [bundle,sbomMeta]=await Promise.all([fileDigest(bundlePath),fileDigest(path.join(ARTIFACTS,'ictc-sbom.cdx.json'))]);
 const provenance={schemaVersion:'1.0.0',control:'C2-DELIVERY-PROVENANCE',owner:'F-06',evidenceClass:'E2',repository:process.env.GITHUB_REPOSITORY||'local',candidate:{sha:executionSha,treeSha,archive:{name:bundleName,...bundle}},inputs:{packageJson:{sha256:sha256(pkgBytes),bytes:pkgBytes.length},packageLock:{sha256:sha256(lockBytes),bytes:lockBytes.length}},sbom:{name:'ictc-sbom.cdx.json',format:'CycloneDX',validation,...sbomMeta},builder:{workflow:process.env.GITHUB_WORKFLOW||null,workflowRef:process.env.GITHUB_WORKFLOW_REF||null,runId:process.env.GITHUB_RUN_ID||null,runAttempt:process.env.GITHUB_RUN_ATTEMPT||null,node:process.version},policy:{signature:'github-oidc-sigstore-keyless-attestation',buildProvenance:'github-slsa-build-provenance',verification:'gh-attestation-verify-repository-bound',postMergeActRequired:true},claimBoundary:'Exact-head repository delivery evidence only. A signed/attested candidate is not a deployment, release approval, independent review, Enterprise Candidate or Enterprise Ready conclusion.'};
 const provenancePath=path.join(ARTIFACTS,'delivery-provenance.json');await writeFile(provenancePath,JSON.stringify(provenance,null,2)+'\n');const prov=await fileDigest(provenancePath);
 const checksums=`${bundle.sha256}  ${bundleName}\n${sbomMeta.sha256}  ictc-sbom.cdx.json\n${prov.sha256}  delivery-provenance.json\n`;await writeFile(path.join(ARTIFACTS,'delivery-checksums.sha256'),checksums);
 await output('bundle_path',bundlePath);await output('bundle_name',bundleName);await output('bundle_sha256',bundle.sha256);await output('sbom_path',path.join(ARTIFACTS,'ictc-sbom.cdx.json'));
 console.log(JSON.stringify({ok:true,mode:'prepare',candidateSha:executionSha,treeSha,bundle,sbom:sbomMeta,provenance:prov}));
}

async function finalize(){
 const expected=String(process.env.ICTC_EXPECTED_SHA||'').trim().toLowerCase();assert.match(expected,SHA_RE);
 const provenancePath=path.join(ARTIFACTS,'delivery-provenance.json'),provenance=JSON.parse(await readFile(provenancePath,'utf8'));assert.equal(provenance.candidate.sha,expected);
 const buildId=String(process.env.ICTC_BUILD_ATTEST_ID||'').trim(),sbomId=String(process.env.ICTC_SBOM_ATTEST_ID||'').trim();assert.ok(buildId&&sbomId,'both GitHub attestation ids are required');assert.equal(process.env.ICTC_GH_VERIFY,'passed','gh attestation verification must pass before finalization');
 const buildSrc=String(process.env.ICTC_BUILD_BUNDLE_PATH||'').trim(),sbomSrc=String(process.env.ICTC_SBOM_BUNDLE_PATH||'').trim();assert.ok(buildSrc&&sbomSrc,'attestation bundle paths required');
 const buildDst=path.join(ARTIFACTS,'ictc-build-provenance.sigstore.jsonl'),sbomDst=path.join(ARTIFACTS,'ictc-sbom-attestation.sigstore.jsonl');await copyFile(buildSrc,buildDst);await copyFile(sbomSrc,sbomDst);
 const [buildBundle,sbomBundle,prov,checksums]=await Promise.all([fileDigest(buildDst),fileDigest(sbomDst),fileDigest(provenancePath),fileDigest(path.join(ARTIFACTS,'delivery-checksums.sha256'))]);
 const receipt={schemaVersion:'1.0.0',control:'C2-DELIVERY-PROVENANCE',owner:'F-06',candidateSha:expected,verification:'gh-attestation-verify-passed',repository:process.env.GITHUB_REPOSITORY||null,attestations:{build:{id:buildId,url:process.env.ICTC_BUILD_ATTEST_URL||null,bundle:buildBundle},sbom:{id:sbomId,url:process.env.ICTC_SBOM_ATTEST_URL||null,bundle:sbomBundle}},provenanceDigest:prov.sha256,checksumsDigest:checksums.sha256,claimBoundary:'Receipt proves the GitHub workflow generated and verified repository-bound attestations for the exact candidate. Merge, release, deployment, independent review and Enterprise Candidate remain separate states.'};
 await writeFile(path.join(ARTIFACTS,'delivery-provenance-receipt.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({ok:true,mode:'finalize',candidateSha:expected,buildAttestationId:buildId,sbomAttestationId:sbomId}));
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.includes('--prepare'))await prepare();else if(process.argv.includes('--finalize'))await finalize();else await staticCheck();
}
