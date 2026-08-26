export const ALLOWED_LIFECYCLES=new Set(['current','operating','policy','lineage','source-input','roadmap','generated']);
export const ALLOWED_MODES=new Set(['explanation','reference','how-to','policy']);
export function validateDocumentationModel(model){
 const e=[]; const check=(c,m)=>{if(!c)e.push(m)};
 check(model.entrypoint==='docs/START_HERE.md','entrypoint');
 check(model.productAuthority==='docs/PRODUCT.md','product-authority');
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
 check(model.globalUiRuntime==='annotation-only','ui-global-runtime'); check(model.capabilityGrammar==='matrix','capability-grammar');
 check(model.prTemplate,'pr-template'); check(model.issueConfig,'issue-config'); check(model.securityPolicy,'security-policy'); check(model.supportPolicy,'support-policy'); check(model.governance,'governance'); check(model.codeowners,'codeowners');
 check(!model.bugInvitesVulnerability,'bug-security-routing'); check(model.supportRoutesSecurity,'support-security-routing');
 check(model.prAuthority&&model.prBoundary&&model.prTests&&model.prDocs,'pr-contract');
 check(model.packageDocsCheck&&model.semanticRailIncludesDocs,'package-wiring');
 check(model.testingCurrent32&&!model.testingPromotes28,'testing-current-rail'); check(model.developmentCurrent32&&!model.developmentPromotes28,'development-current-rail');
 check(model.externalSettingsNotSelfCertified,'external-acceptance-boundary');
 return e;
}
