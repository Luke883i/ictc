import { readFileSync } from 'node:fs';
const SHA_RE=/^[0-9a-f]{40}$/i;
const release=JSON.parse(readFileSync(new URL('../release-identity.json',import.meta.url),'utf8'));
const processStartedAt=new Date().toISOString();
export function normalizeBuildSha(value){const raw=String(value??'').trim();return SHA_RE.test(raw)?raw.toLowerCase():null;}
export function normalizeDirty(value){const raw=String(value??'').trim().toLowerCase();if(['0','false','clean'].includes(raw))return false;if(['1','true','dirty'].includes(raw))return true;return null;}
export function runtimeIdentityProjection({env=process.env,release:releaseInput={},startedAt=new Date().toISOString(),pid=process.pid,nodeVersion=process.version}={}){
  const sha=normalizeBuildSha(env.ICTC_BUILD_SHA),dirty=normalizeDirty(env.ICTC_BUILD_DIRTY);
  const source=sha?'launcher':'unavailable';
  return Object.freeze({
    schemaVersion:'1.1.0',
    authority:'runtime-build-identity',
    product:releaseInput.product||'ICTC',
    productVersion:releaseInput.productVersion||null,
    releaseStage:releaseInput.releaseStage||null,
    informationComposition:releaseInput.informationComposition||null,
    contracts:releaseInput.contracts||null,
    build:Object.freeze({sha,dirty,exact:Boolean(sha)&&dirty===false,source}),
    runtime:Object.freeze({startedAt,pid,nodeVersion}),
    claimBoundary:'Exact=true means the launcher bound this runtime to a known 40-hex checkout identity and observed no tracked diff at launch. Ambient CI metadata is not accepted as build authority. This does not prove artifact provenance, deployment immutability, supply-chain attestation or enterprise-ready status.'
  });
}
export function currentRuntimeIdentity(){return runtimeIdentityProjection({release,startedAt:processStartedAt});}
