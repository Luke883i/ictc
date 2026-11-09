export const ALLOWED_LIFECYCLES=new Set(['current','operating','policy','lineage','source-input','roadmap','generated']);
export const ALLOWED_MODES=new Set(['explanation','reference','how-to','policy']);
export function validateDocumentationModel(model){
 const e=[]; const check=(c,m)=>{if(!c)e.push(m)};
 check(model.entrypoint==='docs/START_HERE.md','entrypoint');
 check(model.productAuthority==='docs/PRODUCT.md','product-authority');
 check(model.repositoryAtlas==='docs/REPOSITORY_ATLAS.md','repository-atlas');
 check(model.rootRoutesAtlas,'root-atlas-route'); check(model.startRoutesAtlas,'start-atlas-route');
 check(model.atlasBoundary,'atlas-boundary'); check(model.atlasGitBoundary,'atlas-git-boundary');
 check(model.atlasAiReadOnly,'atlas-ai-readonly'); check(model.atlasRuntimeSplit,'atlas-runtime-split');
 check(model.atlasDemoSplit,'atlas-demo-split'); check(model.atlasExternalBoundary,'atlas-external-boundary');
 check(model.atlasNoLiveSha,'atlas-no-live-sha');
 check(model.workflowEvidenceChannels,'workflow-structure');
 check(model.workflowNotParallelAuthority,'workflow-parallel-authority');
 check(model.workflowDiagnosticBoundary,'workflow-diagnostic-boundary');
 check(model.workflowAggregateBoundary,'workflow-aggregate-boundary');
 check(model.workflowPostMergeBoundary,'workflow-postmerge-boundary');
 check(model.workflowTriggerBoundary,'workflow-trigger-boundary');
 check(model.workflowHistoricalNameBoundary,'workflow-release-boundary');
 check(model.sameShaAcceptance,'same-sha-acceptance');
 check(model.newCommitReopens,'new-commit-reopens');
 check(model.mergeShaSeparate,'merge-sha-separate');
 check(model.prSemanticSlice,'pr-semantic-slice');
 check(model.prCandidateNotMain,'pr-candidate-boundary');
 check(model.externalOrchestratorBoundary,'external-orchestrator-boundary');
 check(model.humanMergeBoundary,'human-merge-boundary');
 check(model.branchPointerModel,'branch-pointer-model');
 check(model.shaSnapshotModel,'sha-snapshot-model');
 check(model.branchNotAuthority,'branch-not-authority');
 check(model.branchCountNotMetric,'branch-count-not-metric');
 check(model.branchRetentionOptional,'branch-retention-optional');
 check(model.scratchBranchBoundary,'scratch-branch-boundary');
 check(model.topologyCountVolatile,'topology-count-volatile');
 check(model.serverEnforcementBoundary,'server-enforcement-boundary');
 check(model.ciDeploymentBoundary,'ci-deployment-boundary');
 check(model.prTemplateSemanticUnit,'pr-template-semantic-unit');
 check(model.testingTopologyExplained,'testing-topology-explained');
 check(model.trajectoryStratigraphy,'trajectory-stratigraphy');
 check(model.coherenceDebtDeclared,'coherence-debt');
 check(model.coherenceFindingCensus,'coherence-finding-census');
 check(model.coherenceAuthorityBoundary,'coherence-authority-boundary');
 check(model.legacyAuthorityDeclassified,'legacy-authority-declassified');
 check(model.uiDocSemanticConsistency,'ui-doc-semantic-consistency');
 check(model.openapiSemanticConsistency,'openapi-semantic-consistency');
 check(model.prDiffDeclarationGuard,'pr-diff-declaration-guard');
 check(model.f5ExternalLink,'f5-external-link');
 check(model.f6CodeqlBoundary,'f6-codeql-boundary');
 check(model.legacyResidueBoundary,'legacy-residue-boundary');
 check(model.freshnessConsistencyBoundary,'freshness-consistency-boundary');
 check(model.negativeControlBoundary,'negative-control-boundary');
 check(model.promptLifecycle==='source-input'&&!model.promptAuthoritative,'prompt-source-input');
 check(model.uniqueIds,'unique-ids'); check(model.uniquePaths,'unique-paths'); check(model.uniqueTopics,'unique-authority-topics');
 check(model.currentLifecycleSound,'current-lifecycle-sound'); check(model.maxAuthorityDepth<=2,'authority-depth'); check(model.brokenLinks===0,'broken-links');
 check(model.productVersion==='1.8.0','product-version');
 check(model.uiVersion==='3.2','ui-version');
 check(model.workspaceChromeVersion==='3.3','workspace-chrome-version');
 check(model.uiPresentationVersion==='local-owners','ui-presentation-version');
 check(model.distributedPresentationRegistered,'ui-presentation-registration');
 check(model.retired34Lineage,'ui-34-lineage');
 check(model.journey==='2.2-sequential-onto-epistemic','journey-version'); check(model.constitution==='C0.1','constitution-version'); check(model.documentationVersion==='1.0','documentation-version');
 check(model.processCount===7,'process-count'); check(!model.ep01BusinessProcess,'ep01-boundary');
 check(model.globalUiRuntime==='annotation-only','ui-global-runtime'); check(model.capabilityGrammar==='row-list-owner-declared','capability-grammar');
 check(model.prTemplate,'pr-template'); check(model.issueConfig,'issue-config'); check(model.securityPolicy,'security-policy'); check(model.supportPolicy,'support-policy'); check(model.governance,'governance'); check(model.codeowners,'codeowners');
 check(!model.bugInvitesVulnerability,'bug-security-routing'); check(model.supportRoutesSecurity,'support-security-routing');
 check(model.prAuthority&&model.prBoundary&&model.prTests&&model.prDocs,'pr-contract');
 check(model.packageDocsCheck&&model.semanticRailIncludesDocs,'package-wiring');
 check(model.testingCurrent32&&!model.testingPromotes28,'testing-current-rail'); check(model.developmentCurrent32&&!model.developmentPromotes28,'development-current-rail');
 check(model.externalSettingsNotSelfCertified,'external-acceptance-boundary');
 return e;
}


