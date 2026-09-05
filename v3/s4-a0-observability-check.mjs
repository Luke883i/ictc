import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { runtimeIdentityProjection, normalizeBuildSha, normalizeDirty } from './runtime/runtime-identity.mjs';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [identitySource,admin,launcher,browser,workflow]=await Promise.all([
  read('./runtime/runtime-identity.mjs'),
  read('./runtime/admin.mjs'),
  read('../ictc.sh'),
  read('./browser-s4-a0-observability.py'),
  read('../.github/workflows/s4-a0-observability.yml')
]);
assert.equal(normalizeBuildSha('A'.repeat(40)),'a'.repeat(40));
assert.equal(normalizeBuildSha('abc'),null);
assert.equal(normalizeDirty('clean'),false);assert.equal(normalizeDirty('dirty'),true);assert.equal(normalizeDirty(''),null);
const release={product:'ICTC',productVersion:'1.8.0',releaseStage:'candidate',informationComposition:'3.2-native-semantic-lattice',contracts:{semantic:'1.2'}};
const exact=runtimeIdentityProjection({env:{ICTC_BUILD_SHA:'F'.repeat(40),ICTC_BUILD_DIRTY:'0'},release,startedAt:'2026-09-05T00:00:00.000Z',pid:7,nodeVersion:'v22.0.0'});
assert.equal(exact.build.sha,'f'.repeat(40));assert.equal(exact.build.dirty,false);assert.equal(exact.build.exact,true);assert.equal(exact.build.source,'launcher');
const dirty=runtimeIdentityProjection({env:{ICTC_BUILD_SHA:'1'.repeat(40),ICTC_BUILD_DIRTY:'1'},release});assert.equal(dirty.build.exact,false);
const ambient=runtimeIdentityProjection({env:{GITHUB_SHA:'2'.repeat(40),ICTC_BUILD_DIRTY:'0'},release});assert.equal(ambient.build.sha,null);assert.equal(ambient.build.source,'unavailable');assert.equal(ambient.build.exact,false);
const unknown=runtimeIdentityProjection({env:{},release});assert.equal(unknown.build.sha,null);assert.equal(unknown.build.exact,false);
assert.ok(identitySource.includes("authority:'runtime-build-identity'"),'runtime identity authority missing');
assert.ok(identitySource.includes('currentRuntimeIdentity()'),'process-stable identity projection missing');
assert.ok(admin.includes("pathname==='/api/admin/identity'"),'existing Admin identity route missing');
assert.ok(admin.includes('buildIdentity:currentRuntimeIdentity()'),'Admin identity must expose build identity without adding a parallel route');
for(const token of ['git -C "$ROOT" rev-parse HEAD','git -C "$ROOT" diff --quiet HEAD --','ICTC_BUILD_SHA="$build_sha"','ICTC_BUILD_DIRTY="$build_dirty"'])assert.ok(launcher.includes(token),`launcher identity wiring missing ${token}`);
assert.ok(!launcher.includes('${GITHUB_SHA:-}'),'launcher must not treat ambient GitHub metadata as checkout authority');
for(const endpoint of ['/api/admin/readiness','/api/admin/usage','/api/admin/users','/api/admin/identity'])assert.ok(browser.includes(endpoint),`browser probe missing ${endpoint}`);
assert.ok(!browser.includes("api_get(request,'/api/runtime/identity')"),'A0 must not mint an extra runtime identity route');
for(const token of ['s4-a0-home.png','s4-a0-processes.png','s4-a0-proof.png','s4-a0-epistemic.png','s4-a0-admin.png','requestfailed','pageerror','buildIdentity'])assert.ok(browser.includes(token),`browser baseline evidence missing ${token}`);
assert.ok(workflow.includes('python -u v3/browser-s4-a0-observability.py'));assert.ok(workflow.includes("FAILED_BROWSER_SCRIPT='v3/browser-s4-a0-observability.py'"));assert.ok(workflow.includes('artifacts/s4-a0-*'));
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
const artifact={ok:true,slice:'S4-A0',contract:'launcher-bound runtime identity / final-view baseline / Admin 4-endpoint probe / browser failure provenance',buildIdentity:{validSha:true,dirtyAware:true,exactOnlyWhenClean:true,ambientCiRejected:true,existingAdminContract:true},browserEvidence:{surfaces:['home','processes','proof','epistemic','admin'],adminEndpoints:4,structuredNetwork:true,screenshots:true},claimBoundary:'Source/model contract evidence only. Actual server/browser execution is produced by the dedicated S4-A0 workflow; no claim of human usability, deployment provenance or enterprise-ready status.'};
await writeFile(new URL('../artifacts/s4-a0-observability-contract.json',import.meta.url),JSON.stringify(artifact,null,2));
console.log(JSON.stringify(artifact));
