// Release-readiness E2 observer. NOT a release, product, deployment or governance authority.
// Existing owners: v3/release-identity.json, v3/gaps.json, docs/PRODUCT.md,
// docs/authority-matrix.yaml, .github/enterprise-gate-manifest.json and GitHub live settings.
export const RELEASE_AXES = Object.freeze([
  'filesystem','software','runtime','product','documentation','security','governance','delivery','human','deployment'
]);
export const RELEASE_FAILURES = Object.freeze([
  'missing-owner','stale-source','orphan-reference','write-authority-duplication','identity-bypass',
  'false-claim','unverified-run','cross-layer-drift','missing-signoff','stale-provenance'
]);
export const RELEASE_EVIDENCE = Object.freeze([
  'unsubstantiated','text-claim','self-reported','static-snapshot','unit-test',
  'source-mutant','runtime-readback','exact-head-ci','independent-review','deployment-attestation'
]);
// 10^3 policies are deliberately explored; only the fully scoped canonical fail-closed
// policy can pass all three necessary constraints. This is a bounded model search.
// Selection is a risk-prioritized, bounded trade-off; no unique optimum is presupposed.
// Hard constraints: cover >=8/10 dimensions, evidence >=8/10 and <=1 extra authority.
// Priority order: loss of external-evidence integrity, authority proliferation,
// incomplete coverage, implementation complexity. Candidate coordinates are NOT proof.
export function selectConvergentPolicy(){
  const candidates=[];
  for(let coverage=0;coverage<10;coverage++)for(let ownership=0;ownership<10;ownership++)for(let evidence=0;evidence<10;evidence++){
    const coverageAxes=coverage+1,evidenceAxes=evidence+1;
    const admissible=coverageAxes>=8&&ownership<=1&&evidenceAxes>=8;
    const risk=[10-evidenceAxes,ownership,10-coverageAxes];
    const cost=coverageAxes*2+evidenceAxes*3+ownership*4;
    candidates.push({id:`C${coverage}-${ownership}-${evidence}`,coverage:coverageAxes,ownership,evidence:evidenceAxes,admissible,risk,cost});
  }
  const eligible=candidates.filter(c=>c.admissible);
  const dominates=(a,b)=>a.risk.every((v,i)=>v<=b.risk[i])&&a.cost<=b.cost&&(a.risk.some((v,i)=>v<b.risk[i])||a.cost<b.cost);
  const frontier=eligible.filter(b=>!eligible.some(a=>a!==b&&dominates(a,b)));
  const compare=(a,b)=>a.risk[0]-b.risk[0]||a.risk[1]-b.risk[1]||a.risk[2]-b.risk[2]||a.cost-b.cost||a.id.localeCompare(b.id);
  return {evaluated:candidates.length,admissible:eligible.length,frontier:frontier.length,winner:[...frontier].sort(compare)[0],decision:'external-evidence first; zero new owners; full scope; then cost',boundary:'bounded priority/Pareto analysis, not a universal mathematical optimum'};
}
export const GLOBAL_DOD=Object.freeze([
  ['G1','ontology','Product, release profile and claim boundaries are distinct'],
  ['G2','filesystem','Tracked files and executable owners are resolved'],
  ['G3','software','Seven processes and current runtime/AI/write boundaries are preserved'],
  ['G4','runtime','A real isolated runtime readback can be produced'],
  ['G5','documentation','Canonical docs and derived projections are noncompeting'],
  ['G6','security','Security failures and external efficacy remain distinct'],
  ['G7','review','Reviewable exact-head candidate with evidence and rollback'],
  ['G8','release','External go/no-go cannot be minted by repository CI']
]);
export const INTERMEDIATE_DOD=Object.freeze([
  ['I01','G1','product-scope'],['I02','G1','release-identity'],
  ['I03','G2','filesystem-imports'],['I04','G2','owner-topology'],
  ['I05','G3','process-contracts'],['I06','G3','write-and-identity'],
  ['I07','G4','runtime-health'],['I08','G5','documentation-projections'],
  ['I09','G6','security-and-provenance'],['I10','G7','human-review-handoff'],
  ['I11','G8','external-governance'],['I12','G8','release-authorization']
]);
export const LOCAL_DOD=Object.freeze([
  ['L01','I01','seven-business-procedures'],['L02','I01','ep01-not-business'],
  ['L03','I02','package-version-matches-release'],['L04','I02','candidate-not-ready'],
  ['L05','I03','no-missing-static-imports'],['L06','I03','workflows-present'],
  ['L07','I04','one-ui-composition-root'],['L08','I04','authority-matrix-present'],
  ['L09','I05','all-seven-source-contracts'],['L10','I05','no-automatic-legal-conclusions'],
  ['L11','I06','runtime-server-controls'],['L12','I06','existing-store-ownership'],
  ['L13','I07','loopback-health-200'],['L14','I07','runtime-seven-services-and-integrity'],
  ['L15','I08','single-documentation-router'],['L16','I08','manifest-and-compass-owner'],
  ['L17','I09','current-security-rails'],['L18','I09','no-deployment-assurance-claim'],
  ['L19','I10','pr-owner-and-rollback'],['L20','I10','review-not-self-certified'],
  ['L21','I11','main-protection-evidence-external'],['L22','I11','human-validation-external'],
  ['L23','I12','enterprise-external-rails-open'],['L24','I12','go-no-go-blocks-without-authority']
]);
export function evaluateReleaseFacts(f={}){
  const check=(id,value,detail)=>({id,ok:value===true,detail:detail||null});
  const p=f.product||'', doc=f.docs||'',readme=f.readme||'',startup=f.startup||'',policy=f.policy||'',docsManifest=f.docsManifest||{},release=f.release||{},gaps=f.gaps?.gaps||[],truth=f.truth||{},owners=f.owners||{};
  const gap=id=>gaps.find(x=>x.id===id);
  const codes=['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01'];
  const envBlocked=['GAP-007','GAP-009','GAP-012','GAP-014','GAP-020','GAP-021','GAP-022'];
  // Closure becomes valid only with externally verified provenance. 'open' is not
  // a normative requirement: genuine progress must not become a test regression.
  const verifiedClosure=id=>f.verifiedClosures?.[id]?.verified===true&&f.verifiedClosures[id].source==='external-verifier';
  const gapLegible=id=>{const g=gap(id);return Boolean(g)&&['open','mitigated','closed'].includes(g.status)&&
    (g.status==='open'||(g.status==='closed'&&verifiedClosure(id))||
     (g.status==='mitigated'&&f.verifiedWaivers?.[id]?.verified===true&&f.verifiedWaivers[id].source==='external-verifier'));};
  const cs=[
    check('L01',codes.every(x=>p.includes(x))),
    check('L02',p.includes('EP-01')&&/non (è|costituisce) (un )?ottavo processo/i.test(p)),
    check('L03',f.package?.version===release.productVersion&&/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(release.productVersion||'')),
    check('L04',['candidate','experimental','enterprise-candidate'].includes(release.releaseStage)&&(release.releaseStage==='candidate'?(truth.releaseClaim?.enterpriseCandidate===false&&truth.releaseClaim?.enterpriseReady===false):f.verifiedReleaseTransition===true)),
    check('L05',f.staticImportsMissing===0&&Number.isInteger(f.staticImportsChecked)&&f.staticImportsChecked>0),
    check('L06',f.workflowRefsMissing===0&&f.workflowRefsChecked>0),
    check('L07',owners.constitutionalOwners?.compositionRoot==='v3/public/ui/active-experience.js'&&owners.constitutionalOwners?.finalGlobalResolver===null),
    check('L08',f.hasAuthorityMatrix===true),
    check('L09',codes.every(x=>readme.includes(x))&&owners.constitutionalOwners?.businessProcedureCount===7),
    check('L10',p.includes('applicabilità giuridica')&&p.includes('assurance indipendente')),
    check('L11',startup.includes('assertBootstrapTransport')&&f.server.includes('requirePermission(')&&f.server.includes('roles:ROLES,integrity:store.verifyChain()')&&f.http.includes('assertSafeRuntimeBinding')),
    check('L12',f.hasStore===true&&f.hasSqlite===true&&f.hasEnterprisePostgres===true),
    check('L13',f.runtime?.healthHttp===200),
    check('L14',f.runtime?.integrityOK===true&&f.runtime?.procedureCount===7),
    check('L15',docsManifest.entrypoint==='docs/START_HERE.md'&&doc.includes('entrypoint canonico')),
    check('L16',docsManifest.documents?.some(x=>x.path==='docs/ENGINEERING_COMPASS.md'&&x.lifecycle==='generated')===true),
    check('L17',policy.includes('enterprise-candidate')&&f.hasSecurityWorkflow===true),
    check('L18',p.includes('CI verde != deployment assurance')&&(truth.releaseClaim?.enterpriseReady===false||f.verifiedReleaseTransition===true)),
    check('L19',f.contributing.includes('rollback')&&f.prTemplate.includes('## Affected authority')),
    check('L20',f.contributing.includes('review-enforced')&&f.contributing.includes('review-ready')),
    check('L21',gapLegible('GAP-022')&&truth.externalEvidenceBoundaries?.some(x=>x.id==='E3-GOV-BRANCH-PROTECTION')),
    check('L22',gapLegible('GAP-012')&&truth.externalEvidenceBoundaries?.some(x=>x.id==='E3-HUMAN-VALIDATION')),
    check('L23',envBlocked.every(gapLegible)&&truth.currentInternalBlockers?.some(x=>x.id==='S5-CANDIDATE-SEAL')),
    check('L24',f.evidencePolicy==='fail-closed'&&f.releaseGrantProvided!==true)
  ];
  const passed=cs.filter(x=>x.ok).length,failures=cs.filter(x=>!x.ok).map(x=>x.id);
  const candidates={v1Experimental:'BLOCKED_NO_AUTHORIZED_RELEASE_EVIDENCE',enterpriseCandidate:'BLOCKED_INTERNAL_AND_EXTERNAL_EVIDENCE',enterpriseReady:'NOT_CLAIMED'};
  return {ok:failures.length===0,grade:'E2_REPOSITORY_BOUNDED',passed,total:cs.length,failures,local:cs,global:GLOBAL_DOD.map(([id,name,statement])=>({id,name,statement,local:LOCAL_DOD.filter(x=>INTERMEDIATE_DOD.some(i=>i[1]===id&&i[0]===x[1])).map(x=>x[0])})),intermediate:INTERMEDIATE_DOD.map(([id,parent,name])=>({id,parent,name,local:LOCAL_DOD.filter(x=>x[1]===id).map(x=>x[0])})),releaseVerdicts:candidates,claimBoundary:'E2 observer only. No tagged release, independent human acceptance, protected main or deployment attestation is established.'};
}
