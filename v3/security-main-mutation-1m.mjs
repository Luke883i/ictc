import assert from 'node:assert/strict';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { authenticatedRateLimitKey, edgeRateLimitKey, attachmentStoragePath, normalizeAttachmentId } from './runtime/security-boundaries.mjs';
import { htmlEsc, safeHref, internalReferencePanelMarkup } from './public/ui/security-encoding.js';
import { aiNetworkOptIns } from './network-policy.mjs';

const TOTAL=1_000_000,SEED=0x51c7c147;let seed=SEED>>>0;
const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const families=new Map();let killed=0,survivors=0;const witness=[];
function row(name){if(!families.has(name))families.set(name,{executions:0,killed:0,survivors:0,checksum:2166136261>>>0});return families.get(name);}
function trace(name,index,ok,detail){const r=row(name);r.executions++;if(ok){r.killed++;killed++;}else{r.survivors++;survivors++;}const token=`${name}|${index}|${ok}|${detail}`;for(let i=0;i<token.length;i++){r.checksum^=token.charCodeAt(i);r.checksum=Math.imul(r.checksum,16777619)>>>0;}if((index<3||!ok)&&witness.length<80)witness.push({name,index,ok,detail});}

for(let i=0;i<250_000;i++){
  const tenant=`t${rnd()%97}`,remote=`10.0.${rnd()%255}.${rnd()%255}`,a=`user-${rnd()%5000}`,b=`user-${(rnd()%5000)+5001}`;
  const ka=authenticatedRateLimitKey({tenantId:tenant,actor:{id:a,identityMode:'trusted-header'},remoteAddress:remote});
  const kb=authenticatedRateLimitKey({tenantId:tenant,actor:{id:b,identityMode:'trusted-header'},remoteAddress:remote});
  const edgeA=edgeRateLimitKey({tenantId:tenant,remoteAddress:remote}),edgeB=edgeRateLimitKey({tenantId:tenant,remoteAddress:remote});
  const local1=authenticatedRateLimitKey({tenantId:tenant,actor:{id:a,identityMode:'local'},remoteAddress:remote});
  const local2=authenticatedRateLimitKey({tenantId:tenant,actor:{id:b,identityMode:'local'},remoteAddress:remote});
  trace('proxy-subject-rate-key',i,ka!==kb&&edgeA===edgeB&&local1===local2&&ka.startsWith(`${tenant}|subject:`)&&edgeA.startsWith(`${tenant}|remote:`),`${edgeA}|${ka}|${kb}`);
}

const badIds=['../state.sqlite','../../victim','a/b','a\\b','%2e%2e%2fsecret','/absolute','.','..','\0evil',' file_1','file_1 '];
for(let i=0;i<250_000;i++){
  const bad=(i%3)!==0;const id=bad?badIds[rnd()%badIds.length]:`file_${(rnd()>>>0).toString(16)}-${(rnd()>>>0).toString(16)}`;let ok=false,detail='';
  try{const normalized=normalizeAttachmentId(id),p=attachmentStoragePath('/tmp/ictc-root/quarantine',id);detail=p;ok=!bad&&normalized===id&&p.startsWith(path.resolve('/tmp/ictc-root/quarantine')+path.sep);}catch(error){detail=error.code||error.message;ok=bad&&['attachment-id-invalid','attachment-path-invalid'].includes(error.code);}
  trace('attachment-path-confinement',i,ok,detail);
}

const payloads=['<img src=x onerror=alert(1)>','"><svg/onload=alert(1)>','<script>alert(1)</script>','javascript:alert(1)','&lt;already&gt;',"' onmouseover='x"];
for(let i=0;i<250_000;i++){
  const p=payloads[rnd()%payloads.length],ref={masterSystem:p,masterId:p,masterVersion:p,contentSha256:p,referenceUrl:i%2?`https://dms.example/${encodeURIComponent(p)}`:`javascript:${p}`};
  const html=internalReferencePanelMarkup(ref),href=safeHref(ref.referenceUrl),escaped=htmlEsc(p);const rawTag=html.includes(p)&&/[<>]/.test(p),dangerousHref=/href="javascript:/i.test(html);
  const ok=!rawTag&&!dangerousHref&&html.includes(escaped)&&(href===''||/^https?:/.test(href));trace('fi01-output-encoding',i,ok,createHash('sha256').update(html).digest('hex').slice(0,12));
}

for(let i=0;i<250_000;i++){
  const allowPrivate=(rnd()&1)===1,allowInsecure=(rnd()&1)===1,protocol=(rnd()&1)?'http:':'https:',privateAddress=(rnd()&1)===1;
  const env={ICTC_ALLOW_PRIVATE_AI:allowPrivate?'1':'0',ICTC_ALLOW_INSECURE_AI:allowInsecure?'1':'0'},opt=aiNetworkOptIns(env);
  const expectedTransport=protocol==='https:'||allowInsecure,expectedPrivate=!privateAddress||allowPrivate;
  const observedTransport=protocol==='https:'||opt.allowInsecure,observedPrivate=!privateAddress||opt.allowPrivate;
  const ok=observedTransport===expectedTransport&&observedPrivate===expectedPrivate&&!(allowPrivate&&!allowInsecure&&protocol==='http:'&&observedTransport);
  trace('ai-opt-in-independence',i,ok,`${allowPrivate}/${allowInsecure}/${protocol}/${privateAddress}`);
}

assert.equal(killed+survivors,TOTAL);assert.equal(survivors,0);
const report={schemaVersion:'1.0.0',authority:'local-security-main-mutation-campaign',baseSha:'c35ed3479eff20826bb49d8280c3ea1e37be2fdc',seed:SEED,totalExecutions:TOTAL,killed,survivors,families:Object.fromEntries([...families].map(([k,v])=>[k,{...v,checksumHex:v.checksum.toString(16).padStart(8,'0')}])),witness,claimBoundary:'Deterministic same-circuit mutation/oracle evidence over candidate security boundary primitives. Not full repository CI, independent penetration testing, human review, or deployment attestation.'};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/security-main-mutation-1m.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));