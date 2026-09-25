import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {legacyCensus} from './trama-reconcile.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT=path.resolve(HERE,'..');
const TERMINAL=new Set(['done','closed','complete','pass','not-required','accepted','resolved','resolved-in-candidate','evidence-bounded']);
const text=(root,p)=>readFileSync(path.join(root,p),'utf8');
const json=(root,p)=>JSON.parse(text(root,p));
const digest=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const terminal=v=>TERMINAL.has(String(v||'').toLowerCase());
const severityRank=v=>({critical:4,high:3,medium:2,low:1}[String(v||'').toLowerCase()]||0);
export const loadAsIsConvergenceContract=(root=DEFAULT_ROOT)=>json(root,'v3/as-is-convergence-contract.json');

function evidenceClass(kind,item){
  if(kind==='external-rail')return item.id==='E3-HUMAN'?'E3-HUMAN':item.id==='E3-GOV'?'E3-GOV':'E4';
  if(kind==='remediation-finding')return item.requiredGrade||'E2';
  if(item.targetSlice==='E3-HUMAN')return'E3-HUMAN';
  if(item.targetSlice==='E3-GOV')return'E3-GOV';
  if(item.targetSlice==='E4-DEPLOY'||item.closureClass==='external-evidence')return'E4';
  if(item.closureClass==='independent-evidence')return'E3';
  return'E2';
}
function ownerForGap(item){return (item.changePaths||[])[0]||'v3/gaps.json';}
function normalized(base){return Object.freeze({...base,dependencies:Object.freeze([...(base.dependencies||[])]),related:Object.freeze([...(base.related||[])])});}
function normalizeGap(item,c){
  return normalized({key:'gap:'+item.id,sourceId:item.id,sourcePath:'v3/gaps.json',kind:'gap',state:item.status,terminal:terminal(item.status),severity:item.severity||'unspecified',closureClass:item.closureClass||'unspecified',evidenceClass:evidenceClass('gap',item),ownerRef:ownerForGap(item),target:item.targetSlice||null,dependencies:[],related:c.relatedDebt[item.id]||[],falsifier:(item.testPaths||[])[0]||null,claimBoundary:(item.limitations||[]).join(' ')||'Gap registry claim only.'});
}
function normalizeFinding(item,c){
  return normalized({key:'finding:'+item.id,sourceId:item.id,sourcePath:'audit/remediation-registry.json',kind:'remediation-finding',state:item.status,terminal:terminal(item.status),severity:item.severity||'unspecified',closureClass:item.gate==='repository'?'repository-internal':item.gate==='independent-review'||item.gate==='human-at'?'independent-evidence':'external-evidence',evidenceClass:evidenceClass('remediation-finding',item),ownerRef:'audit/remediation-registry.json#'+item.id,target:item.gate||null,dependencies:[],related:c.relatedDebt[item.id]||[],falsifier:item.rootControl||null,claimBoundary:item.repositoryPosture||'Remediation registry claim only.'});
}
function normalizeCoherenceFinding(item,c){
  const ext=item.owner==='E3-GOV'||item.status==='blocked-external';
  return normalized({key:'coherence:'+item.id,sourceId:item.id,sourcePath:'v3/semantic-owner-contract.json',kind:'repository-coherence-finding',state:item.status,terminal:terminal(item.status),severity:item.severity||'unspecified',closureClass:ext?'independent-evidence':'repository-internal',evidenceClass:item.owner==='E3-GOV'?'E3-GOV':'E2',ownerRef:item.owner||'v3/semantic-owner-contract.json#repositoryCoherenceDebt',target:item.target||null,dependencies:[],related:c.relatedDebt[item.id]||[],falsifier:item.falsifier||null,claimBoundary:item.limitation||'Repository coherence finding only.'});
}
function normalizeConditional(item,c){
  return normalized({key:'conditional:'+item.id,sourceId:item.id,sourcePath:'docs/convergence/convergence-authority.json',kind:'conditional-slice',state:item.state,terminal:terminal(item.state),severity:'strategic',closureClass:'repository-internal',evidenceClass:'E2',ownerRef:'docs/convergence/convergence-authority.json#conditionalSlices',target:item.mustResolveBefore||null,dependencies:item.debtRefs||[],related:[],falsifier:'claim-specific executable gates for '+item.id,claimBoundary:'Development sequencing only; terminal repository state does not close external rails.'});
}
function normalizeSerial(item){
  return normalized({key:'serial:'+item.id,sourceId:item.id,sourcePath:'docs/convergence/convergence-authority.json',kind:'serial-slice',state:item.state,terminal:terminal(item.state),severity:'strategic',closureClass:'repository-internal',evidenceClass:'E2',ownerRef:'docs/convergence/convergence-authority.json#serialChain',target:null,dependencies:[],related:[],falsifier:'convergence authority plus claim-specific exact-head evidence',claimBoundary:'Development sequencing only.'});
}
function normalizeExternal(item){
  return normalized({key:'external:'+item.id,sourceId:item.id,sourcePath:'docs/convergence/convergence-authority.json',kind:'external-rail',state:item.state,terminal:terminal(item.state),severity:'external',closureClass:item.id==='E3-HUMAN'?'independent-evidence':item.id==='E3-GOV'?'independent-evidence':'external-evidence',evidenceClass:evidenceClass('external-rail',item),ownerRef:'external-oracle:'+item.id,target:item.id,dependencies:[],related:[],falsifier:'independent observed evidence on '+item.id,claimBoundary:'Repository tests cannot close this rail.'});
}
function currentAuthoritativeDocs(root){
  const m=json(root,'docs/documentation-manifest.json');
  return (m.documents||[]).filter(x=>x.authoritative&&['current','operating','policy'].includes(x.lifecycle)&&!x.path.endsWith('.xlsx'));
}
export function documentationDrift(root=DEFAULT_ROOT){
  const out=[],product=text(root,'docs/PRODUCT.md'),gaps=text(root,'v3/gaps.json'),agents=text(root,'AGENTS.md');
  if(/UIUX-CONVERGE-0[^\n.]{0,180}resta la prossim/i.test(product))out.push({code:'PRODUCT_STALE_UIUX_POINTER',path:'docs/PRODUCT.md'});
  if(/C5-SEMANTIC-OWNER-COMPRESSION[^\n.]{0,180}deve essere terminal/i.test(product))out.push({code:'PRODUCT_STALE_C5_POINTER',path:'docs/PRODUCT.md'});
  if(/"scope"\s*:\s*"[^"]*main@[0-9a-f]{7,40}/i.test(gaps))out.push({code:'GAPS_SCOPE_FIXED_GIT_POINTER',path:'v3/gaps.json'});
  const nums=[...agents.matchAll(/^(\d+)\.\s/gm)].map(x=>Number(x[1])),seen=new Set(),dups=new Set();for(const n of nums){if(seen.has(n))dups.add(n);seen.add(n);}if(dups.size)out.push({code:'AGENTS_RULE_NUMBER_COLLISION',path:'AGENTS.md',detail:[...dups]});
  for(const entry of currentAuthoritativeDocs(root)){const body=text(root,entry.path);if(/enterpriseCandidate\s*[:=]\s*true/i.test(body))out.push({code:'DOC_SELF_PROMOTION',path:entry.path});if(entry.path!=='docs/convergence/convergence-authority.json'&&/main@[0-9a-f]{7,40}/i.test(body))out.push({code:'DOC_FIXED_GIT_POINTER',path:entry.path});if(entry.path!=='docs/convergence/convergence-authority.json'&&/(?:critical path|prossima[^\n]{0,30}slice|next[^\n]{0,30}slice)[^\n]{0,180}C[1-5]-[A-Z0-9-]+/i.test(body))out.push({code:'DOC_LIVE_TRAJECTORY_SHADOW',path:entry.path});}
  return Object.freeze(out);
}
export function uiEntropy(root=DEFAULT_ROOT){
  const out=[],html=text(root,'v3/public/index.html'),shell=text(root,'v3/public/ui/stable-shell.js'),workspace=text(root,'v3/public/enterprise-workspace-3-2.css'),closure=text(root,'v3/public/semantic-workspace-closure-3-2-1.css'),proof=text(root,'v3/public/ui/proof-surface.js'),operational=text(root,'v3/public/ui/operational-surface-a6-ux3.js');
  const identity=html.indexOf('id="homeTitle"'),decision=html.indexOf('id="homeNextTitle"'),queue=html.indexOf('id="homePriorities"');
  if(!(identity>=0&&decision>identity&&queue>decision))out.push({code:'HOME_SEMANTIC_ORDER',detail:{identity,decision,queue}});
  if(!shell.includes('.slice(0,3)'))out.push({code:'HOME_PRIORITY_UNBOUNDED'});
  if(!workspace.includes('.home-priority-table')||!workspace.includes('.home-priority-main'))out.push({code:'HOME_NONCANONICAL_LIST_GRAMMAR'});
  if(!operational.includes("a6OperationalQueue='decision-then-priority'"))out.push({code:'HOME_OPERATIONAL_ORDER_MARKER'});
  if(!closure.includes('#procedureHub{display:grid!important;grid-template-columns:1fr!important')||!closure.includes('grid-template-areas:"code title purpose action"'))out.push({code:'PROCESS_HUB_NOT_ROW_LIST'});
  if(closure.includes('repeat(3,minmax(0,1fr))')||closure.includes('min-height:226px'))out.push({code:'PROCESS_HUB_CARD_WALL_RETURNED'});
  if(!proof.includes('renderBusinessEvidence();')||!closure.includes('details.proof-section'))out.push({code:'PROOF_PROGRESSIVE_EVIDENCE_ORDER'});
  return Object.freeze(out);
}
export function normalizeKnownDebt(root=DEFAULT_ROOT){
  const c=loadAsIsConvergenceContract(root),g=json(root,'v3/gaps.json'),r=json(root,'audit/remediation-registry.json'),a=json(root,'docs/convergence/convergence-authority.json'),semantic=json(root,'v3/semantic-owner-contract.json');
  return Object.freeze([
    ...(g.gaps||[]).map(x=>normalizeGap(x,c)),
    ...((r.findings||r.items)||[]).map(x=>normalizeFinding(x,c)),
    ...((semantic.repositoryCoherenceDebt?.findings)||[]).map(x=>normalizeCoherenceFinding(x,c)),
    ...(a.conditionalSlices||[]).map(x=>normalizeConditional(x,c)),
    ...(a.serialChain||[]).map(normalizeSerial),
    ...(a.externalRails||[]).map(normalizeExternal)
  ]);
}
export function closedDebtRegressions(root=DEFAULT_ROOT){
  const c=loadAsIsConvergenceContract(root),all=normalizeKnownDebt(root),by=new Map(all.map(x=>[x.sourceId,x])),out=[];
  const groups=[['gap',c.asIsLock.lockedClosedGapIds],['finding',c.asIsLock.lockedResolvedFindingIds],['conditional',c.asIsLock.lockedTerminalConditionalIds],['serial',c.asIsLock.lockedTerminalSerialIds]];
  for(const [kind,ids] of groups)for(const id of ids){const item=by.get(id);if(!item||!item.terminal)out.push({code:'CLOSED_DEBT_REGRESSION',kind,id,state:item?.state||'missing'});}
  return Object.freeze(out);
}
export const AS_IS_SEMANTIC_RUNTIME_FAULTS=Object.freeze([
'AUTHORITY_ESCALATION','SECOND_SOT','PARALLEL_WRITER','UNKNOWN_OWNER_CONTINUES','MULTIPLE_NEXT_ACTIONS','HUMAN_TECH_NODE','HUMAN_MUTATION_BUDGET','HUMAN_FRAMEWORK_CHOICE',
'EXTERNAL_EVIDENCE_LAUNDER','EVIDENCE_GRADE_PROMOTION','CLAIM_EXCEEDS_EVIDENCE','STALE_EVIDENCE_ACCEPTED','UNSAFE_RETIREMENT','UNKNOWN_LEGACY_SAFE','LEGACY_REENTRY','DOC_SHADOW_AUTHORITY',
'ORACLE_CORRELATION_LAUNDER','WRITE_WITHOUT_READBACK','WRITE_WITHOUT_RECEIPT','NETWORK_EQUALS_ELIGIBILITY','AI_PROPOSAL_EQUALS_DECISION','AI_OWNER_ESCAPE','AI_WRITES_AUTHORITY','CI_EQUALS_DEPLOYMENT',
'MERGE_EQUALS_RELEASE','BROWSER_EQUALS_HUMAN','INTEGRITY_EQUALS_AUTHENTICITY','MAPPING_EQUALS_COMPLIANCE','EVIDENCE_EQUALS_CONCLUSION','OBSERVED_EQUALS_WORLD_TRUTH','HUMAN_COGNITIVE_OVERLOAD','VISUAL_SEMANTIC_ORDER_DRIFT'
]);
export function evaluateSemanticMutationMask(mask){
  mask=mask>>>0;let violations=0,signature=2166136261>>>0;
  for(let i=0;i<32;i++)if((mask>>>i)&1){violations++;signature=Math.imul(signature^(i+1),16777619)>>>0;}
  if((mask&0x0000000f)!==0&&(mask&0x00000f00)!==0){violations++;signature=Math.imul(signature^0xa1,16777619)>>>0;}
  if((mask&0x00700000)!==0&&(mask&0x00000300)!==0){violations++;signature=Math.imul(signature^0xb2,16777619)>>>0;}
  if((mask&0x0f800000)!==0&&(mask&0x00000f00)!==0){violations++;signature=Math.imul(signature^0xc3,16777619)>>>0;}
  if((mask&0xf0000000)!==0&&(mask&0x00010000)!==0){violations++;signature=Math.imul(signature^0xd4,16777619)>>>0;}
  return Object.freeze({ok:violations===0,violations,signature:signature>>>0});
}
export function validateFalsificationTopologySpec(spec){
  const failures=[],nodes=spec?.nodes||[],edges=spec?.edges||[],ids=new Set(nodes.map(x=>x.id)),keys=new Set(edges.map(x=>x.from+'>'+x.to));
  if(spec?.sourceOfTruth!==false||spec?.writer!==false||spec?.noMaturityScore!==true)failures.push('BOUNDARY');
  if(nodes.length!==12||ids.size!==12)failures.push('NODE_CENSUS');
  if(edges.length!==15||keys.size!==15)failures.push('EDGE_CENSUS');
  for(const e of edges)if(!ids.has(e.from)||!ids.has(e.to))failures.push('EDGE_NODE:'+e.from+'>'+e.to);
  const g=spec?.operatorGuidance||{};
  if(g.deterministic!==true||g.exactlyOneNextAction!==true||g.technicalChoiceRequiredFromHuman!==false||g.frameworkChoiceRequiredFromHuman!==false||g.mutationBudgetChoiceRequiredFromHuman!==false)failures.push('HUMAN_BURDEN');
  const m=spec?.runtimeMutation||{};
  if(m.rootFailureFamilies!==32||m.trials!==10000000||m.actualEvaluatorInvocations!==true)failures.push('RUNTIME_MUTATION');
  return failures;
}
export function deriveFalsificationTopology(root=DEFAULT_ROOT,all=normalizeKnownDebt(root)){
  const c=loadAsIsConvergenceContract(root),spec=c.falsificationTopology,invalid=validateFalsificationTopologySpec(spec);
  if(invalid.length)throw Error('invalid falsification topology '+invalid.join(','));
  const active=all.filter(x=>!x.terminal),byId=new Map(active.map(x=>[x.sourceId,x])),assigned=new Set();
  const nodes=spec.nodes.map(n=>{const refs=(n.debtRefs||[]).map(id=>byId.get(id)).filter(Boolean);for(const x of refs)assigned.add(x.sourceId);const repository=refs.some(x=>x.evidenceClass==='E2'||x.closureClass==='repository-internal');const state=n.external?'EXTERNAL_REQUIRED':refs.length?(repository?'OPEN_REPOSITORY':'EXTERNAL_REQUIRED'):'CONVERGED_E2';return Object.freeze({id:n.id,key:n.key,state,debtRefs:Object.freeze(refs.map(x=>x.sourceId))});});
  const unclassified=active.filter(x=>!assigned.has(x.sourceId)),nodeMap=new Map(nodes.map(x=>[x.id,x]));
  const edges=spec.edges.map(e=>{const x=nodeMap.get(e.from),y=nodeMap.get(e.to),state=unclassified.length?'STALE':(x.state==='CONVERGED_E2'&&y.state==='CONVERGED_E2'?'COVERED':'PARTIAL');return Object.freeze({from:e.from,to:e.to,state});});
  return Object.freeze({schema:'ictc-falsification-topology/v1',authorityEffect:'NONE',projectionIsSot:false,noMaturityScore:true,nodes:Object.freeze(nodes),edges:Object.freeze(edges),unclassifiedActiveDebt:Object.freeze(unclassified.map(x=>x.sourceId)),blocked:unclassified.length>0});
}
export function deriveRetirementFrontier(root=DEFAULT_ROOT){
  const legacy=legacyCensus(root),retirement=(legacy.pathRows||[]).filter(x=>x.classification==='retirement-candidate'),safe=retirement.filter(x=>!x.blocking),blockingRetirement=retirement.filter(x=>x.blocking);
  return Object.freeze({schema:'ictc-retirement-frontier/v1',censusSource:legacy.censusSource,counts:legacy.counts,retirementCandidates:Object.freeze(retirement.map(x=>x.path).sort()),blockingRetirementCandidates:Object.freeze(blockingRetirement.map(x=>x.path).sort()),safeDeleteNow:Object.freeze(safe.map(x=>x.path).sort()),blockingUnclassified:Object.freeze((legacy.unknown||[]).map(x=>x.path).sort()),automaticDeletion:false,deletionRequiresDedicatedOracle:true});
}
export function deriveOperatorGuidance({topology,retirement,next}){
  const open=topology.nodes.filter(x=>x.state==='OPEN_REPOSITORY').map(x=>x.id),external=topology.nodes.filter(x=>x.state==='EXTERNAL_REQUIRED').map(x=>x.id),blocked=topology.blocked||retirement.blockingUnclassified.length>0,nextSlice=String(next?.slice||'STOP');
  return Object.freeze({schema:'ictc-operator-guidance/v1',audience:'non-technical-human',deterministic:true,state:blocked?'BLOCKED_DISCOVER_OWNER':String(next?.state||'READY'),technicalChoiceRequiredFromHuman:false,frameworkChoiceRequiredFromHuman:false,mutationBudgetChoiceRequiredFromHuman:false,maxHumanTechnicalChoices:0,askHumanOnlyFor:Object.freeze(['product-intent','material-acceptance','external-evidence-or-decision-when-required']),userRequest:open.length?'Nessuna scelta tecnica richiesta. Esprimi solo intento di prodotto o accettazione materiale; TRAMA deriva owner, slice, test e mutation tier.':'Solo eventuale decisione o evidenza esterna; nessuna scelta tecnica.',nextSlice,openRepositoryNodes:Object.freeze(open),externalNodes:Object.freeze(external),retirementCandidates:retirement.retirementCandidates.length,safeDeleteNow:retirement.safeDeleteNow.length,summary:open.length+' aree repository aperte; '+external.length+' rail esterni; '+retirement.retirementCandidates.length+' candidati retirement; '+retirement.safeDeleteNow.length+' eliminabili senza una slice dedicata; next '+nextSlice+'.'});
}
function entropySignature(material){return digest(JSON.stringify(material));}
export function selectStrategicCampaign({crossCutting=false,authority=false,enterprise=false,ui=false,docs=false,debtCount=0}={}){
  if(authority||enterprise||(crossCutting&&(ui||docs))||debtCount>=20)return Object.freeze({trials:10000000,tier:'10M',reason:'strategic-cross-abstraction-ratchet'});
  if(crossCutting||ui||docs||debtCount>=8)return Object.freeze({trials:1000000,tier:'1M',reason:'cross-owner-or-experience'});
  return Object.freeze({trials:100000,tier:'100k',reason:'bounded-as-is-repair'});
}
export function enterpriseExperience(root=DEFAULT_ROOT){
  const t=json(root,'v3/trama-enterprise-dod.json'),l=t.experienceLattice||[];
  return Object.freeze({levels:Object.freeze(l),levelCount:l.length,humans:Object.freeze([...new Set(l.map(x=>x.primaryHuman))]),externalRails:Object.freeze([...(t.externalRails||[])]),selfAttestable:false});
}
function canonicalNext(a){
  const p=a.planningState||{};
  if(p.nextConditionalSlice)return p.nextConditionalSlice;
  if(p.nextSerialSlice&&p.nextSerialState!=='blocked')return p.nextSerialSlice;
  return'STOP';
}
export function deriveAsIsConvergence(root=DEFAULT_ROOT,{exactHead=null}={}){
  const c=loadAsIsConvergenceContract(root),all=normalizeKnownDebt(root),active=all.filter(x=>!x.terminal),docs=documentationDrift(root),ui=uiEntropy(root),regressions=closedDebtRegressions(root),a=json(root,'docs/convergence/convergence-authority.json'),experience=enterpriseExperience(root),topology=deriveFalsificationTopology(root,all),retirement=deriveRetirementFrontier(root);
  let next={state:'READY',slice:canonicalNext(a),reason:'canonical convergence critical path'};
  if(regressions.length)next={state:'BLOCKED_REOPEN_WITH_EVIDENCE',slice:'GOV-ASIS-CONVERGENCE-1',reason:'closed debt regressed'};
  else if(topology.blocked||retirement.blockingUnclassified.length)next={state:'BLOCKED_DISCOVER_OWNER',slice:'GOV-ASIS-CONVERGENCE-1',reason:'active debt or legacy lacks deterministic classification'};
  else if(docs.length)next={state:'BLOCKED_RECONCILE_OWNER',slice:'GOV-ASIS-CONVERGENCE-1',reason:'current governance/documentation drift'};
  else if(ui.length)next={state:'BLOCKED_UI_ENTROPY',slice:'GOV-ASIS-CONVERGENCE-1',reason:'landing cognitive-order regression'};
  const campaign=selectStrategicCampaign({crossCutting:true,authority:true,enterprise:true,ui:true,docs:true,debtCount:active.length}),guidance=deriveOperatorGuidance({topology,retirement,next});
  const entropy={activeDebt:active.length,terminalDebt:all.length-active.length,documentationDrift:docs.length,uiEntropy:ui.length,closedDebtRegressions:regressions.length,topologyOpen:topology.nodes.filter(x=>x.state==='OPEN_REPOSITORY').length,topologyExternal:topology.nodes.filter(x=>x.state==='EXTERNAL_REQUIRED').length,retirementCandidates:retirement.retirementCandidates.length,signature:entropySignature({active:active.map(x=>[x.key,x.state,x.severity,x.target]),docs,ui,regressions,topology:topology.nodes.map(x=>[x.id,x.state,x.debtRefs]),retirement:[retirement.retirementCandidates,retirement.blockingUnclassified],next})};
  return Object.freeze({schema:'ictc-as-is-convergence/v2',contractId:c.contractId,authorityEffect:'NONE',projectionIsSot:false,writer:false,exactHead,knownDebt:Object.freeze(all),activeDebt:Object.freeze(active),documentationDrift:docs,uiEntropy:ui,closedDebtRegressions:regressions,entropy:Object.freeze(entropy),campaign,enterpriseExperience:experience,falsificationTopology:topology,retirementFrontier:retirement,operatorGuidance:guidance,next:Object.freeze(next),claimBoundary:c.claimBoundary});
}
if(import.meta.url==='file://'+process.argv[1])console.log(JSON.stringify(deriveAsIsConvergence(DEFAULT_ROOT,{exactHead:process.env.GITHUB_SHA||null}),null,2));
