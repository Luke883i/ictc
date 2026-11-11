// Derived assurance matrix validator. No new security/product/release authority.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CONTROL_CONTRACT=Object.freeze([
  ['STD-SLSA-BUILD','E2_HOSTED_PENDING','.github/workflows/enterprise-candidate.yml','tests/verification/delivery-provenance-check.mjs'],
  ['STD-SLSA-SOURCE','E3_HOLD','.github/gov-01f-policy.json','tests/verification/review-authority-closure-check.mjs'],
  ['STD-CYCLONEDX','E2_SCOPED','tests/verification/delivery-provenance-check.mjs','tests/verification/delivery-provenance-semantic-falsification.mjs'],
  ['STD-OWASP-STATIC','E2_SCOPED','src/runtime/http.mjs','tests/verification/http-security-headers-check.mjs'],
  ['STD-OWASP-BROWSER','E2_SCOPED','src/runtime/http.mjs','tests/verification/http-security-headers-check.mjs'],
  ['STD-OWASP-IDENTITY','E2_SCOPED','src/runtime/http.mjs','tests/verification/security-boundary-check.mjs'],
  ['STD-OWASP-API','E2_PARTIAL','src/runtime/api-reliability.mjs','tests/verification/c3-trace-pagination-check.mjs'],
  ['STD-NIS2-DORA','E3_E4_HOLD','audit/remediation-registry.json','tests/verification/security-enterprise-dod-check.mjs']
]);

const contracts=Object.fromEntries(CONTROL_CONTRACT.map(x=>[x[0],x]));
const forbiddenClaims=/\b(?:CERTIFIED|FULLY_COMPLIANT|SLSA_L[1234]_VERIFIED|ASVS_CERTIFIED|ENTERPRISE_READY)\b/;
export async function validateEvidenceMatrix(root){
 const read=p=>readFile(path.join(root,p),'utf8');
 const failures=[],check=(ok,msg)=>{if(!ok)failures.push(msg)};
 const [release,readme,workflow,http,api,sbom,policy,gaps,remediation,identity]=await Promise.all([
  'docs/RELEASE.md','README.md','.github/workflows/enterprise-candidate.yml','src/runtime/http.mjs','src/runtime/api-reliability.mjs','tests/verification/delivery-provenance-check.mjs','.github/gov-01f-policy.json','tests/contracts/gaps.json','audit/remediation-registry.json','src/contracts/release-identity.json'
 ].map(read));
 const entries=release.split(/\r?\n/).filter(x=>/^\| STD-[A-Z0-9-]+ \|/.test(x)).map(line=>line.split('|').slice(1,-1).map(x=>x.trim()));
 check(entries.length===CONTROL_CONTRACT.length,`matrix denominator ${entries.length} != ${CONTROL_CONTRACT.length}`);
 check(new Set(entries.map(x=>x[0])).size===entries.length,'duplicate standards matrix ID');
 for(const row of entries){
  const [id,standard,requirement,owner,test,evidence,limitation]=row;
  const expected=contracts[id];check(Boolean(expected),`unregistered row ${id}`);if(!expected)continue;
  check(row.length===7 && row.every(v=>v.length>10 || v===id),`incomplete matrix relation ${id}`);
  check(owner===`\`${expected[2]}\``,`${id}: wrong implementation owner`);
  check(test===`\`${expected[3]}\``,`${id}: wrong verifier`);
  check(evidence.includes(`\`${expected[1]}\``),`${id}: evidence grade overclaimed or missing`);
  check(/https:\/\//.test(standard),`${id}: unidentifiable standard reference`);
  check(!forbiddenClaims.test(row.join(' ')),`${id}: forbidden certification claim`);
  check(limitation.length>36,`${id}: residual limit not described`);
 }
 for(const [,grade,owner,test] of CONTROL_CONTRACT){
  for(const p of [owner,test])try{await read(p)}catch{check(false,`unresolved owner or oracle: ${p}`)};
  check(['E2_SCOPED','E2_HOSTED_PENDING','E2_PARTIAL','E3_HOLD','E3_E4_HOLD'].includes(grade),`unsupported evidence grade ${grade}`);
 }
 const count=(s,fragment)=>s.split(fragment).length-1;
 check(count(workflow,'--predicate-type https://slsa.dev/provenance/v1')===1,'SLSA build predicate not verified exactly once');
 check(count(workflow,'--predicate-type https://cyclonedx.org/bom')===1,'CycloneDX predicate not verified exactly once');
 check(workflow.includes('--bundle "${{ steps.build_attest.outputs.bundle-path }}"') && workflow.includes('--bundle "${{ steps.sbom_attest.outputs.bundle-path }}"'),'signed predicate bundle binding incomplete');
 check(workflow.includes('ICTC_GH_BUILD_VERIFY: passed')&&workflow.includes('ICTC_GH_SBOM_VERIFY: passed'),'dual gate receipt not enforced');
 check(sbom.includes('validateSbomGraph({pkg,lock,sbom})') && sbom.includes('lockedDigestMatches') && sbom.includes('lockedLicenseMatches'),'CycloneDX lockfile semantic binding removed');
 check(http.includes('realpath(filePath)') && http.includes('realpath(root)') && http.includes('static-symlink-escape'),'OWASP static realpath containment missing');
 check(http.includes('content-security-policy') && http.includes("frame-ancestors 'none'") && http.includes('x-content-type-options'),'OWASP response header hardening missing');
 check(http.includes('assertBrowserWriteBoundary') && http.includes('browser-cross-site-write') && http.includes('requirePermission'),'OWASP browser and RBAC boundary missing');
 check(api.includes('cursor') && api.includes('limit'),'API pagination guard missing');
 const p=JSON.parse(policy),g=JSON.parse(gaps),f=JSON.parse(remediation),i=JSON.parse(identity);
 check(p.serverSidePrevention===false,'GOV-01F must not claim server-side protection');
 check(g.gaps.some(x=>x.id==='GAP-022'&&x.status==='open'),'GAP-022 lacks independent governance blocker');
 check(['F-13','F-15'].every(id=>f.findings.some(x=>x.id===id&&x.status!=='resolved')),'F-13/F-15 incorrectly promoted to terminal');
 check(['GAP-007','GAP-009','GAP-014'].every(id=>g.gaps.some(x=>x.id===id&&x.status==='open')),'E4 deployment blockers erased');
 check(i.releaseStage==='candidate'&&/Matrice comparativa CTO/.test(readme),'CTO entrypoint or candidate boundary missing');
 check(/non autoritativa/i.test(release)&&/non produce decisioni di release/i.test(release),'matrix must not create release authority');
 return {ok:failures.length===0,rows:entries.length,expected:CONTROL_CONTRACT.length,failures,claimBoundary:'E2 source/test mapping and local runtime only; no SLSA level, OWASP certification, NIS2/DORA compliance or E3/E4 promotion.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=path.resolve(process.argv.includes('--root')?process.argv[process.argv.indexOf('--root')+1]:path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'));
 const result=await validateEvidenceMatrix(root);
 if(!process.argv.includes('--no-receipt')&&root===path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..')){await mkdir(path.join(root,'artifacts'),{recursive:true});await writeFile(path.join(root,'artifacts/enterprise-standards-evidence.json'),JSON.stringify(result,null,2)+'\n')}
 console.log(JSON.stringify(result));if(!result.ok)process.exitCode=1;
}
