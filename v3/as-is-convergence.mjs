import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

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
  const c=loadAsIsConvergenceContract(root),g=json(root,'v3/gaps.json'),r=json(root,'audit/remediation-registry.json'),a=json(root,'docs/convergence/convergence-authority.json');
  return Object.freeze([
    ...(g.gaps||[]).map(x=>normalizeGap(x,c)),
    ...((r.findings||r.items)||[]).map(x=>normalizeFinding(x,c)),
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
  const c=loadAsIsConvergenceContract(root),all=normalizeKnownDebt(root),active=all.filter(x=>!x.terminal),docs=documentationDrift(root),ui=uiEntropy(root),regressions=closedDebtRegressions(root),a=json(root,'docs/convergence/convergence-authority.json'),experience=enterpriseExperience(root);
  let next={state:'READY',slice:canonicalNext(a),reason:'canonical convergence critical path'};
  if(regressions.length)next={state:'BLOCKED_REOPEN_WITH_EVIDENCE',slice:'GOV-ASIS-CONVERGENCE-1',reason:'closed debt regressed'};
  else if(docs.length)next={state:'BLOCKED_RECONCILE_OWNER',slice:'GOV-ASIS-CONVERGENCE-1',reason:'current governance/documentation drift'};
  else if(ui.length)next={state:'BLOCKED_UI_ENTROPY',slice:'GOV-ASIS-CONVERGENCE-1',reason:'landing cognitive-order regression'};
  const campaign=selectStrategicCampaign({crossCutting:true,authority:true,enterprise:true,ui:true,docs:true,debtCount:active.length});
  const entropy={activeDebt:active.length,terminalDebt:all.length-active.length,documentationDrift:docs.length,uiEntropy:ui.length,closedDebtRegressions:regressions.length,signature:entropySignature({active:active.map(x=>[x.key,x.state,x.severity,x.target]),docs,ui,regressions,next})};
  return Object.freeze({schema:'ictc-as-is-convergence/v1',contractId:c.contractId,authorityEffect:'NONE',projectionIsSot:false,writer:false,exactHead,knownDebt:Object.freeze(all),activeDebt:Object.freeze(active),documentationDrift:docs,uiEntropy:ui,closedDebtRegressions:regressions,entropy:Object.freeze(entropy),campaign,enterpriseExperience:experience,next:Object.freeze(next),claimBoundary:c.claimBoundary});
}
if(import.meta.url==='file://'+process.argv[1])console.log(JSON.stringify(deriveAsIsConvergence(DEFAULT_ROOT,{exactHead:process.env.GITHUB_SHA||null}),null,2));