/** Checks only the AS-IS reading path, not immutable v3 preimages or historical PR narrative.
 * The docs manifest/authority matrix retain authority; this is a fail-closed oracle. */
export function currentAtlasGuides(atlas){
 const between=(start,end)=>{
  const i=atlas.indexOf(start);if(i<0)return '';
  const j=atlas.indexOf(end,i+start.length);return j<0?'':atlas.slice(i,j);
 };
 return {
  map:between('## Mappa fisica minima e DoD engineer-first (AS-IS)','### Dopo il merge #274'),
  postmerge:between('### Dopo il merge #274','### R3–R5'),
  quick:between('## Percorso di lettura in tre minuti','## Razionalizzazione e archiviazione'),
  layer:atlas.split('\n').find(x=>x.startsWith('| L3 · Executable |'))||'',
  onboarding:atlas.split('\n').find(x=>x.startsWith('2. **Architettura verificabile:**'))||'',
  truth:atlas.split('\n').find(x=>x.startsWith('| release identity |'))||'',
  debt:atlas.split('\n').find(x=>x.includes('Repository Semantic Coherence Debt (D-RSC)'))||'',
  next:between('## Dove andare dopo','## Claim boundary')
 };
}
export function validateCurrentAtlasGuides(g){
 const errors=[];
 const requireText=(area,token)=>{if(!g[area]?.includes(token))errors.push('atlas-current:'+area+':missing:'+token)};
 for(const [area,tokens] of Object.entries({
  map:['src/bootstrap.mjs','src/server.mjs','src/store.mjs','public/ui/','tests/verification/','audit/archive/ictc-agent-bundle/'],
  postmerge:['lineage','G0','G1','G2','G3','G4','HOLD','consumer'],
  quick:['src/bootstrap.mjs','src/server.mjs','src/store.mjs','public/','tests/verification/'],
  layer:['src/server.mjs','src/store.mjs','src/runtime/','public/'],
  onboarding:['src/bootstrap.mjs','src/server.mjs','src/store.mjs','src/runtime/','public/'],
  truth:['src/contracts/release-identity.json'],
  debt:['tests/contracts/semantic-owner-contract.json#repositoryCoherenceDebt'],
  next:['src/server.mjs','src/contracts/release-identity.json']
 }))for(const token of tokens)requireText(area,token);
 if(/candidato sandbox|v3\/ rimane il bootstrap corrente|la sostituzione integrale non e ancora certificata/i.test(g.map))
  errors.push('atlas-current:map:obsolete-candidate-claim');
 for(const area of ['quick','layer','onboarding','truth','debt','next']){
  if(/v3\/(?:bootstrap|server|store|runtime|public|[^\s`|,]*-check)/.test(g[area]||''))
   errors.push('atlas-current:'+area+':retired-executable-path');
 }
 if(/(?:G4\s*(?:=|:)\s*PASS|G4[^.\n]{0,100}closed|legacy[^.\n]{0,40}safe.delete)/i.test(g.postmerge))
  errors.push('atlas-current:postmerge:unsupported-clearance');
 return errors;
}

/** #276: classify the previously unregistered corpus in the EXISTING manifest.
 * No new substantive authority, automatic retirement, or legacy source rewrites. */
export function validatePost275DocCoverage(manifest,trackedMarkdown){
 const errors=[];const rows=manifest.documents||[],byPath=new Map(rows.map(x=>[x.path,x]));
 const seen=new Set();for(const p of trackedMarkdown){if(seen.has(p))errors.push('duplicate-tracked-doc:'+p);seen.add(p);
  if(!byPath.has(p))errors.push('unregistered-tracked-doc:'+p);
 }
 const cohort=rows.filter(x=>x.retentionCohort==='post275-residual');
 if(cohort.length!==151)errors.push('post275-cohort-count');
 const ids=new Set();const paths=new Set();
 const expectedBasis={lineage:'Versioned design',operating:'Operational guidance',roadmap:'Source describes a proposed TO-BE', 'source-input':'Source material'};
 for(const d of cohort){
  if(ids.has(d.id)||!/^post275-\d{3}$/.test(d.id))errors.push('post275-cohort-id:'+d.path);
  if(paths.has(d.path))errors.push('post275-cohort-duplicate:'+d.path);
  ids.add(d.id);paths.add(d.path);
  if(!seen.has(d.path))errors.push('post275-cohort-missing-file:'+d.path);
  if(d.authoritative!==false||d.authorityTopic!==null||d.lifecycle==='current'||d.lifecycle==='policy'||d.lifecycle==='generated')errors.push('post275-cohort-authority-laundering:'+d.path);
  if(!Object.hasOwn(expectedBasis,d.lifecycle)||!String(d.classificationBasis||'').startsWith(expectedBasis[d.lifecycle]))errors.push('post275-cohort-classification:'+d.path);
  if(d.path.startsWith('docs/decisions/')&&d.lifecycle!=='lineage')errors.push('post275-ADR-is-not-lineage:'+d.path);
  if(d.path.startsWith('docs/legacy/')&&d.lifecycle!=='lineage')errors.push('post275-legacy-is-not-lineage:'+d.path);
 }
 return errors;
}
