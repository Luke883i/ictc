import {checkReadiness} from './review-readiness-check.mjs';
import {readFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {spawnSync} from 'node:child_process';
import {ALLOWED_LIFECYCLES,ALLOWED_MODES,validateDocumentationModel,validatePost275DocCoverage,currentAtlasGuides,validateCurrentAtlasGuides} from './documentation-lattice-lib.mjs';
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
// Archive location is not an operating reference: preserve its bytes, declassify its lifecycle.
for(const d of docs.filter(d=>d.path.startsWith('docs/legacy/')))
 check(d.lifecycle==='lineage'&&d.authoritative===false,'docs/legacy must remain non-authoritative lineage: '+d.path);
for(const p of Object.values(manifest.communitySurfaces||{}))check(await exists(p),`missing community surface ${p}`);
for(const [name,axis] of Object.entries(manifest.versionAxes||{})){const owners=axis.owners||[axis.owner].filter(Boolean);check(owners.length>0,`missing version-axis owner ${name}`);for(const p of owners)check(await exists(p),`missing version-axis owner ${p}`)}
const [start,readme,atlas,authority,bug,pr,support,testing,development,trajectory,documentationAuthorityGate,productText,designDoc,fineTuningDoc]=await Promise.all([read('docs/START_HERE.md'),read('README.md'),read('docs/REPOSITORY_ATLAS.md'),read('docs/authority-matrix.yaml'),read('.github/ISSUE_TEMPLATE/bug.yml'),read('.github/PULL_REQUEST_TEMPLATE.md'),read('SUPPORT.md'),read('docs/TESTING.md'),read('docs/DEVELOPMENT.md'),read('docs/PROJECT_TRAJECTORY.md'),read('tests/verification/documentation-authority-check.mjs'),read('docs/PRODUCT.md'),read('docs/21_DESIGN_SYSTEM.md'),read('docs/UI_FINE_TUNING_3_4_DOD.md')]);
// Post-#274 AS-IS must not route newcomers to retired v3 executable paths.
// Historical/source-input references remain valid and are intentionally excluded.
for(const failure of validateCurrentAtlasGuides(currentAtlasGuides(atlas)))check(false,failure);
for(const p of ['src/bootstrap.mjs','src/server.mjs','src/store.mjs','src/runtime','public','public/ui','tests/verification','audit/archive/ictc-agent-bundle','src/contracts/release-identity.json','tests/contracts/semantic-owner-contract.json'])
 check(await exists(p),'atlas-current:declared executable/path missing: '+p);
// Current owner-routing paths must resolve after #274. Do not apply this
// prohibition to historical Fase 7 or PR239 narratives later in those files.
const configurationText=await read('docs/CONFIGURATION.md');
const architectureCurrent=await read('docs/11_ARCHITECTURE.md');
const currentOwnerDocs=[
 ['START_HERE',start,['src/server.mjs','src/store.mjs','src/ai.mjs','tests/contracts/semantic-owner-contract.json','src/contracts/release-identity.json','public/ui/active-experience.js']],
 ['DEVELOPMENT',development,['src/bootstrap.mjs','src/server.mjs','tests/contracts/semantic-owner-contract.json','tests/contracts/trama-enterprise-dod.json']],
 ['CONFIGURATION',configurationText,['src/bootstrap.mjs','src/lib/bootstrap-contract.mjs']],
 ['ARCHITECTURE',architectureCurrent.split('## Modello di autorità')[0],['src/bootstrap.mjs','src/server.mjs','src/store.mjs','public/index.html','tests/verification/*-check.mjs']],
 ['TESTING',testing.split('## Exact-head e freshness')[0],['src/contracts/release-identity.json','tests/contracts/semantic-owner-contract.json','tests/verification/trama-engineering-check.mjs']],
 // Typed current owner routes; provenance photographs elsewhere are out of scope.
 ['ENDUSER_LANGUAGE',await read('docs/03_ENDUSER_LANGUAGE.md'),['public/ui/product-copy.js','public/ui/stable-shell.js','public/ui/semantic-foundation-model.js','public/ui/semantic-foundation-actions.js']],
 ['USER_JOURNEYS',await read('docs/04_USER_JOURNEYS.md'),['src/runtime/procedure-policy.mjs','src/store.mjs']],
 ['DESIGN_SYSTEM',await read('docs/21_DESIGN_SYSTEM.md'),['public/design-tokens.css','public/workspace-chrome-3-3.css','tests/verification/workspace-chrome-3-3-saturation.mjs']],
 ['CONTRIBUTING',await read('CONTRIBUTING.md'),['src/contracts/release-identity.json','tests/contracts/gaps.json']],
 ['AS_IS_CONVERGENCE',await read('docs/AS_IS_CONVERGENCE.md'),['tests/contracts/gaps.json','tests/contracts/trama-enterprise-dod.json']],
 ['ASSURANCE_RISK',await read('docs/ASSURANCE_RISK_CONTAINMENT.md'),['src/lib/assurance-risk-model.mjs','tests/verification/assurance-risk-check.mjs','tests/verification/visual-grace-lexical-epistemic-check.mjs','tests/browser/browser-information-value.py']],
 ['DATA_AND_STORAGE',await read('docs/DATA_AND_STORAGE.md'),['src/lib/bootstrap-contract.mjs','src/store.mjs','src/sqlite-state-persistence.mjs','src/runtime-store.mjs','src/runtime/recovery.mjs']]
];
// These seven guides must resolve real, current path literals, unlike bounded
// archival narratives in the first five historic-compatible routing checks.
const exactOperationalGuides=new Set(['ENDUSER_LANGUAGE','USER_JOURNEYS','DESIGN_SYSTEM','CONTRIBUTING','AS_IS_CONVERGENCE','ASSURANCE_RISK','DATA_AND_STORAGE']);
for(const [owner,body,tokens] of currentOwnerDocs){
 if(exactOperationalGuides.has(owner))
  check(!/`v3\//.test(body),'post274 current guide reintroduced retired path: '+owner);
 for(const token of tokens){
  if(!exactOperationalGuides.has(owner)){
   check(body.includes(token),'post274 current owner path missing: '+owner+' '+token);continue;
  }
  check(await exists(token),'post274 current route does not exist: '+owner+' '+token);
  check(body.includes('`'+token+'`'),'post274 current owner path missing: '+owner+' '+token);
 }
 check(!/v3\/(?:server|bootstrap|store|ai|public|runtime|release-identity|semantic-owner|trama)/.test(body),
  'post274 retired owner path leaked into current '+owner+' routing');
}
// A registered operational guide must route to CURRENT owners, not the
// pre-#274 v3 preimage. This is an oracle over existing paths, not a new owner.
const gapRegister=await read('docs/GAP_REGISTER.md');
check(!/`v3\//.test(gapRegister),'gap guide: retired v3 path reintroduced');
for(const [current,retired] of [
 ['tests/contracts/gaps.json','v3/gaps.json'],
 ['public/gap-registry.json','v3/public/gap-registry.json'],
 ['tests/contracts/capability-truth.json','v3/capability-truth.json'],
 ['tests/verification/capability-truth-check.mjs','v3/capability-truth-check.mjs']
]){
 check(await exists(current),'gap guide: current referenced path missing: '+current);
 check(gapRegister.includes('`'+current+'`'),'gap guide: current owner route missing: '+current);
 check(!gapRegister.includes('`'+retired+'`'),'gap guide: retired executable route advertised: '+retired);
}
for(const p of ['tests/contracts/semantic-owner-contract.json','tests/contracts/as-is-convergence-contract.json',
 'tests/contracts/trama-enterprise-dod.json','src/ai.mjs','src/lib/bootstrap-contract.mjs'])
 check(await exists(p),'post274 declared current owner path missing: '+p);
// Product wording must not drift from the four actual CSS maturity variants.
const maturityCss=await read('public/semantic-workspace-closure-3-2-1.css');
const maturityStates=['ready','scaffold-yellow','scaffold-orange','placeholder'];
const maturityBackgrounds=maturityStates.map(state=>{
 const rule=new RegExp('\\.procedure-maturity\\[data-maturity="'+state+'"\\]\\s*\\{[^}]*--maturity-bg:\\s*(#[0-9a-fA-F]{6})');
 const color=maturityCss.match(rule)?.[1];
 check(Boolean(color),'product maturity state missing from canonical CSS: '+state);
 return color;
});
check(new Set(maturityBackgrounds).size===maturityStates.length,'product maturity styles must remain distinct');
for(const label of ['verde per «Pronto»','giallo per «Parziale»','arancione per «In costruzione»','grigio per «Segnaposto»'])check(productText.includes(label),'product authority maturity wording drift: '+label);
check(!productText.includes('un’unica tinta carta da zucchero'),'obsolete monochrome maturity claim');
const pkg=JSON.parse(await read('package.json'));
const reviewerReadiness=checkReadiness(root); check(reviewerReadiness.ok,`review-readiness E2 invariants: ${reviewerReadiness.failures.join(',')}`);
const [semanticOwnerText,openapi,uiuxContractText,gateRegistry,repositoryContract,runtimeModel,serverText,securityText,gapsText]=await Promise.all([read('tests/contracts/semantic-owner-contract.json'),read('docs/openapi.yaml'),read('tests/contracts/uiux-converge-0-contract.json'),read('scripts/current-gate-registry.mjs'),read('scripts/repository-contract.mjs'),read('src/runtime/model.mjs'),read('src/server.mjs'),read('SECURITY.md'),read('tests/contracts/gaps.json')]);
const semanticOwner=JSON.parse(semanticOwnerText),debt=semanticOwner.repositoryCoherenceDebt||{},debtFindings=Array.isArray(debt.findings)?debt.findings:[],debtById=Object.fromEntries(debtFindings.map(item=>[item.id,item])),uiuxContract=JSON.parse(uiuxContractText),gaps=JSON.parse(gapsText);
const linkTargets=new Map();
function localTargets(rel,text){const out=[];for(const m of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)){const href=m[1].trim();if(!href||/^(https?:|mailto:|#)/.test(href))continue;out.push(path.normalize(path.join(path.dirname(rel),href.split('#')[0])))}return out}
// Link integrity is about repository readers, not just document authority.
// Scan every Markdown file under docs/; registration still exclusively controls
// authority/lifecycle and START_HERE depth. This protects linked lineage too.
async function markdownFiles(dir='docs'){
 const result=[];
 for(const item of await readdir(path.join(root,dir),{withFileTypes:true})){
   const rel=path.join(dir,item.name);
   if(item.isDirectory())result.push(...await markdownFiles(rel));
   else if(item.isFile()&&rel.endsWith('.md'))result.push(rel);
 }
 return result;
}
const registeredMarkdown=new Set(docs.filter(d=>d.path.endsWith('.md')).map(d=>d.path));
const trackedMarkdown=(await markdownFiles()).sort();
for(const issue of validatePost275DocCoverage(manifest,trackedMarkdown))check(false,'post275 registration: '+issue);
for(const rel of trackedMarkdown){
 const targets=localTargets(rel,await read(rel));
 if(registeredMarkdown.has(rel))linkTargets.set(rel,targets);
 for(const t of targets)check(await exists(t),`broken local link ${rel} -> ${t}`);
}
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
coherenceAuthorityBoundary:debt.createsNewAuthority===false&&/not a second gap register/i.test(debt.claimBoundary||'')&&/debt_projection:\s*tests\/contracts\/semantic-owner-contract\.json#repositoryCoherenceDebt/.test(authority),
legacyAuthorityDeclassified:debtById.F1?.status==='resolved-in-candidate'&&/ui_wiring:\s*[\s\S]*?classification: legacy-lineage-debt[\s\S]*?current_replacement: ui_composition_root/.test(authority)&&/schemas:\s*[\s\S]*?classification: legacy-lineage-debt[\s\S]*?current_replacement: api\+runtime_handlers/.test(authority),
uiDocSemanticConsistency:debtById.F2?.status==='resolved-in-candidate'&&/3 priorità/.test(readme)&&/one-row-per-procedure \/ row-list/.test(readme)&&/one-row-per-procedure \/ row-list/.test(start)&&!/3 → 2 → 1/.test(readme)&&!/3 → 2 → 1/.test(start)&&uiuxContract.surfaceProgram?.find(item=>item.id==='home')?.density==='decision-strip-plus-up-to-3-priority-rows'&&uiuxContract.surfaceProgram?.find(item=>item.id==='processes')?.density==='one-row-per-procedure',
openapiSemanticConsistency:debtById.F3?.status==='resolved-in-candidate'&&/Suite 3\.0 canonica/.test(openapi)&&!/Suite 2\.2 canonica/.test(openapi)&&gateRegistry.includes('DEMO_SUITE_GATES')&&gateRegistry.includes('DEPRECATED_DEMO_SUITE_GATES'),
prDiffDeclarationGuard:debtById.F4?.status==='mitigated-open'&&/file dichiarati sono realmente presenti nel diff/.test(pr)&&/diff reale deve contenerli/.test(development),
f5ExternalLink:debtById.F5?.status==='blocked-external'&&debtById.F5?.linkedGap==='GAP-022'&&debtById.F5?.owner==='E3-GOV'&&gaps.gaps?.some(item=>item.id==='GAP-022'&&item.targetSlice==='E3-GOV'),
f6CodeqlBoundary:debtById.F6?.status==='evidence-bounded'&&debtById.F6?.blocking===false&&/CodeQL remains supplemental and conditional/i.test(securityText)&&/not executed/i.test(securityText),
legacyResidueBoundary:debtById.F7?.status==='open'&&repositoryContract.includes("'app/index.html'")&&runtimeModel.includes('experience:{services:2')&&serverText.includes('projected.experience.services=7')&&/not evidence of current runtime output/i.test(debtById.F7?.limitation||''),
freshnessConsistencyBoundary:debtById.F8?.status==='in-remediation'&&debt.coherenceRule?.freshnessIsNecessaryNotSufficient===true&&debt.coherenceRule?.semanticConsistencyRequiresExecutableOwnerComparison===true&&/^## Freshness vs coerenza semantica/m.test(testing)&&/fresh[\s\S]*necessario, non sufficiente/i.test(atlas),
negativeControlBoundary:Array.isArray(debt.negativeControls)&&debt.negativeControls.length>=8&&debt.negativeControls.every(item=>item.evidenceClass==='bounded-observation'&&item.universalAbsenceProof===false)&&/bounded observations/i.test(atlas),
promptLifecycle:prompt?.lifecycle,promptAuthoritative:prompt?.authoritative===true,uniqueIds:new Set(docs.map(d=>d.id)).size===docs.length,uniquePaths:new Set(docs.map(d=>d.path)).size===docs.length,uniqueTopics:new Set(topics).size===topics.length,currentLifecycleSound:docs.filter(d=>['lineage','source-input','roadmap','generated'].includes(d.lifecycle)).every(d=>!d.authoritative),maxAuthorityDepth,brokenLinks:failures.filter(x=>x.startsWith('broken local link')).length,productVersion:manifest.versionAxes?.product?.value,uiVersion:manifest.versionAxes?.uiComposition?.value,workspaceChromeVersion:manifest.versionAxes?.workspaceChrome?.value,uiPresentationVersion:manifest.versionAxes?.uiPresentation?.value,distributedPresentationRegistered,retired34Lineage,journey:manifest.versionAxes?.journey?.value,constitution:manifest.versionAxes?.constitution?.value,documentationVersion:manifest.versionAxes?.documentation?.value,processCount:(productText.match(/\| (RN|EC|AO|MC|AP|RC|AR)-01 \|/g)||[]).length,ep01BusinessProcess:!/EP-01[^\n]*non [èe] un ottavo processo/i.test(productText),globalUiRuntime:authority.includes('global semantic annotation runtime may classify metadata but may not rewrite business copy')?'annotation-only':'other',capabilityGrammar:authority.includes('Processi catalogue and comparable repeated business records use row/list grammar by their current owner')?'row-list-owner-declared':'other',prTemplate:await exists('.github/PULL_REQUEST_TEMPLATE.md'),issueConfig:await exists('.github/ISSUE_TEMPLATE/config.yml'),securityPolicy:await exists('SECURITY.md'),supportPolicy:await exists('SUPPORT.md'),governance:await exists('GOVERNANCE.md'),codeowners:await exists('.github/CODEOWNERS'),bugInvitesVulnerability:/Security or authorization/.test(bug),supportRoutesSecurity:support.includes('SECURITY.md'),prAuthority:pr.includes('## Affected authority'),prBoundary:pr.includes('## Claim boundary'),prTests:pr.includes('## Tests and falsification'),prDocs:pr.includes('## Documentation'),packageDocsCheck:Boolean(pkg.scripts?.['docs:check']),semanticRailIncludesDocs:pkg.scripts?.['test:current:semantic']==='node scripts/current-semantic-3-2.mjs'&&documentationAuthorityGate.includes('scripts/documentation-lattice-check.mjs'),testingCurrent32:/Native Semantic Lattice 3\.2/.test(testing),testingPromotes28:/^## Closure 2\.8/m.test(testing),developmentCurrent32:/3\.2/.test(development),developmentPromotes28:/Per closure 2\.8/.test(development),externalSettingsNotSelfCertified:Array.isArray(manifest.externalAcceptance)&&manifest.externalAcceptance.length>=2};
for(const m of validateDocumentationModel(model))failures.push(`model:${m}`);
check(/product_intent:\s*\n\s*authority: docs\/PRODUCT\.md/.test(authority),'authority matrix product_intent drift');
check(/documentation_registry:\s*\n\s*authority: docs\/documentation-manifest\.json/.test(authority),'authority matrix documentation registry missing');
check(/repository_self_description:\s*\n\s*authority: docs\/REPOSITORY_ATLAS\.md/.test(authority),'authority matrix repository self-description missing');
check(/debt_projection:\s*tests\/contracts\/semantic-owner-contract\.json#repositoryCoherenceDebt/.test(authority),'repository coherence debt projection missing');
check(authority.includes('current presentation is distributed across declared canonical owners'),'distributed presentation rule missing');
check(authority.includes('workspace-finetuning-3-4.css is retired lineage'),'3.4 retirement rule missing');
check(designDoc.includes('Candidate')&&designDoc.includes('assente'),'design system must describe Candidate as absent');
check(designDoc.includes('Non esiste più un final cascade resolver globale'),'design system must describe presentation retirement');
check(start.includes('uiPresentation = local-owners'),'START_HERE must route current presentation authority');
// Engineer-first falsifiable entrypoint: normal engineering must be possible
// without first interpreting the AI programme or following agent prompts.
const firstH1=readme.indexOf('# ICTC —'),roaHeader=readme.indexOf('roa-programme-header:v1'),threeWays=readme.indexOf('## Da zero: tre percorsi');
check(firstH1===0,'engineer-first: root must introduce ICTC before programme banners');
check(threeWays>firstH1&&roaHeader>threeWays,'engineer-first: product/software/repository routes must precede research framing');
for(const [label,canonical] of [['Prodotto','docs/PRODUCT.md'],['Software','docs/11_ARCHITECTURE.md'],['Repository','docs/START_HERE.md']]){
 check(new RegExp('\\*\\*'+label+'\\*\\*').test(readme.slice(threeWays,roaHeader))||readme.slice(threeWays,roaHeader).includes('**'+label+':'),`engineer-first: missing ${label} route`);
 check(readme.slice(threeWays,roaHeader).includes(canonical),`engineer-first: ${label} owner not linked`);
 check(await exists(canonical),`engineer-first: ${label} canonical path missing`);
}
for(const p of ['docs/CONFIGURATION.md','docs/OPERATIONS.md','docs/TESTING.md','docs/authority-matrix.yaml','docs/documentation-manifest.json','docs/openapi.yaml'])
 check(readme.includes(p)&&await exists(p),`engineer-first: missing executable/authority navigation ${p}`);
check(/AGENTS\.md[^\n]*non prerequisiti/i.test(readme),'engineer-first: assistants must not be required for ordinary engineering');
check(/AGENTS\.md[^\n]*opzionale per lo sviluppo umano/i.test(development),'engineer-first: DEVELOPMENT implies AI gate');
check(/AGENTS[^\n]*non un prerequisito/i.test(start),'engineer-first: START_HERE implies AI gate');
check(/Primo giorno, percorso standard senza AI/.test(development)&&/npm ci --ignore-scripts/.test(development),'engineer-first: no reproducible human quickstart');
check(/Maturità:[^\n]*candidate/.test(readme)&&/CI verde[^\n]*non/.test(readme),'engineer-first: release claims or deployment boundary missing');
check(readme.includes('docs/START_HERE.md'),'README front door missing docs/START_HERE.md');
check(readme.includes('docs/REPOSITORY_ATLAS.md'),'README front door missing Repository Atlas');
check(start.includes('REPOSITORY_ATLAS.md'),'START_HERE missing Repository Atlas route');
// Engineer-first topology and legal pointer must agree with existing canonical owners.
const [mitLicense,licensePointer,legalTerms,rootLauncher] = await Promise.all([
 read('LICENSE'),read('LICENSE.md'),read('docs/OPEN_SOURCE_TERMS.md'),read('ictc.sh')
]);
check(mitLicense.startsWith('MIT License'),'engineer-first: controlling LICENSE must say MIT');
check(/MIT License/.test(legalTerms)&&/repository `LICENSE` file/.test(legalTerms),'engineer-first: legal terms must point to controlling LICENSE');
check(/\[MIT License\]\(LICENSE\)/.test(licensePointer)&&!/Proprietary evaluation bundle/.test(licensePointer),'engineer-first: LICENSE.md may not contradict LICENSE');
check(/^## Mappa fisica minima e DoD engineer-first \(AS-IS\)/m.test(atlas),'engineer-first: repository topology orientation missing');
for(const token of ['v3/','scripts/','tests/verification/legacy/schemas/','.github/workflows/','ictc.sh','CHANGELOG.md','G-P','G-S','G-R','G-M','G-E'])
 check(atlas.includes(token),'engineer-first: topology / DoD owner missing '+token);
check(/^## Cold-start pratico: prova ripetibile senza storia AI/m.test(development),'engineer-first: cold-start exercise missing');
check(development.includes('curl -fsS http://127.0.0.1:4173/api/health')&&development.includes('git diff --check'),'engineer-first: cold-start must exercise real health and change checks');
check(development.includes('E3-HUMAN')&&development.includes('revisore indipendente'),'engineer-first: cold-start must not self-certify human comprehension');
check(rootLauncher.includes('src/bootstrap.mjs')&&pkg.scripts?.start==='node src/bootstrap.mjs','engineer-first: documented standard bootstrap drift');

// Engineer-first source DoD is a projection of the existing documentation owner,
// not a new repository policy, business authority or external approval witness.
// Each local predicate has a negative counterpart in the physical mutation lab.
const firstReadLenses=readme.split('## Navigazione progressiva — cinque prospettive')[1]?.split('## Contesto di programma')[0]||'';
const originalColdStart=development.split('## Cold-start pratico: prova ripetibile senza storia AI')[1]?.split('## Esercizio O1')[0]||'';
const originalReadmeRoutes=readme.split('## Da zero: tre percorsi')[1]?.split('## Navigazione progressiva')[0]||'';
const firstExercise=development.split('## Esercizio O1 — prima modifica reversibile su clone vergine')[1]?.split('## Prima di modificare')[0]||'';
const engineeringPredicates={
 'L-PRODUCT':readme.includes('docs/PRODUCT.md')&&productText.includes('sette processi'),
 'L-SOFTWARE':originalReadmeRoutes.includes('src/bootstrap.mjs')&&firstReadLenses.includes('ingresso `src/bootstrap.mjs`')&&firstReadLenses.includes('HTTP `src/server.mjs`')&&pkg.scripts.start==='node src/bootstrap.mjs',
 'L-REPO':readme.includes('docs/START_HERE.md')&&readme.includes('docs/REPOSITORY_ATLAS.md')&&start.includes('## Scegli subito il tuo compito'),
 'L-FIVE-LENSES':(() => {const expected=['Prodotto','Software','Repository','Governance','Evidenza e DoD'];const summaries=[...readme.matchAll(/<details>\s*<summary><strong>([^<]+)<\/strong>/g)].map(x=>x[1]);return summaries.length===5&&summaries.every((x,i)=>x===expected[i])&&readme.match(/<\/details>/g)?.length===5;})(),
 'L-ROUTING':atlas.includes('## Percorso di lettura in tre minuti')&&start.includes('[DEVELOPMENT](DEVELOPMENT.md)')&&start.includes('[TESTING](TESTING.md)'),
 'L-COLD-START':Boolean(firstExercise)&&firstExercise.includes('npm ci --ignore-scripts')&&firstExercise.includes('npm run demo')&&originalColdStart.includes('http://127.0.0.1:4173/api/health`')&&firstExercise.includes('http://127.0.0.1:4173/api/health`'),
 'L-NEGATIVE':firstExercise.includes('DOCUMENTO_ONBOARDING_INESISTENTE.md')&&firstExercise.includes('broken local link')&&firstExercise.includes('Se non fallisce, l\'esercizio e NO-GO'),
 'L-REVIEW':originalColdStart.includes('git diff --check')&&firstExercise.includes('git diff --check')&&firstExercise.includes('git add docs/DEVELOPMENT.md docs/ENGINEERING_COMPASS.md')&&firstExercise.includes('git commit -m')&&firstExercise.includes('git status --porcelain')&&firstExercise.includes('npm test')&&firstExercise.includes('git revert <sha-del-commit>')&&firstExercise.includes('scheda per il reviewer'),
 'L-NO-AUTHORITY':readme.includes('non cinque nuove autorita')&&development.includes('BLOCKED_EXTERNAL')&&manifest.entrypoint==='docs/START_HERE.md',
 'L-EXTERNAL-BOUNDARY':development.includes('ingegnere che non ha partecipato')&&readme.includes('branch protection')
};
for(const [key,ok] of Object.entries(engineeringPredicates))check(ok,'engineer-first DoD: '+key);
const engineeringEdges={
 'I-IDENTITY':['L-PRODUCT','L-SOFTWARE','L-REPO'],
 'I-NAVIGATION':['L-FIVE-LENSES','L-ROUTING','L-NO-AUTHORITY'],
 'I-MAINTENANCE':['L-COLD-START','L-NEGATIVE','L-REVIEW'],
 'I-TRUST':['L-EXTERNAL-BOUNDARY'],
 'G-SOURCE':['I-IDENTITY','I-NAVIGATION','I-MAINTENANCE','I-TRUST'],
 'G0':['G-SOURCE','E-HUMAN','E-GITHUB','E-CI-EXACT-HEAD']
};
const engineeringStates=Object.fromEntries(Object.entries(engineeringPredicates).map(([k,v])=>[k,v?'PASS_SCOPED':'REFUTED']));
for(const key of ['E-HUMAN','E-GITHUB','E-CI-EXACT-HEAD'])engineeringStates[key]='BLOCKED_EXTERNAL';
const visiting=new Set(),visited=new Set();
function visitDoD(id){
 if(visiting.has(id))throw Error('engineer-first DoD cyclic dependency: '+id);
 if(visited.has(id))return engineeringStates[id];
 const deps=engineeringEdges[id];if(!deps){if(!(id in engineeringStates))throw Error('engineer-first DoD missing node: '+id);visited.add(id);return engineeringStates[id];}
 visiting.add(id);const children=deps.map(visitDoD);visiting.delete(id);visited.add(id);
 engineeringStates[id]=children.includes('REFUTED')?'REFUTED':children.includes('BLOCKED_EXTERNAL')?'BLOCKED_EXTERNAL':'PASS_SCOPED';
 return engineeringStates[id];
}
visitDoD('G0');
if(visited.size!==Object.keys(engineeringEdges).length+Object.keys(engineeringPredicates).length+3)check(false,'engineer-first DoD has unreachable node');
check(engineeringStates['G0']==='BLOCKED_EXTERNAL','engineer-first DoD must not self-approve external gates');
const engineeringDoD={schema:'ictc-engineer-first-dod/projection-1',authority:'NONE',externalAuthorization:'NONE',states:engineeringStates,dependsOn:engineeringEdges,sourceStatus:engineeringStates['G-SOURCE'],globalStatus:engineeringStates['G0']};

// Root repository contract is executed against the same checkout as documentation.
// A static string check alone could incorrectly certify a stale executable tool.
const rootContractRun=spawnSync(process.execPath,[path.join(root,'scripts/repository-contract.mjs'),root],{cwd:root,encoding:'utf8',timeout:30000});
let rootContractReceipt=null;
try{rootContractReceipt=JSON.parse(rootContractRun.stdout||'null')}catch{}
check(rootContractRun.status===0&&rootContractReceipt?.status==='PASS_SCOPED','root current repository contract failed: '+String(rootContractRun.stderr||rootContractRun.stdout).slice(0,280));
check(rootContractReceipt?.retirementAuthorized===false&&rootContractReceipt?.legacyDisposition==='HOLD_CONSUMERS','root contract must not authorize legacy deletion');
const documentationStandard=await read('docs/DOCUMENTATION_STANDARD.md');
check(/## Valore per le imprese/.test(readme)&&/Rispettare le norme\. Governare rischi e costi\./.test(readme)&&/Non determina da solo/.test(readme),'engineer-first value/claim boundary missing');
check(/## Razionalizzazione e archiviazione: decisioni basate sui consumer/.test(atlas)&&/HOLD_CONSUMERS/.test(atlas)&&/HOLD_PUBLIC_URL/.test(atlas),'legacy pocket classification/URL hold missing');
check(/## Reticolo DoD retrogrado per minimalità e standard/.test(documentationStandard)&&/G-MIN = G-UNDERSTAND AND G-CURRENT AND G-LEGACY AND G-ASSURANCE AND G-GOVERNANCE/.test(documentationStandard),'retrograde minimum DoD missing');

if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1)}
console.log(JSON.stringify({ok:true,engineerFirstDoD:engineeringDoD,documents:docs.length,authorityTopics:topics.length,maxAuthorityDepth,versionAxes:manifest.versionAxes,distributedPresentationRegistered,retired34Lineage,externalAcceptance:manifest.externalAcceptance},null,2));
