import process from 'node:process';
import {validateDocumentationModel} from './documentation-lattice-lib.mjs';
const TRIALS=Number(process.env.ICTC_DOC_SATURATION_TRIALS||1_000_000),HOLDOUT=Math.min(100_000,Math.max(10_000,Math.floor(TRIALS/10))),SEED=0x1c7cd12;
const BASE={entrypoint:'docs/START_HERE.md',productAuthority:'docs/PRODUCT.md',repositoryAtlas:'docs/REPOSITORY_ATLAS.md',rootRoutesAtlas:true,startRoutesAtlas:true,atlasBoundary:true,atlasGitBoundary:true,atlasAiReadOnly:true,atlasRuntimeSplit:true,atlasDemoSplit:true,atlasExternalBoundary:true,atlasNoLiveSha:true,workflowEvidenceChannels:true,workflowNotParallelAuthority:true,workflowDiagnosticBoundary:true,workflowAggregateBoundary:true,workflowPostMergeBoundary:true,workflowTriggerBoundary:true,workflowHistoricalNameBoundary:true,sameShaAcceptance:true,newCommitReopens:true,mergeShaSeparate:true,prSemanticSlice:true,prCandidateNotMain:true,externalOrchestratorBoundary:true,humanMergeBoundary:true,branchPointerModel:true,shaSnapshotModel:true,branchNotAuthority:true,branchCountNotMetric:true,branchRetentionOptional:true,scratchBranchBoundary:true,topologyCountVolatile:true,serverEnforcementBoundary:true,ciDeploymentBoundary:true,prTemplateSemanticUnit:true,testingTopologyExplained:true,trajectoryStratigraphy:true,coherenceDebtDeclared:true,coherenceFindingCensus:true,coherenceAuthorityBoundary:true,legacyAuthorityDeclassified:true,uiDocSemanticConsistency:true,openapiSemanticConsistency:true,prDiffDeclarationGuard:true,f5ExternalLink:true,f6CodeqlBoundary:true,legacyResidueBoundary:true,freshnessConsistencyBoundary:true,negativeControlBoundary:true,promptLifecycle:'source-input',promptAuthoritative:false,uniqueIds:true,uniquePaths:true,uniqueTopics:true,currentLifecycleSound:true,maxAuthorityDepth:2,brokenLinks:0,productVersion:'1.8.0',uiVersion:'3.2',workspaceChromeVersion:'3.3',uiPresentationVersion:'local-owners',distributedPresentationRegistered:true,retired34Lineage:true,journey:'2.2-sequential-onto-epistemic',constitution:'C0.1',documentationVersion:'1.0',processCount:7,ep01BusinessProcess:false,globalUiRuntime:'annotation-only',capabilityGrammar:'row-list-owner-declared',prTemplate:true,issueConfig:true,securityPolicy:true,supportPolicy:true,governance:true,codeowners:true,bugInvitesVulnerability:false,supportRoutesSecurity:true,prAuthority:true,prBoundary:true,prTests:true,prDocs:true,packageDocsCheck:true,semanticRailIncludesDocs:true,testingCurrent32:true,testingPromotes28:false,developmentCurrent32:true,developmentPromotes28:false,externalSettingsNotSelfCertified:true};
const atlasOps=[
 ['repository-atlas','repository-atlas',s=>s.repositoryAtlas='README.md'],
 ['root-atlas-route','root-atlas-route',s=>s.rootRoutesAtlas=false],
 ['start-atlas-route','start-atlas-route',s=>s.startRoutesAtlas=false],
 ['atlas-boundary','atlas-boundary',s=>s.atlasBoundary=false],
 ['atlas-git-boundary','atlas-git-boundary',s=>s.atlasGitBoundary=false],
 ['atlas-ai-readonly','atlas-ai-readonly',s=>s.atlasAiReadOnly=false],
 ['atlas-runtime-split','atlas-runtime-split',s=>s.atlasRuntimeSplit=false],
 ['atlas-demo-split','atlas-demo-split',s=>s.atlasDemoSplit=false],
 ['atlas-external-boundary','atlas-external-boundary',s=>s.atlasExternalBoundary=false],
 ['atlas-no-live-sha','atlas-no-live-sha',s=>s.atlasNoLiveSha=false]
];
const topologyOps=[
 ['workflow-count-is-authority','workflow-parallel-authority',s=>s.workflowNotParallelAuthority=false],
 ['workflow-name-is-current-release','workflow-release-boundary',s=>s.workflowHistoricalNameBoundary=false],
 ['dedicated-workflow-parallel-pr-authority','workflow-parallel-authority',s=>s.workflowNotParallelAuthority=false],
 ['diagnostic-becomes-gating','workflow-diagnostic-boundary',s=>s.workflowDiagnosticBoundary=false],
 ['post-merge-evidence-equals-premerge','workflow-postmerge-boundary',s=>s.workflowPostMergeBoundary=false],
 ['duplicate-aggregate-status-authority','workflow-aggregate-boundary',s=>s.workflowAggregateBoundary=false],
 ['cross-sha-green-reuse','same-sha-acceptance',s=>s.sameShaAcceptance=false],
 ['leaf-provenance-lost','workflow-aggregate-boundary',s=>s.workflowAggregateBoundary=false],
 ['workflow-count-hardcoded','topology-count-volatile',s=>s.topologyCountVolatile=false],
 ['pr-is-file-batch-not-semantic-slice','pr-semantic-slice',s=>s.prSemanticSlice=false],
 ['previous-head-green-closes-new-head','new-commit-reopens',s=>s.newCommitReopens=false],
 ['agent-acquires-merge-authority','human-merge-boundary',s=>s.humanMergeBoundary=false],
 ['user-agent-acquires-ci-authority','external-orchestrator-boundary',s=>s.externalOrchestratorBoundary=false],
 ['open-draft-pr-becomes-main-truth','pr-candidate-boundary',s=>s.prCandidateNotMain=false],
 ['docs-only-pr-declared-not-semantic','pr-semantic-slice',s=>s.prSemanticSlice=false],
 ['branch-is-current-authority','branch-not-authority',s=>s.branchNotAuthority=false],
 ['branch-count-is-debt-score','branch-count-not-metric',s=>s.branchCountNotMetric=false],
 ['branch-retention-is-required','branch-retention-optional',s=>s.branchRetentionOptional=false],
 ['branch-delete-destroys-canonical-history','sha-snapshot-model',s=>s.shaSnapshotModel=false],
 ['branch-name-implies-current-owner','branch-not-authority',s=>s.branchNotAuthority=false],
 ['scratch-branch-promoted-to-lineage','scratch-branch-boundary',s=>s.scratchBranchBoundary=false],
 ['historical-snapshot-promoted-to-release','workflow-release-boundary',s=>s.workflowHistoricalNameBoundary=false],
 ['t-minus-snapshot-overwrites-owner','sha-snapshot-model',s=>s.shaSnapshotModel=false],
 ['branch-count-hardcoded','topology-count-volatile',s=>s.topologyCountVolatile=false],
 ['same-sha-not-common-across-checks','same-sha-acceptance',s=>s.sameShaAcceptance=false],
 ['write-access-required-for-comprehension','external-orchestrator-boundary',s=>s.externalOrchestratorBoundary=false],
 ['workflow-presence-equals-server-enforcement','server-enforcement-boundary',s=>s.serverEnforcementBoundary=false],
 ['ci-green-equals-deployment-readiness','ci-deployment-boundary',s=>s.ciDeploymentBoundary=false],
 ['retry-claims-same-sha-after-new-commit','new-commit-reopens',s=>s.newCommitReopens=false],
 ['pr-head-and-postmerge-main-sha-collapsed','merge-sha-separate',s=>s.mergeShaSeparate=false],
 ['workflow-leaf-and-aggregate-result-collapsed','workflow-aggregate-boundary',s=>s.workflowAggregateBoundary=false],
 ['branch-pr-commit-history-collapsed','branch-pointer-model',s=>s.branchPointerModel=false],
 ['specialized-regression-rail-equals-current-release','workflow-release-boundary',s=>s.workflowHistoricalNameBoundary=false],
 ['all-workflows-run-on-every-event','workflow-trigger-boundary',s=>s.workflowTriggerBoundary=false],
 ['all-branches-are-meaningful','scratch-branch-boundary',s=>s.scratchBranchBoundary=false],
 ['external-orchestrator-can-bypass-human-merge','human-merge-boundary',s=>s.humanMergeBoundary=false]
];
const coherenceOps=[
 ['debt-missing','coherence-debt',s=>s.coherenceDebtDeclared=false],
 ['finding-census-loss','coherence-finding-census',s=>s.coherenceFindingCensus=false],
 ['second-gap-register','coherence-authority-boundary',s=>s.coherenceAuthorityBoundary=false],
 ['authority-widening','coherence-authority-boundary',s=>s.coherenceAuthorityBoundary=false],
 ['f1-ui-wiring-repromoted','legacy-authority-declassified',s=>s.legacyAuthorityDeclassified=false],
 ['f1-schema-repromoted','legacy-authority-declassified',s=>s.legacyAuthorityDeclassified=false],
 ['f2-home-five','ui-doc-semantic-consistency',s=>s.uiDocSemanticConsistency=false],
 ['f2-process-matrix','ui-doc-semantic-consistency',s=>s.uiDocSemanticConsistency=false],
 ['f3-suite22-canonical','openapi-semantic-consistency',s=>s.openapiSemanticConsistency=false],
 ['f3-route-parity-launder','openapi-semantic-consistency',s=>s.openapiSemanticConsistency=false],
 ['f4-pr-diff-guard-missing','pr-diff-declaration-guard',s=>s.prDiffDeclarationGuard=false],
 ['f4-current-planning-overclaim','pr-diff-declaration-guard',s=>s.prDiffDeclarationGuard=false],
 ['f5-gap022-unlinked','f5-external-link',s=>s.f5ExternalLink=false],
 ['f5-external-internalized','f5-external-link',s=>s.f5ExternalLink=false],
 ['f6-codeql-skipped-as-pass','f6-codeql-boundary',s=>s.f6CodeqlBoundary=false],
 ['f6-codeql-skip-blocks-other-rails','f6-codeql-boundary',s=>s.f6CodeqlBoundary=false],
 ['f7-lineage-promoted-runtime-defect','legacy-residue-boundary',s=>s.legacyResidueBoundary=false],
 ['f7-residue-unclassified','legacy-residue-boundary',s=>s.legacyResidueBoundary=false],
 ['f8-fresh-equals-consistent','freshness-consistency-boundary',s=>s.freshnessConsistencyBoundary=false],
 ['f8-owner-comparison-dropped','freshness-consistency-boundary',s=>s.freshnessConsistencyBoundary=false],
 ['negative-control-universalized','negative-control-boundary',s=>s.negativeControlBoundary=false],
 ['negative-control-dropped','negative-control-boundary',s=>s.negativeControlBoundary=false],
 ['external-rail-laundered','atlas-external-boundary',s=>s.atlasExternalBoundary=false],
 ['known-debt-falsifier-dropped','coherence-finding-census',s=>s.coherenceFindingCensus=false]
];
const ops=[['entrypoint','entrypoint',s=>s.entrypoint='README.md'],['product-authority','product-authority',s=>s.productAuthority='docs/00_PROMPT_CLARIFICATION.md'],['prompt-source-input','prompt-source-input',s=>s.promptLifecycle='current'],['prompt-authority','prompt-source-input',s=>s.promptAuthoritative=true],['unique-ids','unique-ids',s=>s.uniqueIds=false],['unique-paths','unique-paths',s=>s.uniquePaths=false],['unique-topics','unique-authority-topics',s=>s.uniqueTopics=false],['lifecycle','current-lifecycle-sound',s=>s.currentLifecycleSound=false],['depth','authority-depth',s=>s.maxAuthorityDepth=3],['links','broken-links',s=>s.brokenLinks=1],['product-version','product-version',s=>s.productVersion='1.7.0'],['ui-version','ui-version',s=>s.uiVersion='3.1'],['chrome-version','workspace-chrome-version',s=>s.workspaceChromeVersion='3.2'],['presentation-version','ui-presentation-version',s=>s.uiPresentationVersion='3.4'],['presentation-registration','ui-presentation-registration',s=>s.distributedPresentationRegistered=false],['presentation-lineage','ui-34-lineage',s=>s.retired34Lineage=false],['journey','journey-version',s=>s.journey='2.1'],['constitution','constitution-version',s=>s.constitution='C0'],['doc-version','documentation-version',s=>s.documentationVersion='0.9'],['process-count','process-count',s=>s.processCount=8],['ep01','ep01-boundary',s=>s.ep01BusinessProcess=true],['global-runtime','ui-global-runtime',s=>s.globalUiRuntime='exclusive'],['capability','capability-grammar',s=>s.capabilityGrammar='rows'],['pr-template','pr-template',s=>s.prTemplate=false],['issue-config','issue-config',s=>s.issueConfig=false],['security','security-policy',s=>s.securityPolicy=false],['support','support-policy',s=>s.supportPolicy=false],['governance','governance',s=>s.governance=false],['codeowners','codeowners',s=>s.codeowners=false],['bug-security','bug-security-routing',s=>s.bugInvitesVulnerability=true],['support-security','support-security-routing',s=>s.supportRoutesSecurity=false],['pr-authority','pr-contract',s=>s.prAuthority=false],['pr-boundary','pr-contract',s=>s.prBoundary=false],['pr-tests','pr-contract',s=>s.prTests=false],['pr-docs','pr-contract',s=>s.prDocs=false],['docs-check','package-wiring',s=>s.packageDocsCheck=false],['semantic-rail','package-wiring',s=>s.semanticRailIncludesDocs=false],['testing-current','testing-current-rail',s=>s.testingCurrent32=false],['testing-history','testing-current-rail',s=>s.testingPromotes28=true],['development-current','development-current-rail',s=>s.developmentCurrent32=false],['development-history','development-current-rail',s=>s.developmentPromotes28=true],['external-settings','external-acceptance-boundary',s=>s.externalSettingsNotSelfCertified=false],...atlasOps,...topologyOps,...coherenceOps];
const baseline=validateDocumentationModel({...BASE});if(baseline.length)throw new Error(`invalid baseline: ${baseline.join(',')}`);
function xorshift(v){v^=v<<13;v^=v>>>17;v^=v<<5;return v>>>0}let seed=SEED,killed=0,lastNovel=-1,holdoutNovel=0,signature=2166136261;const seen=new Uint8Array(ops.length);
for(let i=0;i<TRIALS;i++){seed=xorshift(seed);const ix=seed%ops.length,[name,expected,mutate]=ops[ix];if(!seen[ix]){seen[ix]=1;lastNovel=i;if(i>=TRIALS-HOLDOUT)holdoutNovel++}const s={...BASE};mutate(s);const errors=validateDocumentationModel(s);if(!errors.includes(expected)){console.error(JSON.stringify({ok:false,i,name,expected,errors},null,2));process.exit(1)}killed++;signature=Math.imul(signature^(ix+1)^seed^(errors.length<<8),16777619)>>>0}
let atlasSeed=0xa71a5001,atlasKilled=0;const atlasPairs=new Set();
for(let i=0;i<1000;i++){
 atlasSeed=xorshift(atlasSeed);const count=1+(atlasSeed%5),chosen=[],s={...BASE};
 while(chosen.length<count){atlasSeed=xorshift(atlasSeed);const ix=atlasSeed%atlasOps.length;if(!chosen.includes(ix))chosen.push(ix);}
 const expected=[];for(const ix of chosen){const [,code,mutate]=atlasOps[ix];mutate(s);expected.push(code);}
 const errors=validateDocumentationModel(s);
 if(!expected.every(code=>errors.includes(code))){console.error(JSON.stringify({ok:false,atlasTrial:i,chosen,expected,errors},null,2));process.exit(1);}
 for(let a=0;a<chosen.length;a++)for(let b=a+1;b<chosen.length;b++)atlasPairs.add([Math.min(chosen[a],chosen[b]),Math.max(chosen[a],chosen[b])].join(':'));
 atlasKilled++;
}
let topologySeed=0xa71a5101,topologyKilled=0;const topologyPairsSeen=new Set(),topologyHits=new Uint32Array(topologyOps.length),allPairs=[];
for(let a=0;a<topologyOps.length;a++)for(let b=a+1;b<topologyOps.length;b++)allPairs.push([a,b]);
for(let i=0;i<1000;i++){
 const chosen=i<allPairs.length?[...allPairs[i]]:(()=>{
   topologySeed=xorshift(topologySeed);const count=3+(topologySeed%4),xs=[];
   while(xs.length<count){topologySeed=xorshift(topologySeed);const ix=topologySeed%topologyOps.length;if(!xs.includes(ix))xs.push(ix);}
   return xs.sort((a,b)=>a-b);
 })();
 const s={...BASE},expected=[];
 for(const ix of chosen){const [,code,mutate]=topologyOps[ix];mutate(s);expected.push(code);topologyHits[ix]++;}
 const errors=validateDocumentationModel(s);
 if(!expected.every(code=>errors.includes(code))){console.error(JSON.stringify({ok:false,topologyTrial:i,chosen,expected,errors},null,2));process.exit(1);}
 for(let a=0;a<chosen.length;a++)for(let b=a+1;b<chosen.length;b++)topologyPairsSeen.add([Math.min(chosen[a],chosen[b]),Math.max(chosen[a],chosen[b])].join(':'));
 topologyKilled++;
}
const topologyMissing=topologyOps.filter((_,i)=>topologyHits[i]===0).map(x=>x[0]),topologyPairsPossible=topologyOps.length*(topologyOps.length-1)/2;
let coherenceSeed=0xa71a5201,coherenceKilled=0;const coherencePairsSeen=new Set(),coherenceHits=new Uint32Array(coherenceOps.length),coherencePairs=[];
for(let a=0;a<coherenceOps.length;a++)for(let b=a+1;b<coherenceOps.length;b++)coherencePairs.push([a,b]);
for(let i=0;i<1000;i++){
 const chosen=i<coherencePairs.length?[...coherencePairs[i]]:(()=>{
   coherenceSeed=xorshift(coherenceSeed);const count=3+(coherenceSeed%4),xs=[];
   while(xs.length<count){coherenceSeed=xorshift(coherenceSeed);const ix=coherenceSeed%coherenceOps.length;if(!xs.includes(ix))xs.push(ix);}
   return xs.sort((a,b)=>a-b);
 })();
 const s={...BASE},expected=[];
 for(const ix of chosen){const [,code,mutate]=coherenceOps[ix];mutate(s);expected.push(code);coherenceHits[ix]++;}
 const errors=validateDocumentationModel(s);
 if(!expected.every(code=>errors.includes(code))){console.error(JSON.stringify({ok:false,coherenceTrial:i,chosen,expected,errors},null,2));process.exit(1);}
 for(let a=0;a<chosen.length;a++)for(let b=a+1;b<chosen.length;b++)coherencePairsSeen.add([Math.min(chosen[a],chosen[b]),Math.max(chosen[a],chosen[b])].join(':'));
 coherenceKilled++;
}
const coherenceMissing=coherenceOps.filter((_,i)=>coherenceHits[i]===0).map(x=>x[0]),coherencePairsPossible=coherenceOps.length*(coherenceOps.length-1)/2;
const missing=ops.filter((_,i)=>!seen[i]).map(x=>x[0]),result={ok:killed===TRIALS&&!missing.length&&holdoutNovel===0&&atlasKilled===1000&&topologyKilled===1000&&!topologyMissing.length&&topologyPairsSeen.size===topologyPairsPossible&&coherenceKilled===1000&&!coherenceMissing.length&&coherencePairsSeen.size===coherencePairsPossible,trials:TRIALS,killed,killRate:killed/TRIALS,normalizedFamilies:ops.length,atlasScenarios:{trials:1000,killed:atlasKilled,survivors:1000-atlasKilled,families:atlasOps.length,pairInteractions:atlasPairs.size,classification:'deterministic multi-family model-level repository-orientation mutations'},topologyScenarios:{trials:1000,killed:topologyKilled,survivors:1000-topologyKilled,families:topologyOps.length,pairInteractions:topologyPairsSeen.size,pairInteractionsPossible:topologyPairsPossible,missingFamilies:topologyMissing,classification:'deterministic multi-family same-SHA/workflow/PR/branch semantic mutations'},coherenceDebtScenarios:{trials:1000,killed:coherenceKilled,survivors:1000-coherenceKilled,families:coherenceOps.length,pairInteractions:coherencePairsSeen.size,pairInteractionsPossible:coherencePairsPossible,missingFamilies:coherenceMissing,classification:'deterministic multi-family D-RSC authority/docs/API/governance/evidence semantic mutations'},seed:`0x${SEED.toString(16)}`,lastNovelAt:lastNovel,noNovelAfter:TRIALS-lastNovel-1,holdout:{size:HOLDOUT,newFamilies:holdoutNovel},missing,signature,limitations:['Model-level falsification of declared documentation/runtime invariants.','Repeated traces over normalized failure families are not independent contributor studies or code mutations.','GitHub server-side settings and deployment controls require external observation.']};console.log(JSON.stringify(result,null,2));if(!result.ok)process.exit(1);
