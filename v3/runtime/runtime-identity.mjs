const SHA_RE=/^[0-9a-f]{40}$/i;
export function normalizeBuildSha(value){const raw=String(value??'').trim();return SHA_RE.test(raw)?raw.toLowerCase():null;}
export function normalizeDirty(value){const raw=String(value??'').trim().toLowerCase();if(['0','false','clean'].includes(raw))return false;if(['1','true','dirty'].includes(raw))return true;return null;}
export function runtimeIdentityProjection({env=process.env,release={},startedAt=new Date().toISOString(),pid=process.pid,nodeVersion=process.version}={}){
  const explicitSha=normalizeBuildSha(env.ICTC_BUILD_SHA),githubSha=normalizeBuildSha(env.GITHUB_SHA),sha=explicitSha||githubSha,dirty=normalizeDirty(env.ICTC_BUILD_DIRTY);
  const source=explicitSha?'launcher':githubSha?'github-actions':'unavailable';
  return Object.freeze({
    schemaVersion:'1.0.0',
    authority:'runtime-build-identity',
    product:release.product||'ICTC',
    productVersion:release.productVersion||null,
    releaseStage:release.releaseStage||null,
    informationComposition:release.informationComposition||null,
    contracts:release.contracts||null,
    build:Object.freeze({sha,dirty,exact:Boolean(sha)&&dirty===false,source}),
    runtime:Object.freeze({startedAt,pid,nodeVersion}),
    claimBoundary:'Exact=true means this runtime was launched from a known 40-hex checkout identity and the launcher observed no tracked diff. It does not prove artifact provenance, deployment immutability, supply-chain attestation or enterprise-ready status.'
  });
}
