import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { normalizeBuildSha, normalizeDirty, runtimeIdentityProjection } from './runtime/runtime-identity.mjs';
let seed=0x54a04e11;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
const hex='0123456789abcdef';const randomHex=n=>Array.from({length:n},()=>hex[Math.floor(rnd()*hex.length)]).join('');
const dirtyTokens=['0','1','false','true','clean','dirty','','unknown'];let killed=0,baseline=0,ambientRejected=0;
for(let i=0;i<100000;i++){
  const mode=i%10,valid=mode<7,sha=valid?randomHex(40):(mode===7?randomHex(39):mode===8?randomHex(41):`${randomHex(20)}z${randomHex(19)}`),dirtyToken=dirtyTokens[Math.floor(rnd()*dirtyTokens.length)],explicit=rnd()<0.72;
  const env=explicit?{ICTC_BUILD_SHA:sha,ICTC_BUILD_DIRTY:dirtyToken}:{GITHUB_SHA:sha,ICTC_BUILD_DIRTY:dirtyToken};
  const projection=runtimeIdentityProjection({env,release:{product:'ICTC',productVersion:'1.8.0'},startedAt:'x',pid:1,nodeVersion:'v22'}),normalized=explicit?normalizeBuildSha(sha):null,dirty=normalizeDirty(dirtyToken),expectedExact=Boolean(normalized)&&dirty===false;
  assert.equal(projection.build.sha,normalized);assert.equal(projection.build.dirty,dirty);assert.equal(projection.build.exact,expectedExact);assert.equal(projection.build.source,normalized?'launcher':'unavailable');
  if(!explicit)ambientRejected++;
  if(!normalized||dirty!==false)killed++;else baseline++;
}
const explicitWins=runtimeIdentityProjection({env:{ICTC_BUILD_SHA:'a'.repeat(40),GITHUB_SHA:'b'.repeat(40),ICTC_BUILD_DIRTY:'0'}});assert.equal(explicitWins.build.sha,'a'.repeat(40));assert.equal(explicitWins.build.source,'launcher');
const ambientOnly=runtimeIdentityProjection({env:{GITHUB_SHA:'b'.repeat(40),ICTC_BUILD_DIRTY:'0'}});assert.equal(ambientOnly.build.sha,null);assert.equal(ambientOnly.build.source,'unavailable');assert.equal(ambientOnly.build.exact,false);
assert.equal(killed+baseline,100000);assert.ok(ambientRejected>0);
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});const artifact={ok:true,slice:'S4-A0',campaign:'runtime-build-identity',mutations:100000,killed,baseline,ambientRejected,unclassified:0,seed:'0x54a04e11',dimensions:['sha validity/length/alphabet','launcher authority vs ambient GitHub metadata','dirty token normalization','exactness truth table'],claimBoundary:'Deterministic model mutations over identity normalization/projection only; not browser executions, deployment provenance or supply-chain attestation.'};await writeFile(new URL('../artifacts/s4-a0-observability-saturation.json',import.meta.url),JSON.stringify(artifact,null,2));console.log(JSON.stringify(artifact));
