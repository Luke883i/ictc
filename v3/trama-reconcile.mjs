import {existsSync,readdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const HERE=path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT=path.resolve(HERE,'..');
export const RECONCILE_CONTRACT='v3/trama-reconcile-contract.json';
const TERMINAL=new Set(['done','not-required','resolved','closed','complete','pass','accepted','evidence-bounded']);

const text=(root,rel)=>readFileSync(path.join(root,rel),'utf8');
const json=(root,rel)=>JSON.parse(text(root,rel));
const terminal=value=>TERMINAL.has(String(value||'').toLowerCase());
const norm=value=>String(value||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

export const loadReconcileContract=(root=DEFAULT_ROOT)=>json(root,RECONCILE_CONTRACT);

export function validateReconcileContract(c){
 const f=[],ck=(v,code,detail='')=>{if(!v)f.push({code,detail});};
 ck(c?.schemaVersion==='1.1.0'&&c?.sliceId==='GOV-TRAMA-RECONCILE-1','ID');
 ck(c?.classification==='trama-owned-zero-authority-reconciliation-profile'&&c?.authorityEffect==='NONE','AUTHORITY');
 ck(c?.createsNewSot===false&&c?.createsNewRoadmapCursor===false,'NO_SECOND_SOT');
 ck(c?.method?.parent==='TRAMA'&&c?.method?.profile==='TRAMA-RECONCILE'&&c?.method?.canonicalFamilies===24,'METHOD');
 const campaigns=c?.campaigns||[];ck(campaigns.length===8&&campaigns.every(x=>x.failureFamilies===8),'CAMPAIGNS');
 ck((c?.sourcePrecedence||[]).length===5&&c.sourcePrecedence[0]==='live-git-exact-head','SOURCE_PRECEDENCE');
 ck(JSON.stringify(c?.stateVocabulary?.conditional)==='["todo","in-progress","done","not-required"]','CONDITIONAL_STATES');
 ck(JSON.stringify(c?.stateVocabulary?.serial)==='["eligible","done","blocked"]','SERIAL_STATES');
 const gp=c?.genericContinuationProtocol||{};ck(gp.mode==='GLOBAL_ACT'&&gp.horizons?.join('|')==='LOCAL|INTERMEDIATE|GLOBAL','GENERIC_PROTOCOL');
 ck((gp.output||[]).includes('exactly-one-next-action-or-stop'),'GENERIC_OUTPUT');
 const legacy=c?.legacy||{},classes=legacy.classes||[],rules=legacy.rules||[];
 ck(legacy.censusSource==='git-ls-tree-head','LEGACY_CENSUS_SOURCE');
 ck(classes.length===6&&new Set(classes).size===6&&classes.includes('blocking-unclassified'),'LEGACY_CLASSES');
 ck(rules.length>=20&&rules.every(x=>x.pattern&&classes.includes(x.classification)&&typeof x.blocking==='boolean'),'LEGACY_RULES');
 ck((legacy.contentSites||[]).length>=6&&legacy.contentSites.every(x=>x.path&&x.token&&classes.includes(x.classification)),'LEGACY_CONTENT');
 const pg=c?.repositoryPurposeGovernance||{},states=pg.states||[],admission=pg.futureAdmission||{},retire=pg.retirementProcess||{},human=pg.humanContract||{};
 ck(pg.classification==='zero-authority-derived-file-purpose-census-and-retirement-router'&&pg.authorityEffect==='NONE'&&pg.sourceOfTruth===false&&pg.writer===false,'PURPOSE_BOUNDARY');
 ck(pg.censusSource==='git-ls-tree-head'&&pg.everyTrackedFileMustClassify===true&&pg.qualificationCoverageMinimum===0.95&&pg.qualificationProbes===20,'PURPOSE_CENSUS');
 for(const st of ['active-root','active-referenced','active-generated','dynamic-retained','compatibility-required','migration-only','lineage-only','deprecated-test','retirement-candidate','needs-classification'])ck(states.includes(st),'PURPOSE_STATE',st);
 ck(admission.needsClassification==='BLOCKED'&&admission.newUnreferencedFile==='BLOCKED'&&admission.unboundAuthorityLikeFile==='BLOCKED'&&admission.parallelRuntimeRoot==='BLOCKED_UNLESS_EXPLICITLY_RETAINED'&&admission.addedRetirementCandidate==='BLOCKED'&&admission.addedNeedsClassification==='BLOCKED'&&admission.addedAuthorityCompetition==='BLOCKED'&&admission.addedParallelRuntimeRoot==='BLOCKED_UNLESS_EXPLICIT_RETAINED_ROLE'&&admission.requiresFullHistory===true&&admission.existingRetirementDebtMayRemainButOnlyShrink===true&&admission.preferExistingOwnerBeforeNewFile===true,'PURPOSE_ADMISSION');
 ck(retire.automaticRouting===true&&retire.automaticDeletion===false&&retire.retirementCandidateRequiresCoverageAtLeast===0.95&&retire.retirementCandidateRequiresZeroLiveInboundRefs===true&&retire.retirementCandidateRequiresNoAuthorityBinding===true&&retire.retirementCandidateRequiresNoDynamicLoaderRisk===true&&retire.deletionRequiresDedicatedSemanticSlice===true&&retire.deletionRequiresExactHeadGreen===true,'PURPOSE_RETIREMENT');
 ck(human.technicalFileChoiceRequired===false&&human.classificationChoiceRequired===false&&human.retirementMechanismChoiceRequired===false,'PURPOSE_HUMAN_BURDEN');
 const pm=c?.purposeModelReceipt||{};ck(pm.cycles===10&&pm.casesPerCycle===10000000&&pm.totalCases===100000000&&pm.rootFailureFamilies===48&&pm.rootPairs===1128&&pm.survivors===0&&pm.deletionKilled===48&&pm.noNoveltyTail===10000&&pm.compressionTail===10000&&Array.isArray(pm.receipts)&&pm.receipts.length===10,'PURPOSE_MODEL_RECEIPT');
 ck((c?.reconciliationRules||[]).length===8,'RECON_RULES');
 const cp=c?.criticalPathPolicy||{};ck(cp.oneNextAction===true&&cp.next==='C2-DELIVERY-PROVENANCE','CRITICAL_PATH');
 ck(JSON.stringify(cp.reconciledPath)==='["C2-DELIVERY-PROVENANCE","C1-COMPAT-CONTRACTION","C3-CAPACITY-CONTRACT","C4-AI-EVAL-DRIFT"]','CRITICAL_PATH_ORDER');
 for(const level of ['global','intermediate','local'])ck((c?.dod?.[level]||[]).length>=12,'DOD_'+level.toUpperCase());
 const receipt=c?.localModelReceipt||{};ck(receipt.cases===3000000&&receipt.campaigns===8&&receipt.rootFailureFamilies===64&&receipt.rootPairs===2016&&receipt.survivors===0&&receipt.deletionKilled===64&&receipt.noNoveltyTail===100000&&receipt.novelFamilies===0,'MODEL_RECEIPT');
 return f;
}

function committedRepositoryFiles(root){
 const git=spawnSync('git',['-C',root,'ls-tree','-r','--name-only','-z','HEAD'],{encoding:'utf8',maxBuffer:64*1024*1024});
 if(git.status!==0||git.error)throw Object.assign(new Error('TRAMA reconciliation requires a Git HEAD tree to census committed repository legacy'),{code:'TRAMA_GIT_CENSUS_UNAVAILABLE',detail:git.error?.message||git.stderr||''});
 return git.stdout.split('\0').filter(Boolean).map(x=>x.replaceAll('\\','/'));
}

export function legacyCensus(root=DEFAULT_ROOT,contract=loadReconcileContract(root)){
 const legacy=contract.legacy,candidate=new RegExp(legacy.candidatePathRegex,'i'),rules=legacy.rules.map(row=>({...row,re:new RegExp(row.pattern,'i')}));
 const files=committedRepositoryFiles(root);
 const candidates=files.filter(file=>candidate.test(file)||rules.some(rule=>rule.re.test(file)));
 const pathRows=candidates.map(file=>{
  const rule=rules.find(item=>item.re.test(file));
  return Object.freeze({kind:'path',path:file,classification:rule?.classification||legacy.unknownClass,blocking:rule?.blocking??true,target:rule?.target||null,reason:rule?.reason||null});
 });
 const contentRows=(legacy.contentSites||[]).map(site=>{
  const present=existsSync(path.join(root,site.path));
  const contains=present&&text(root,site.path).includes(site.token);
  return Object.freeze({kind:'content',path:site.path,token:site.token,present,contains,classification:site.classification,blocking:Boolean(site.blocking),target:site.target||null});
 });
 return Object.freeze({
  pathRows,
  contentRows,
  unknown:pathRows.filter(x=>x.classification===legacy.unknownClass),
  blocking:[...pathRows.filter(x=>x.blocking),...contentRows.filter(x=>x.blocking&&x.contains)],
  counts:Object.freeze(Object.fromEntries(legacy.classes.map(k=>[k,pathRows.filter(x=>x.classification===k).length]))),
  censusSource:'git-ls-tree-head',
  contentMissing:contentRows.filter(x=>!x.present||!x.contains)
 });
}


const PURPOSE_EXTENSIONS=Object.freeze(['mjs','js','json','css','py','yml','yaml','md','html','sh','txt','svg','png','b64','xlsx','sha256','example']);
function purposeKind(file){
 if(file.startsWith('.github/workflows/'))return'workflow';
 if(file.startsWith('docs/'))return'documentation';
 if(file.startsWith('v3/public/ui/')||file.startsWith('v3/public/')&&/\.(?:js|css|html|svg|png)$/i.test(file))return'ui';
 if(/(?:check|test|saturation|mutation|fuzz|browser|diagnostic|probe)/i.test(file))return'oracle';
 if(file.startsWith('v3/runtime/')||file==='v3/server.mjs'||file==='v3/store.mjs')return'runtime';
 if(/(?:schema\.json|ya?ml)$/i.test(file)||file.startsWith('schemas/'))return'data-contract';
 if(/fixture|seed/i.test(file))return'fixture';
 if(file.startsWith('artifacts/'))return'artifact';
 if(/\.(?:css|svg|png|b64)$/i.test(file))return'asset';
 if(/(?:package(?:-lock)?\.json|\.nvmrc|\.editorconfig|\.gitignore)$/i.test(file))return'config';
 if(file.endsWith('.md'))return'documentation';
 if(file.endsWith('.json'))return'data-contract';
 if(/\.(?:mjs|js|py|sh)$/i.test(file))return'runtime';
 return'unknown';
}
function readablePurposeText(root,file){
 try{const b=readFileSync(path.join(root,file));if(b.length>2*1024*1024||b.includes(0))return null;return b.toString('utf8');}catch{return null;}
}
function purposeRefs(file,body,fileSet,uniqueBasename){
 if(!body)return Object.freeze([]);
 const out=new Set(),dir=path.posix.dirname(file),exts=PURPOSE_EXTENSIONS.map(x=>'.'+x);
 const resolve=raw=>{
  let token=String(raw||'').trim().replace(/^['"(<!\[]+|['")>;,:!\]]+$/g,'').split('#')[0].split('?')[0].replaceAll('\\','/');
  if(!token||token.includes('://')||token.startsWith('node:'))return;
  const candidates=[];
  if(token.startsWith('./')||token.startsWith('../'))candidates.push(path.posix.normalize(path.posix.join(dir,token)));else candidates.push(token.replace(/^\/+/,''));
  const base=[...candidates];for(const candidate of base)if(!path.posix.extname(candidate))for(const ext of exts)candidates.push(candidate+ext);
  for(const candidate of candidates)if(fileSet.has(candidate)&&candidate!==file)out.add(candidate);
 };
 const pathish=body.match(/(?:\.{1,2}\/|[A-Za-z0-9_.@-]+\/)[A-Za-z0-9_./@-]+/g)||[];for(const token of pathish)resolve(token);
 const names=body.match(/[A-Za-z0-9_.@-]+\.(?:mjs|js|json|css|py|yml|yaml|md|html|sh|txt|svg|png|b64|xlsx|sha256|example)/gi)||[];
 for(const name of names){resolve(name);const unique=uniqueBasename.get(name);if(unique&&unique!==file)out.add(unique);}
 return Object.freeze([...out].sort());
}
function dynamicPurposeDirectories(file,body,files){
 if(!body||!/(?:readdir|glob|walk|recursive|import\s*\()/i.test(body))return[];
 const dir=path.posix.dirname(file),out=new Set(),quoted=[...body.matchAll(/['"]([^'"\n]{1,140})['"]/g)].map(x=>x[1]);
 for(let token of quoted){token=token.replaceAll('\\','/').split('#')[0].split('?')[0];if(/\s/.test(token)||token.includes('://'))continue;const candidates=token.startsWith('./')||token.startsWith('../')?[path.posix.normalize(path.posix.join(dir,token))]:[token.replace(/^\/+/,'')];for(const candidate of candidates)if(files.some(f=>f.startsWith(candidate.replace(/\/+$/,'')+'/')))out.add(candidate.replace(/\/+$/,''));}
 return[...out];
}
export function repositoryPurposeCensus(root=DEFAULT_ROOT,contract=loadReconcileContract(root)){
 const pg=contract.repositoryPurposeGovernance,files=committedRepositoryFiles(root),fileSet=new Set(files),legacy=legacyCensus(root,contract),legacyBy=new Map(legacy.pathRows.map(x=>[x.path,x]));
 const manifest=json(root,'docs/documentation-manifest.json'),manifestBy=new Map((manifest.documents||[]).map(x=>[x.path,x]));
 const basenameRows=new Map();for(const file of files){const b=path.posix.basename(file),a=basenameRows.get(b)||[];a.push(file);basenameRows.set(b,a);}const uniqueBasename=new Map([...basenameRows].filter(([,v])=>v.length===1).map(([k,v])=>[k,v[0]]));
 const bodies=new Map(),refs=new Map(),inbound=new Map(files.map(x=>[x,[]]));for(const file of files){const body=readablePurposeText(root,file);bodies.set(file,body);const r=purposeRefs(file,body,fileSet,uniqueBasename);refs.set(file,r);for(const target of r)inbound.get(target).push(file);}
 const executableRoots=new Set((pg.executableRoots||[]).filter(x=>fileSet.has(x)));for(const file of files)if(file.startsWith('.github/workflows/')&&/\.ya?ml$/i.test(file))executableRoots.add(file);
 const governanceRoots=new Set((pg.governanceRoots||[]).filter(x=>fileSet.has(x))),repositoryMetaRoots=new Set((pg.repositoryMetaRoots||[]).filter(x=>fileSet.has(x))),activeManifest=new Set(),lineageManifest=new Set(),generatedManifest=new Set();
 for(const [file,entry] of manifestBy){if((pg.manifestActiveLifecycles||[]).includes(entry.lifecycle))activeManifest.add(file);if((pg.manifestLineageLifecycles||[]).includes(entry.lifecycle))lineageManifest.add(file);if((pg.manifestGeneratedLifecycles||[]).includes(entry.lifecycle))generatedManifest.add(file);}
 const generated=new Set([...generatedManifest,...files.filter(f=>(pg.generatedPathPrefixes||[]).some(prefix=>f.startsWith(prefix))||(pg.generatedExactPaths||[]).includes(f))]);
 const closure=roots=>{const seen=new Set(roots),queue=[...roots];while(queue.length){const source=queue.shift();if(purposeKind(source)==='documentation'&&!governanceRoots.has(source))continue;for(const target of refs.get(source)||[])if(!seen.has(target)){seen.add(target);queue.push(target);}}return seen;};
 const execReach=closure(executableRoots),governanceBindingRoots=new Set([...governanceRoots].filter(x=>!x.endsWith('.md')||x==='docs/authority-matrix.yaml')),govReach=closure(governanceBindingRoots),liveReach=new Set([...execReach,...govReach]);
 const dynamicDirs=new Set();for(const source of liveReach)for(const d of dynamicPurposeDirectories(source,bodies.get(source),files))dynamicDirs.add(d);
 const min=Number(pg.qualificationCoverageMinimum||0.95),probeCount=Number(pg.qualificationProbes||20),authorityRe=new RegExp(pg.authorityLikePattern,'i'),oracleRe=new RegExp(pg.oracleLikePattern,'i'),parallelRe=new RegExp(pg.parallelRuntimeRootPattern,'i');
 const rows=files.map(file=>{
  const kind=purposeKind(file),manifestEntry=manifestBy.get(file)||null,legacyEntry=legacyBy.get(file)||null,rootExecutable=executableRoots.has(file),rootGovernance=governanceRoots.has(file),repositoryMeta=repositoryMetaRoots.has(file),manifestActive=activeManifest.has(file),isGenerated=generated.has(file),executable=execReach.has(file),governed=govReach.has(file),live=liveReach.has(file),incoming=inbound.get(file)||[],liveInbound=incoming.filter(x=>liveReach.has(x));
  const dynamicRisk=[...dynamicDirs].some(d=>file.startsWith(d+'/'))&&!live,authorityLike=['runtime','data-contract'].includes(kind)&&authorityRe.test(path.posix.basename(file))&&!oracleRe.test(file),parallelRuntimeRoot=parallelRe.test(file),ambiguousBasename=(basenameRows.get(path.posix.basename(file))||[]).length>1;
  const unresolved=[];if(dynamicRisk)unresolved.push('dynamic-loader-risk');if(ambiguousBasename&&!incoming.length)unresolved.push('ambiguous-basename');if(bodies.get(file)===null&&!/\.(?:png|xlsx|b64)$/i.test(file))unresolved.push('text-unreadable');const qualificationCoverage=Math.max(0,(probeCount-unresolved.length)/probeCount);
  let state='needs-classification',reason='no deterministic purpose evidence';
  if(rootExecutable||rootGovernance||repositoryMeta||manifestActive){state='active-root';reason=rootExecutable?'executable root':rootGovernance?'governance root':repositoryMeta?'repository metadata root':'active documentation manifest';}
  else if(live){state='active-referenced';reason=executable?'reachable from executable root':'reachable from machine-readable governance root';}
  else if(isGenerated){state='active-generated';reason='generated lifecycle/path contract';}
  else if(legacyEntry&&['compatibility-required','migration-only','lineage-only','deprecated-test'].includes(legacyEntry.classification)){state=legacyEntry.classification;reason='explicit legacy role';}
  else if(lineageManifest.has(file)){state='lineage-only';reason='documentation manifest lineage';}
  else if(dynamicRisk){state='dynamic-retained';reason='possible dynamic loader reachability; retained conservatively';}
  else if(qualificationCoverage>=min){state='retirement-candidate';reason=authorityLike?'unbound authority-like object routed to retirement':legacyEntry?.classification==='retirement-candidate'?'explicit legacy retirement candidate':'observed unreferenced after qualification probes';}
  const useState=['active-root','active-referenced','active-generated'].includes(state)?'current-use':['dynamic-retained','compatibility-required','migration-only','lineage-only','deprecated-test'].includes(state)?'retained-purpose':'observed-unreferenced';
  return Object.freeze({path:file,kind,state,useState,reason,qualificationCoverage,liveInbound:Object.freeze(liveInbound.sort()),inboundCount:incoming.length,outboundCount:(refs.get(file)||[]).length,dynamicRisk,authorityLike,parallelRuntimeRoot,manifestLifecycle:manifestEntry?.lifecycle||null,legacyClassification:legacyEntry?.classification||null});
 });
 const byState=Object.fromEntries(pg.states.map(st=>[st,rows.filter(x=>x.state===st).length])),needsClassification=rows.filter(x=>x.state==='needs-classification'),retirementCandidates=rows.filter(x=>x.state==='retirement-candidate'),authorityCompetition=retirementCandidates.filter(x=>x.authorityLike),parallelRuntimeDebt=rows.filter(x=>x.parallelRuntimeRoot&&!['active-root','active-referenced','dynamic-retained','compatibility-required','migration-only','lineage-only','deprecated-test'].includes(x.state));
 return Object.freeze({schema:'ictc-repository-purpose-census/v1',authorityEffect:'NONE',projectionIsSot:false,writer:false,censusSource:'git-ls-tree-head',totalFiles:files.length,classifiedFiles:rows.length-needsClassification.length,coverage:(rows.length-needsClassification.length)/Math.max(1,rows.length),byState:Object.freeze(byState),rows:Object.freeze(rows),needsClassification:Object.freeze(needsClassification),retirementCandidates:Object.freeze(retirementCandidates),authorityCompetition:Object.freeze(authorityCompetition),parallelRuntimeDebt:Object.freeze(parallelRuntimeDebt),dynamicDirectories:Object.freeze([...dynamicDirs].sort()),automaticDeletion:false,claimBoundary:pg.claimBoundary});
}


function addedPurposeFilesAgainstBase(root){
 const base=String(process.env.GITHUB_BASE_REF||'').trim();
 if(!base)return Object.freeze({evaluated:false,baseRef:null,mergeBase:null,added:Object.freeze([]),reason:'non-pr-or-base-ref-unavailable'});
 const fetch=spawnSync('git',['-C',root,'rev-parse','--verify','origin/'+base],{encoding:'utf8'});
 if(fetch.status!==0)return Object.freeze({evaluated:false,baseRef:base,mergeBase:null,added:Object.freeze([]),reason:'origin-base-ref-unavailable'});
 const mb=spawnSync('git',['-C',root,'merge-base','HEAD','origin/'+base],{encoding:'utf8'});
 if(mb.status!==0)return Object.freeze({evaluated:false,baseRef:base,mergeBase:null,added:Object.freeze([]),reason:'merge-base-unavailable'});
 const mergeBase=mb.stdout.trim(),diff=spawnSync('git',['-C',root,'diff','--name-only','--diff-filter=A','-z',mergeBase+'...HEAD'],{encoding:'utf8',maxBuffer:16*1024*1024});
 if(diff.status!==0)return Object.freeze({evaluated:false,baseRef:base,mergeBase,added:Object.freeze([]),reason:'added-file-diff-unavailable'});
 return Object.freeze({evaluated:true,baseRef:base,mergeBase,added:Object.freeze(diff.stdout.split('\0').filter(Boolean).map(x=>x.replaceAll('\\','/')).sort()),reason:null});
}
export function repositoryPurposeAdmission(root=DEFAULT_ROOT,contract=loadReconcileContract(root),census=repositoryPurposeCensus(root,contract)){
 const change=addedPurposeFilesAgainstBase(root),byPath=new Map(census.rows.map(x=>[x.path,x])),violations=[];
 if(process.env.GITHUB_ACTIONS==='true'&&process.env.GITHUB_EVENT_NAME==='pull_request'&&!change.evaluated)violations.push({code:'PURPOSE_BASE_DIFF_UNAVAILABLE',reason:change.reason});
 for(const file of change.added){
  const row=byPath.get(file);if(!row){violations.push({code:'ADDED_FILE_NOT_IN_CENSUS',path:file});continue;}
  if(row.state==='needs-classification')violations.push({code:'ADDED_NEEDS_CLASSIFICATION',path:file});
  if(row.state==='retirement-candidate')violations.push({code:'ADDED_UNREFERENCED_SCAFFOLD',path:file});
  if(row.authorityLike&&!['active-root','active-referenced'].includes(row.state))violations.push({code:'ADDED_AUTHORITY_COMPETITION',path:file});
  if(row.parallelRuntimeRoot&&!['active-root','active-referenced','compatibility-required','migration-only'].includes(row.state))violations.push({code:'ADDED_PARALLEL_RUNTIME_ROOT',path:file});
 }
 return Object.freeze({schema:'ictc-repository-purpose-admission/v1',authorityEffect:'NONE',evaluated:change.evaluated,baseRef:change.baseRef,mergeBase:change.mergeBase,addedFiles:change.added,violations:Object.freeze(violations),ok:violations.length===0,claimBoundary:'PR admission guard only; current pre-existing retirement debt may remain but new unreferenced/competing scaffolding is fail-closed.'});
}

function finding(map,id){return map.find(x=>x.id===id)||null;}
export function deriveExpectedReconciliation(root=DEFAULT_ROOT,contract=loadReconcileContract(root)){
 const remediation=json(root,'audit/remediation-registry.json').findings||[];
 const semantic=json(root,'v3/semantic-owner-contract.json');
 const registry=text(root,'v3/current-gate-registry.mjs');
 const legacy=legacyCensus(root,contract);
 const drsc=semantic?.repositoryCoherenceDebt?.findings||[];
 const f7=finding(drsc,'F7'),f06=finding(remediation,'F-06'),f13=finding(remediation,'F-13'),f15=finding(remediation,'F-15');
 const c5Ready=Array.isArray(semantic?.surfaceOwners)&&semantic.surfaceOwners.length===13&&
  ['v3/c5-semantic-owner-check.mjs','v3/c5-semantic-owner-saturation.mjs','v3/c5-needs-audit-saturation.mjs'].every(g=>registry.includes("'"+g+"'"));
 const uiuxRequired=['v3/capability-closure-e2-check.mjs','v3/capability-closure-e2-saturation.mjs','v3/uiux-converge-0-check.mjs','v3/uiux-runtime-contraction-check.mjs','v3/uiux-ontoepistemic-convergence-3-check.mjs','v3/uiux-ontoepistemic-convergence-3-saturation-10m.mjs'];
 const uiuxReady=uiuxRequired.every(g=>registry.includes("'"+g+"'"));
 const c3Evidence=existsSync(path.join(root,'v3/c3-enterprise-runtime-closure.json'))&&existsSync(path.join(root,'v3/c3-enterprise-bench-dod-check.mjs'));
 const c1Blocked=!terminal(f7?.status)||legacy.blocking.length>0;
 const conditionals={
  'C1-COMPAT-CONTRACTION':c1Blocked?'todo':'done',
  'C2-DELIVERY-PROVENANCE':terminal(f06?.status)?'done':f06?'in-progress':'todo',
  'C3-CAPACITY-CONTRACT':terminal(f13?.status)?(c3Evidence?'done':'todo'):(c3Evidence?'in-progress':'todo'),
  'C4-AI-EVAL-DRIFT':terminal(f15?.status)?'done':f15?'in-progress':'todo',
  'C5-SEMANTIC-OWNER-COMPRESSION':c5Ready?'done':'todo'
 };
 const serial={
  'UIUX-CONVERGE-0':uiuxReady&&conditionals['C5-SEMANTIC-OWNER-COMPRESSION']==='done'?'done':'eligible',
  'S4-A6-CLOSE':'blocked',
  'S5-CANDIDATE-SEAL':'blocked'
 };
 const pathOrder=(contract.criticalPathPolicy?.reconciledPath||[]).filter(id=>!terminal(conditionals[id]));
 const nextConditional=pathOrder[0]||null;
 return Object.freeze({
  schema:'ictc-trama-reconcile-expected/v1',
  conditionals:Object.freeze(conditionals),
  serial:Object.freeze(serial),
  planning:Object.freeze({
   completedThrough:serial['UIUX-CONVERGE-0']==='done'?'UIUX-CONVERGE-0':'DECIDE-0',
   nextSerialSlice:serial['UIUX-CONVERGE-0']==='done'?'S4-A6-CLOSE':'UIUX-CONVERGE-0',
   nextSerialState:serial['UIUX-CONVERGE-0']==='done'?'blocked':'eligible',
   nextConditionalSlice:nextConditional,
   criticalPath:pathOrder
  }),
  evidence:Object.freeze({c5Ready,uiuxReady,c3Evidence,f7:f7?.status||null,f06:f06?.status||null,f13:f13?.status||null,f15:f15?.status||null}),
  legacy,
  externalRails:['E3-HUMAN','E3-GOV','E4-DEPLOY'],
  claimBoundary:'Expected repository planning only. External rails remain separate and cannot be closed by this reducer.'
 });
}

export function reconcileAuthority(root=DEFAULT_ROOT,authority=json(root,'docs/convergence/convergence-authority.json'),contract=loadReconcileContract(root)){
 const expected=deriveExpectedReconciliation(root,contract),debt=[];
 const conditionalMap=Object.fromEntries((authority.conditionalSlices||[]).map(x=>[x.id,x.state]));
 for(const [id,state] of Object.entries(expected.conditionals))if(conditionalMap[id]!==state)debt.push({id:'COND:'+id,expected:state,observed:conditionalMap[id]??null});
 const serialMap=Object.fromEntries((authority.serialChain||[]).map(x=>[x.id,x.state]));
 for(const [id,state] of Object.entries(expected.serial))if(serialMap[id]!==state)debt.push({id:'SERIAL:'+id,expected:state,observed:serialMap[id]??null});
 for(const key of ['completedThrough','nextSerialSlice','nextSerialState','nextConditionalSlice'])if((authority.planningState||{})[key]!==expected.planning[key])debt.push({id:'PLAN:'+key,expected:expected.planning[key],observed:(authority.planningState||{})[key]??null});
 if(JSON.stringify(authority.planningState?.criticalPath||[])!==JSON.stringify(expected.planning.criticalPath||[]))debt.push({id:'PLAN:criticalPath',expected:expected.planning.criticalPath,observed:authority.planningState?.criticalPath||[]});
 if(authority.governanceRevision!=='GOV-WB6')debt.push({id:'GOVERNANCE:REVISION',expected:'GOV-WB6',observed:authority.governanceRevision??null});
 const observation=authority.reconciliationObservation||{},preimage=contract.observedPreimage||{};
 if(observation.mainSha!==preimage.mainSha)debt.push({id:'OBSERVATION:mainSha',expected:preimage.mainSha,observed:observation.mainSha??null});
 if(observation.mergedPr!==preimage.mergedPr)debt.push({id:'OBSERVATION:mergedPr',expected:preimage.mergedPr,observed:observation.mergedPr??null});
 const railIds=(authority.externalRails||[]).filter(x=>x?.state==='external').map(x=>x.id);
 if(JSON.stringify(railIds)!==JSON.stringify(expected.externalRails))debt.push({id:'EXTERNAL_RAILS',expected:expected.externalRails,observed:railIds});
 if(authority.s5Seal?.enterpriseCandidate!==false||authority.s5Seal?.enterpriseReady!==false)debt.push({id:'S5:NON_PROMOTION',expected:{enterpriseCandidate:false,enterpriseReady:false},observed:{enterpriseCandidate:authority.s5Seal?.enterpriseCandidate??null,enterpriseReady:authority.s5Seal?.enterpriseReady??null}});
 const finals=(authority.reconciliations||[]).filter(x=>x?.finalForPlanState===true);
 const final=finals[0]||null;
 if(finals.length!==1||final?.id!=='REC-GOV-TRAMA-COMPASS-1-MAIN'||final?.mergedPr!==preimage.mergedPr||final?.mergeSha!==preimage.mainSha||final?.reconciledSubSlice!=='GOV-TRAMA-COMPASS-1')debt.push({id:'RECONCILIATION:FINAL_PLAN_OBSERVATION',expected:{count:1,id:'REC-GOV-TRAMA-COMPASS-1-MAIN',mergedPr:preimage.mergedPr,mergeSha:preimage.mainSha,reconciledSubSlice:'GOV-TRAMA-COMPASS-1'},observed:finals});
 if(expected.legacy.unknown.length)debt.push({id:'LEGACY:UNCLASSIFIED',expected:0,observed:expected.legacy.unknown.length});
 if(expected.legacy.contentMissing.length)debt.push({id:'LEGACY:CONTENT_SITE_DRIFT',expected:0,observed:expected.legacy.contentMissing.length});
 return Object.freeze({schema:'ictc-trama-reconciliation-audit/v1',coherent:debt.length===0,debt,expected,authorityRevision:authority.governanceRevision||null,projectionIsSot:false});
}

export function isGenericContinuationIntent(value,contract=loadReconcileContract()){
 const n=norm(value);
 if(!n)return false;
 return (contract.genericContinuationProtocol?.phrases||[]).some(phrase=>norm(phrase)===n);
}

export function interactionMode(value,contract=loadReconcileContract()){
 return isGenericContinuationIntent(value,contract)?'GLOBAL_ACT':'INTENT_SCOPED';
}

export function nextGovernedAction(root=DEFAULT_ROOT){
 const c=loadReconcileContract(root),audit=reconcileAuthority(root,undefined,c);
 if(!audit.coherent)return Object.freeze({state:'RECONCILE_FIRST',slice:'GOV-TRAMA-RECONCILE-1',why:'Observed repository evidence and durable convergence planning disagree.',debt:audit.debt});
 const next=audit.expected.planning.nextConditionalSlice;
 if(next)return Object.freeze({state:'READY_TO_PLAN',slice:next,why:c.criticalPathPolicy.nextWhy,criticalPath:audit.expected.planning.criticalPath});
 return Object.freeze({state:'STOP_OR_PARENT_SEAL',slice:'S4-A6-CLOSE',why:'All applicable conditional slices are terminal; evaluate the parent seal without skipping its own DoD.'});
}
