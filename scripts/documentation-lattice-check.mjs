import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {ALLOWED_LIFECYCLES,ALLOWED_MODES,validateDocumentationModel} from './documentation-lattice-lib.mjs';
const root=path.resolve(process.argv[2]||process.cwd());
const read=async p=>readFile(path.join(root,p),'utf8');
const exists=async p=>{try{await stat(path.join(root,p));return true}catch{return false}};
const manifest=JSON.parse(await read('docs/documentation-manifest.json'));
const docs=manifest.documents||[];const failures=[];const check=(c,m)=>{if(!c)failures.push(m)};
check(manifest.schemaVersion==='1.2.0','manifest schemaVersion');
check(new Set(docs.map(d=>d.id)).size===docs.length,'duplicate document id');
check(new Set(docs.map(d=>d.path)).size===docs.length,'duplicate document path');
const authoritative=docs.filter(d=>d.authoritative),topics=authoritative.map(d=>d.authorityTopic).filter(Boolean);
check(new Set(topics).size===topics.length,'duplicate authority topic');
for(const d of docs){check(ALLOWED_LIFECYCLES.has(d.lifecycle),`invalid lifecycle ${d.path}`);check(ALLOWED_MODES.has(d.mode),`invalid mode ${d.path}`);check(await exists(d.path),`missing manifest path ${d.path}`);if(['lineage','source-input','roadmap','generated'].includes(d.lifecycle))check(!d.authoritative,`non-current lifecycle is authoritative ${d.path}`)}
for(const p of Object.values(manifest.communitySurfaces||{}))check(await exists(p),`missing community surface ${p}`);
for(const [name,axis] of Object.entries(manifest.versionAxes||{})){const owners=axis.owners||[axis.owner].filter(Boolean);check(owners.length>0,`missing version-axis owner ${name}`);for(const p of owners)check(await exists(p),`missing version-axis owner ${p}`)}
const [start,readme,atlas,authority,bug,pr,support,testing,development,trajectory,documentationAuthorityGate,productText,designDoc,fineTuningDoc]=await Promise.all([read('docs/START_HERE.md'),read('README.md'),read('docs/REPOSITORY_ATLAS.md'),read('docs/authority-matrix.yaml'),read('.github/ISSUE_TEMPLATE/bug.yml'),read('.github/PULL_REQUEST_TEMPLATE.md'),read('SUPPORT.md'),read('docs/TESTING.md'),read('docs/DEVELOPMENT.md'),read('docs/PROJECT_TRAJECTORY.md'),read('v3/documentation-authority-check.mjs'),read('docs/PRODUCT.md'),read('docs/21_DESIGN_SYSTEM.md'),read('docs/UI_FINE_TUNING_3_4_DOD.md')]);
const pkg=JSON.parse(await read('package.json'));
const [semanticOwnerText,openapi,uiuxContractText,gateRegistry,repositoryContract,runtimeModel,serverText,securityText,gapsText]=await Promise.all([read('v3/semantic-owner-contract.json'),read('docs/openapi.yaml'),read('v3/uiux-converge-0-contract.json'),read('v3/current-gate-registry.mjs'),read('scripts/repository-contract.mjs'),read('v3/runtime/model.mjs'),read('v3/server.mjs'),read('SECURITY.md'),read('v3/gaps.json')]);
const semanticOwner=JSON.parse(semanticOwnerText),debt=semanticOwner.repositoryCoherenceDebt||{},debtFindings=Array.isArray(debt.findings)?debt.findings:[],debtById=Object.fromEntries(debtFindings.map(item=>[item.id,item])),uiuxContract=JSON.parse(uiuxContractText),gaps=JSON.parse(gapsText);
const linkTargets=new Map();
function localTargets(rel,text){const out=[];for(const m of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)){const href=m[1].trim();if(!href||/^(https?:|mailto:|#)/.test(href))continue;out.push(path.normalize(path.join(path.dirname(rel),href.split('#')[0])))}return out}
for(const d of docs.filter(d=>d.path.endsWith('.md'))){const text=await read(d.path),targets=localTargets(d.path,text);linkTargets.set(d.path,targets);for(const t of targets)check(await exists(t),`broken local link ${d.path} -> ${t}`)}
async function depthFromStart(target){if(target==='docs/START_HERE.md')return 0;let frontier=['docs/START_HERE.md'];const seen=new Set(frontier);for(let depth=1;depth<=2;depth++){const next=[];for(const src of frontier){for(const t of linkTargets.get(src)||[]){if(t===target)return depth;if(!seen.has(t)&&linkTargets.has(t)){seen.add(t);next.push(t)}}}frontier=next}return Infinity}
let maxAuthorityDepth=0;for(const d of authoritative){const depth=await depthFromStart(d.path);if(depth!==Infinity)maxAuthorityDepth=Math.max(maxAuthorityDepth,depth);check(depth<=2,`authority not reachable <=2 links: ${d.path}`)}
const product=docs.find(d=>d.authorityTopic==='product_intent'),repositoryAtlas=docs.find(d=>d.authorityTopic==='repository_self_description'),prompt=docs.find(d=>d.path==='docs/00_PROMPT_CLARIFICATION.md'),retired34=docs.find(d=>d.path==='docs/UI_FINE_TUNING_3_4_DOD.md');
const distributedPresentationRegistered=/ui_presentation:\s*[\s\S]*?classification: canonical-distributed-presentation[\s\S]*?final_resolver: none/.test(authority)&&docs.some(d=>d.authorityTopic==='ui_process_evidence_presentation'&&d.path==='docs/SEMANTIC_WORKSPACE_CLOSURE_3_2_1_DOD.md'&&d.authoritative);
const retired34Lineage=retired34?.lifecycle==='lineage'&&retired34.authoritative===false&&fineTuningDoc.includes('**Retired.**');
const model={entrypoint:manifest.entrypoint,productAuthority:product?.path,repositoryAtlas:repositoryAtlas?.path,
rootRoutesAtlas:/docs\/REPOSITORY_ATLAS\.md/.test(readme),
startRoutesAtlas:/REPOSITORY_ATLAS\.md/.test(start),
atlasBoundary:/possiede soltanto[\s\S]*forma del repository e del protocollo di lettura/i.test(atlas),
atlasGitBoundary:/live Git facts[\s\S]*Git\/GitHub/i.test(atlas),
atlasAiReadOnly:/GitHub connector in sola lettura/i.test(atlas)&&/Write access[\s\S]*non sono necessari/i.test(atlas),
atlasRuntimeSplit:/standard runtime e enterprise substrate sono distinti/i.test(atlas)&&/RuntimeStore\/SQLite/.test(atlas)&&/PostgreSQL/.test(atlas),
atlasDemoSplit:/Public DEMO non è deployment standard/i.test(atlas),
atlasExternalBoundary:/E3\/E4[\s\S]*evidenze esterne/i.test(atlas),
atlasNoLiveSha:!/[a-f0-9]{40}/i.test(atlas),
workflowEvidenceChannels:/canali eseguibili di evidenza/i.test(atlas)&&/non servizi applicativi e non authority equivalenti/i.test(atlas),
workflowNotParallelAuthority:/molti workflow non significano molte autorità di merge/i.test(atlas),
workflowDiagnosticBoundary:/diagnostic \/[\s\S]*non entrano nel verdetto required/i.test(atlas)&&/diagnostic \/[\s\S]*non gating/i.test(testing),
workflowAggregateBoundary:/ictc\/actions-census[\s\S]*singolo aggregate status authority/i.test(atlas)&&/ictc\/actions-census[\s\S]*singolo aggregate acceptance status/i.test(testing),
workflowPostMergeBoundary:/post-merge evidence[\s\S]*nuovo SHA/i.test(atlas)&&/post-merge[\s\S]*merge SHA separatamente/i.test(testing),
workflowTriggerBoundary:/Non tutti girano a ogni evento/i.test(atlas)&&/non tutti i workflow hanno gli stessi trigger/i.test(testing),
workflowHistoricalNameBoundary:/nome può essere storico[\s\S]*non riattiva una vecchia release/i.test(atlas)&&/nome storico[\s\S]*non promuove una vecchia release/i.test(testing),
sameShaAcceptance:/stesso SHA/i.test(atlas)&&/exact HEAD SHA/i.test(testing),
newCommitReopens:/nuovo commit crea un nuovo SHA e riapre l'accettazione/i.test(atlas)&&/verde precedente resta solo genealogia/i.test(development),
mergeShaSeparate:/merge commit[\s\S]*un altro SHA/i.test(atlas)&&/merge SHA separatamente/i.test(testing),
prSemanticSlice:/unità di esecuzione semantica bounded/i.test(atlas)&&/una responsabilità falsificabile/i.test(development),
prCandidateNotMain:/candidate state/i.test(development)&&/main riceve Mn/i.test(atlas),
externalOrchestratorBoundary:/utente-agente orchestra esternamente/i.test(atlas)&&/orchestratore non diventa test authority né merge authority/i.test(development),
humanMergeBoundary:/merge umano\/autorizzato/i.test(atlas)&&/merge authority/i.test(development),
branchPointerModel:/puntatore nominato e mutabile/i.test(atlas)&&/branch è un puntatore mutabile/i.test(trajectory),
shaSnapshotModel:/fotografia immutabile è lo SHA/i.test(atlas)&&/fotografia precisa è però lo SHA/i.test(trajectory),
branchNotAuthority:/non sono automaticamente lavoro attivo, current authority o debito/i.test(atlas)&&/non significa che quella slice sia ancora attiva o autorevole/i.test(trajectory),
branchCountNotMetric:/numero di branch[\s\S]*non un KPI/i.test(atlas)&&/numero di branch non misura debito/i.test(trajectory),
branchRetentionOptional:/retention del branch è opzionale/i.test(atlas)&&/eliminato senza cancellare commit\/PR history/i.test(development),
scratchBranchBoundary:/scratch[\s\S]*tmp[\s\S]*noop[\s\S]*non devono ricevere significato semantico/i.test(atlas)&&/scratch\/tmp\/noop/i.test(trajectory),
topologyCountVolatile:/conteggio dei file workflow è una fotografia volatile/i.test(atlas)&&/numero di branch[\s\S]*fotografia volatile/i.test(atlas),
serverEnforcementBoundary:/GOV-01F[\s\S]*non crea branch protection server-side/i.test(atlas)&&/non branch protection/i.test(testing),
ciDeploymentBoundary:/CI verde non auto-certifica il mondo esterno/i.test(atlas)&&/deployment assurance/i.test(atlas),
prTemplateSemanticUnit:/unità di esecuzione semantica/i.test(pr)&&/nuovo commit crea un nuovo SHA/i.test(pr),
testingTopologyExplained:/^## Topologia GitHub Actions e verdetto same-SHA/m.test(testing),
trajectoryStratigraphy:/^## Stratigrafia Git/m.test(trajectory),
coherenceDebtDeclared:debt.id==='D-RSC'&&debt.classification==='repository-semantic-coherence-debt'&&debt.status==='open',
coherenceFindingCensus:JSON.stringify(debtFindings.map(item=>item.id))===JSON.stringify(['F1','F2','F3','F4','F5','F6','F7','F8']),
coherenceAuthorityBoundary:debt.createsNewAuthority===false&&/not a second gap register/i.test(debt.claimBoundary||'')&&/debt_projection:\s*v3\/semantic-owner-contract\.json#repositoryCoherenceDebt/.test(authority),
legacyAuthorityDeclassified:debtById.F1?.status==='resolved-in-candidate'&&/ui_wiring:\s*[\s\S]*?classification: legacy-lineage-debt[\s\S]*?current_replacement: ui_composition_root/.test(authority)&&/schemas:\s*[\s\S]*?classification: legacy-lineage-debt[\s\S]*?current_replacement: api\+runtime_handlers/.test(authority),
uiDocSemanticConsistency:debtById.F2?.status==='resolved-in-candidate'&&/3 priorità/.test(readme)&&/one-row-per-procedure \/ row-list/.test(readme)&&/one-row-per-procedure \/ row-list/.test(start)&&!/3 → 2 → 1/.test(readme)&&!/3 → 2 → 1/.test(start)&&uiuxContract.surfaceProgram?.find(item=>item.id==='home')?.density==='decision-strip-plus-up-to-3-priority-rows'&&uiuxContract.surfaceProgram?.find(item=>item.id==='processes')?.density==='one-row-per-procedure',
openapiSemanticConsistency:debtById.F3?.status==='resolved-in-candidate'&&/Suite 3\.0 canonica/.test(openapi)&&!/Suite 2\.2 canonica/.test(openapi)&&gateRegistry.includes('DEMO_SUITE_GATES')&&gateRegistry.includes('DEPRECATED_DEMO_SUITE_GATES'),
prDiffDeclarationGuard:debtById.F4?.status==='mitigated-open'&&/file dichiarati sono realmente presenti nel diff/.test(pr)&&/diff reale deve contenerli/.test(development),
f5ExternalLink:debtById.F5?.status==='blocked-external'&&debtById.F5?.linkedGap==='GAP-022'&&debtById.F5?.owner==='E3-GOV'&&gaps.gaps?.some(item=>item.id==='GAP-022'&&item.targetSlice==='E3-GOV'),
f6CodeqlBoundary:debtById.F6?.status==='evidence-bounded'&&debtById.F6?.blocking===false&&/CodeQL remains supplemental and conditional/i.test(securityText)&&/not executed/i.test(securityText),
legacyResidueBoundary:debtById.F7?.status==='open'&&repositoryContract.includes("'app/index.html'")&&runtimeModel.includes('experience:{services:2')&&serverText.includes('projected.experience.services=7')&&/not evidence of current runtime output/i.test(debtById.F7?.limitation||''),
freshnessConsistencyBoundary:debtById.F8?.status==='in-remediation'&&debt.coherenceRule?.freshnessIsNecessaryNotSufficient===true&&debt.coherenceRule?.semanticConsistencyRequiresExecutableOwnerComparison===true&&/^## Freshness vs coerenza semantica/m.test(testing)&&/fresh[\s\S]*necessario, non sufficiente/i.test(atlas),
negativeControlBoundary:Array.isArray(debt.negativeControls)&&debt.negativeControls.length>=8&&debt.negativeControls.every(item=>item.evidenceClass==='bounded-observation'&&item.universalAbsenceProof===false)&&/bounded observations/i.test(atlas),
promptLifecycle:prompt?.lifecycle,promptAuthoritative:prompt?.authoritative===true,uniqueIds:new Set(docs.map(d=>d.id)).size===docs.length,uniquePaths:new Set(docs.map(d=>d.path)).size===docs.length,uniqueTopics:new Set(topics).size===topics.length,currentLifecycleSound:docs.filter(d=>['lineage','source-input','roadmap','generated'].includes(d.lifecycle)).every(d=>!d.authoritative),maxAuthorityDepth,brokenLinks:failures.filter(x=>x.startsWith('broken local link')).length,productVersion:manifest.versionAxes?.product?.value,uiVersion:manifest.versionAxes?.uiComposition?.value,workspaceChromeVersion:manifest.versionAxes?.workspaceChrome?.value,uiPresentationVersion:manifest.versionAxes?.uiPresentation?.value,distributedPresentationRegistered,retired34Lineage,journey:manifest.versionAxes?.journey?.value,constitution:manifest.versionAxes?.constitution?.value,documentationVersion:manifest.versionAxes?.documentation?.value,processCount:(productText.match(/\| (RN|EC|AO|MC|AP|RC|AR)-01 \|/g)||[]).length,ep01BusinessProcess:!/EP-01[^\n]*non [èe] un ottavo processo/i.test(productText),globalUiRuntime:authority.includes('global semantic annotation runtime may classify metadata but may not rewrite business copy')?'annotation-only':'other',capabilityGrammar:authority.includes('Processi catalogue and comparable repeated business records use row/list grammar by their current owner')?'row-list-owner-declared':'other',prTemplate:await exists('.github/PULL_REQUEST_TEMPLATE.md'),issueConfig:await exists('.github/ISSUE_TEMPLATE/config.yml'),securityPolicy:await exists('SECURITY.md'),supportPolicy:await exists('SUPPORT.md'),governance:await exists('GOVERNANCE.md'),codeowners:await exists('.github/CODEOWNERS'),bugInvitesVulnerability:/Security or authorization/.test(bug),supportRoutesSecurity:support.includes('SECURITY.md'),prAuthority:pr.includes('## Affected authority'),prBoundary:pr.includes('## Claim boundary'),prTests:pr.includes('## Tests and falsification'),prDocs:pr.includes('## Documentation'),packageDocsCheck:Boolean(pkg.scripts?.['docs:check']),semanticRailIncludesDocs:pkg.scripts?.['test:current:semantic']==='node v3/current-semantic-3-2.mjs'&&documentationAuthorityGate.includes('scripts/documentation-lattice-check.mjs'),testingCurrent32:/Native Semantic Lattice 3\.2/.test(testing),testingPromotes28:/^## Closure 2\.8/m.test(testing),developmentCurrent32:/3\.2/.test(development),developmentPromotes28:/Per closure 2\.8/.test(development),externalSettingsNotSelfCertified:Array.isArray(manifest.externalAcceptance)&&manifest.externalAcceptance.length>=2};
for(const m of validateDocumentationModel(model))failures.push(`model:${m}`);
check(/product_intent:\s*\n\s*authority: docs\/PRODUCT\.md/.test(authority),'authority matrix product_intent drift');
check(/documentation_registry:\s*\n\s*authority: docs\/documentation-manifest\.json/.test(authority),'authority matrix documentation registry missing');
check(/repository_self_description:\s*\n\s*authority: docs\/REPOSITORY_ATLAS\.md/.test(authority),'authority matrix repository self-description missing');
check(/debt_projection:\s*v3\/semantic-owner-contract\.json#repositoryCoherenceDebt/.test(authority),'repository coherence debt projection missing');
check(authority.includes('current presentation is distributed across declared canonical owners'),'distributed presentation rule missing');
check(authority.includes('workspace-finetuning-3-4.css is retired lineage'),'3.4 retirement rule missing');
check(designDoc.includes('Candidate')&&designDoc.includes('assente'),'design system must describe Candidate as absent');
check(designDoc.includes('Non esiste più un final cascade resolver globale'),'design system must describe presentation retirement');
check(start.includes('uiPresentation = local-owners'),'START_HERE must route current presentation authority');
check(readme.includes('docs/START_HERE.md'),'README front door missing docs/START_HERE.md');
check(readme.includes('docs/REPOSITORY_ATLAS.md'),'README front door missing Repository Atlas');
check(start.includes('REPOSITORY_ATLAS.md'),'START_HERE missing Repository Atlas route');
if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1)}
console.log(JSON.stringify({ok:true,documents:docs.length,authorityTopics:topics.length,maxAuthorityDepth,versionAxes:manifest.versionAxes,distributedPresentationRegistered,retired34Lineage,externalAcceptance:manifest.externalAcceptance},null,2));
