// Pure eligibility model. It never publishes a release or asserts external truth.
// A real external verifier must validate each claim at the independently owned source.
export const REQUIRED_GAPS=Object.freeze(['GAP-007','GAP-009','GAP-012','GAP-014','GAP-020','GAP-021','GAP-022']);
export const REQUIRED_RECEIPTS=Object.freeze([
  'exact-head-ci','artifact-provenance','independent-review','branch-protection',
  'human-usability','deployment-scanner','deployment-identity',
  'deployment-observability','deployment-smoke','release-authority'
]);
const shaOk=s=>typeof s==='string'&&/^[a-f0-9]{40}$/.test(s);
export function evaluateReleaseEligibility({candidate={},profile='experimental',gaps={},receipts=[],now=Date.now()}={}, {verifyExternal}={}){
  const blockers=[];
  if(!['experimental','enterprise-candidate'].includes(profile))blockers.push('unknown-profile');
  if(!shaOk(candidate.sha)||!shaOk(candidate.tree)||!/^sha256:[a-f0-9]{64}$/.test(candidate.artifactDigest||''))blockers.push('candidate-identity');
  // A caller-provided assertion is NOT independent verification. This interface is
  // intentionally inert in CI, until an authorized external verifier is wired.
  if(typeof verifyExternal!=='function')blockers.push('independent-verifier-unavailable');
  const g=Array.isArray(gaps.gaps)?gaps.gaps:[];
  const verified=[];
  for(const r of Array.isArray(receipts)?receipts:[]){
    if(!r||r.sha!==candidate.sha||r.tree!==candidate.tree||!r.type||
       !r.issuer||!r.actor||!Number.isSafeInteger(r.expiresAt)||r.expiresAt<=now||
       !Number.isSafeInteger(r.issuedAt)||r.issuedAt>now||r.issuedAt>=r.expiresAt)continue;
    try{const v=verifyExternal?.(r,candidate);
      if(v?.valid===true&&v.provenance==='independent-source'&&v.subjectSha===candidate.sha&&v.subjectTree===candidate.tree)verified.push(r);
    }catch{} // Unverifiable source fails closed.
  }
  const byType=t=>verified.find(r=>r.type===t);
  for(const type of REQUIRED_RECEIPTS)if(!byType(type))blockers.push('missing:'+type);
  const author=byType('artifact-provenance')?.actor;
  const reviewer=byType('independent-review')?.actor;
  const approver=byType('release-authority')?.actor;
  if(!author||!reviewer||!approver||author===reviewer||author===approver||reviewer===approver)blockers.push('separation-of-duties');
  for(const id of REQUIRED_GAPS){
    const item=g.find(x=>x.id===id);
    if(!item){blockers.push('missing-gap:'+id);continue;}
    if(item.status==='closed'){
      if(!verified.some(r=>r.type==='gap-closure'&&r.gapId===id))blockers.push('unverified-closure:'+id);
    }else if(item.status==='mitigated'){
      if(!verified.some(r=>r.type==='authorized-exception'&&r.gapId===id))blockers.push('unverified-exception:'+id);
    }else blockers.push('open-gap:'+id);
  }
  if(profile==='enterprise-candidate')for(const type of ['c1-compatibility-closure','c3-capacity-closure','c4-ai-eval-closure','s5-candidate-seal'])if(!byType(type))blockers.push('enterprise:'+type);
  return {eligible:blockers.length===0,verdict:blockers.length===0?'GO_ELIGIBLE_PENDING_HUMAN_EXECUTION':'NO_GO',profile,blockers,verifiedReceiptCount:verified.length,authority:'zero; neither publication nor permission',claimBoundary:'Only a trusted external verifier can support eligibility. A fixture verifier establishes a model property, never an actual release.'};
}
