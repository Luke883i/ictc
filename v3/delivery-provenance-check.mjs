import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { appendFile, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
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

async function staticCheck(){
 const [registry,workflow,security,manifest,gates,release]=await Promise.all([
  readJson('audit/remediation-registry.json'),readText('.github/workflows/enterprise-candidate.yml'),readText('.github/workflows/security.yml'),readJson('.github/enterprise-gate-manifest.json'),readText('v3/current-gate-registry.mjs'),readText('docs/RELEASE.md')
 ]);
 const f06=registry.findings.find(x=>x.id==='F-06');
 assert.ok(f06,'F-06 missing');assert.equal(f06.gate,'repository');assert.equal(f06.requiredGrade,'E2');assert.equal(f06.status,'in-remediation');
 assert.match(f06.rootControl,/SBOM\/provenance\/signature pipeline/i);assert.match(f06.repositoryPosture,/provenance\/signature pipeline remains/i);
 const claimBoundary='Repository-bounded E2 delivery evidence only. Candidate attestation/signing does not itself mean merge approval, release, deployment, independent review, Enterprise Candidate or Enterprise Ready. F-06/C2 transition to terminal only after merge plus post-merge ACT.';
 for(const token of [
  "id-token: write","attestations: write","contents: read","ICTC_EXPECTED_SHA: ${{ github.event.pull_request.head.sha || github.sha }}",
  'node v3/delivery-provenance-check.mjs --prepare',BUILD_ATTEST,SBOM_ATTEST,'gh attestation verify',
  'node v3/delivery-provenance-check.mjs --finalize',UPLOAD
 ])assert.ok(workflow.includes(token),`enterprise workflow missing ${token}`);
 assert.ok(workflow.includes('ref: "${{ github.event.pull_request.head.sha || github.sha }}"'),'enterprise checkout must remain exact-head');
 assert.equal(security.includes('Generate CycloneDX SBOM'),false,'security workflow must not retain a second canonical SBOM producer');
 const gate=manifest.localGates.find(x=>x.id==='delivery-provenance');assert.deepEqual(gate,{id:'delivery-provenance',command:'node v3/delivery-provenance-check.mjs',grade:'E2'});assert.equal(manifest.externalBlockers.includes('signed build provenance verification'),false);
 assert.equal(gates.split("'v3/delivery-provenance-check.mjs'").length-1,1,'delivery gate must be mounted once');
 for(const token of ['exact candidate','CycloneDX','GitHub OIDC','Sigstore','gh attestation verify','merge non equivale a release'])assert.ok(release.includes(token),`RELEASE missing ${token}`);
 const report={schemaVersion:'1.0.0',ok:true,control:'C2-DELIVERY-PROVENANCE',mode:'static-contract',owner:'F-06',actionPins:{build:BUILD_ATTEST,sbom:SBOM_ATTEST,upload:UPLOAD},claimBoundary};
 await mkdir(ARTIFACTS,{recursive:true});await writeFile(path.join(ARTIFACTS,'delivery-provenance-contract.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}

async function prepare(){
 const expected=String(process.env.ICTC_EXPECTED_SHA||'').trim().toLowerCase();assert.match(expected,SHA_RE,'ICTC_EXPECTED_SHA must be exact 40-hex candidate SHA');
 const executionSha=git(['rev-parse','HEAD']).toLowerCase();assert.equal(executionSha,expected,'checkout is not exact candidate HEAD');
 const dirty=git(['status','--porcelain','--untracked-files=no']);assert.equal(dirty,'','tracked working tree must be clean before provenance preparation');
 const treeSha=git(['rev-parse','HEAD^{tree}']).toLowerCase();assert.match(treeSha,SHA_RE);
 const [pkgBytes,lockBytes,sbomBytes]=await Promise.all([readFile(path.join(ROOT,'package.json')),readFile(path.join(ROOT,'package-lock.json')),readFile(path.join(ARTIFACTS,'ictc-sbom.cdx.json'))]);
 const pkg=JSON.parse(pkgBytes),sbom=JSON.parse(sbomBytes);assert.equal(pkg.name,'ictc');assert.equal(sbom.bomFormat,'CycloneDX','canonical SBOM must be CycloneDX');
 await mkdir(ARTIFACTS,{recursive:true});const bundleName=`ictc-candidate-${executionSha}.zip`,bundlePath=path.join(ARTIFACTS,bundleName);
 const archive=spawnSync('git',['-C',ROOT,'archive','--format=zip',`--output=${bundlePath}`,'HEAD'],{encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(archive.status,0,String(archive.stderr||'git archive failed'));
 const [bundle,sbomMeta]=await Promise.all([fileDigest(bundlePath),fileDigest(path.join(ARTIFACTS,'ictc-sbom.cdx.json'))]);
 const provenance={schemaVersion:'1.0.0',control:'C2-DELIVERY-PROVENANCE',owner:'F-06',evidenceClass:'E2',repository:process.env.GITHUB_REPOSITORY||'local',candidate:{sha:executionSha,treeSha,archive:{name:bundleName,...bundle}},inputs:{packageJson:{sha256:sha256(pkgBytes),bytes:pkgBytes.length},packageLock:{sha256:sha256(lockBytes),bytes:lockBytes.length}},sbom:{name:'ictc-sbom.cdx.json',format:'CycloneDX',...sbomMeta},builder:{workflow:process.env.GITHUB_WORKFLOW||null,workflowRef:process.env.GITHUB_WORKFLOW_REF||null,runId:process.env.GITHUB_RUN_ID||null,runAttempt:process.env.GITHUB_RUN_ATTEMPT||null,node:process.version},policy:{signature:'github-oidc-sigstore-keyless-attestation',buildProvenance:'github-slsa-build-provenance',verification:'gh-attestation-verify-repository-bound',postMergeActRequired:true},claimBoundary:'Exact-head repository delivery evidence only. A signed/attested candidate is not a deployment, release approval, independent review, Enterprise Candidate or Enterprise Ready conclusion.'};
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

if(process.argv.includes('--prepare'))await prepare();else if(process.argv.includes('--finalize'))await finalize();else await staticCheck();
