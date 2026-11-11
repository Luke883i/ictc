import path from 'node:path';
const NON_PRODUCTION_SUFFIX=/(?:-saturation(?:-[^.]+)?|-(?:check|audit|stress|model|frontier)(?:-[0-9][a-z0-9.-]*)?)\.mjs$/i;
const NON_PRODUCTION_EXACT=new Set(['semantic-closure-census.mjs','semantic-closure-dod.mjs','semantic-integrity-root-check.mjs','current-release-suite-check.mjs']);
export function isProductionSource(name){const normalized=String(name||'').replaceAll('\\','/'),base=path.posix.basename(normalized);if(!normalized.startsWith('src/'))return false;if(NON_PRODUCTION_SUFFIX.test(base)||NON_PRODUCTION_EXACT.has(base)||/^browser-/i.test(base))return false;return /\.(?:mjs|js)$/i.test(base);}
export function extractMutatingRoutePatterns(text=''){if(!/\bstore\.mutate\s*\(/.test(text))return[];const out=new Set(),patterns=[/pathname\s*===\s*['"]([^'"]+)['"]/g,/routeMatch\(\s*pathname\s*,\s*['"]([^'"]+)['"]/g];for(const pattern of patterns)for(const match of String(text).matchAll(pattern))if(String(match[1]).startsWith('/api/'))out.add(match[1]);return[...out].sort();}
export function duplicateRouteOwners(records=[]){const owners=new Map();for(const record of records||[])for(const route of record.routes||[]){if(!owners.has(route))owners.set(route,new Set());owners.get(route).add(record.file);}return[...owners.entries()].filter(([,files])=>files.size>1).map(([route,files])=>({route,files:[...files].sort()})).sort((a,b)=>a.route.localeCompare(b.route));}

/** Derived source-evidence reticulum. Neither a route table nor a write authority.
 * All claims are deliberately bounded to literal imports, observed canonical
 * procedure adapters, HTTP dispatch sources and known browser assets.
 */
export function deriveObservedConsumerWriterReticulum({adapters,handlerKeys,handlerPlan,sourceByPath,witnesses,trackedPaths=Object.keys(sourceByPath)}){
 const paths=new Set(trackedPaths),edges=[],unresolved=[],dynamic=[],writers=[];
 const imports=/(?:^|[;\n])\s*(?:import\s+(?:[^;\n]*?\s+from\s*)?|export\s+(?:\*|\{[^}\n]*\})\s+from\s*)['"]([^'"\n]+)['"]/gm;
 const lazy=/\bimport\(\s*(['"])([^'"\n]+)\1\s*\)/g;
 const resolve=(from,spec,kind)=>{
  if(!spec.startsWith('.'))return;
  const target=path.posix.normalize(path.posix.join(path.posix.dirname(from),spec));
  const resolved=[target,`${target}.mjs`,`${target}.js`,`${target}/index.mjs`,`${target}/index.js`].find(p=>paths.has(p));
  if(resolved)edges.push({from,to:resolved,kind});
  else unresolved.push({from,spec,target,kind});
 };
 for(const [file,body] of Object.entries(sourceByPath).sort(([a],[b])=>a.localeCompare(b))){
  if(file.startsWith('public/')&&file.endsWith('.html')){
   for(const m of body.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)\s*=\s*['"]([^'"]+)['"]/g)){
    const ref=m[1].split(/[?#]/)[0];if(ref&&!/^(?:https?:|data:|\/\/|#)/.test(ref))resolve(file,ref.startsWith('/')?'.'+ref:ref,'html-asset-literal');
   }
  }
  if(file.startsWith('public/')&&file.endsWith('.css')){
   for(const m of body.matchAll(/@import\s+(?:url\(\s*)?['"]([^'"]+)['"]/g)){
    if(!/^(?:https?:|data:|\/\/)/.test(m[1]))resolve(file,m[1],'css-import-literal');
   }
  }
  if(file.startsWith('.github/workflows/')&&/\.ya?ml$/.test(file)){
   for(const m of body.matchAll(/\b(?:node|python3?|bash)\s+(?:-[^\s]+\s+)*((?:src|tests|scripts)\/[A-Za-z0-9_./-]+\.(?:mjs|js|py|sh))/g)){
    if(paths.has(m[1]))edges.push({from:file,to:m[1],kind:'workflow-executable-literal'});
   }
  }
  if(!/\.(?:mjs|js)$/i.test(file))continue;
  for(const m of body.matchAll(imports))resolve(file,m[1],'esm-static');
  for(const m of body.matchAll(lazy))resolve(file,m[2],'esm-lazy-literal');
  for(const m of body.matchAll(/\bnew\s+URL\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*,\s*import\.meta\.url/g))if(/\.[A-Za-z0-9]+$/.test(m[1]))resolve(file,m[1],'import-meta-asset-literal');
  if(/\bimport\(\s*(?!['"])/.test(body)||/\breaddir(?:Sync)?\s*\(/.test(body)||/\bglob\s*\(/.test(body)||/\bnew\s+URL\s*\(/.test(body)||/\b(?:readFile|readFileSync)\s*\(/.test(body))dynamic.push(file);
  if(file.startsWith('src/')&&(/\bstore\.mutate(?:Decided|Proposed|Attested)?\s*\(/.test(body)||/\bstore\.persistence\.[A-Za-z]+\s*\(/.test(body)))writers.push(file);
 }
 const map=new Map(adapters.map(a=>[a.id,a]));
 const planSet=new Set(handlerPlan);
 const failures=[];
 if(map.size!==7||adapters.length!==7)failures.push('seven canonical adapters required');
 if(new Set(handlerPlan).size!==handlerPlan.length)failures.push('duplicate runtime handler in plan');
 for(const a of adapters){if(!handlerKeys[a.id]?.length)failures.push('missing handler keys: '+a.id);
  for(const k of handlerKeys[a.id]||[])if(!planSet.has(k))failures.push(`unregistered handler ${a.id}:${k}`);}
 const server=sourceByPath['src/server.mjs']||'';
 if(!server.includes('createRuntimeHandlers(')||!server.includes('for(const handler of handlers)if(await handler(request,response,pathname,actor))return'))failures.push('HTTP dispatch spine missing');
 for(const owner of ['src/store.mjs','src/sqlite-state-persistence.mjs','src/runtime/procedure-adapters.mjs','src/runtime/runtime-handler-registry.mjs'])if(!paths.has(owner))failures.push('missing canonical software owner '+owner);
 const observed=[];
 for(const w of witnesses){
  const adapter=map.get(w.id),body=sourceByPath[w.owner]||'',clientPaths=Object.keys(sourceByPath).filter(p=>p.startsWith('public/')&&/\.(?:mjs|js)$/.test(p)&&sourceByPath[p].includes(w.route));
  if(!adapter||!adapter.writeRoutes.some(r=>w.route===r||w.route.startsWith(r+'/')))failures.push('undeclared procedure route '+w.id+':'+w.route);
  if(!body.includes(`'${w.route}'`)&&!body.includes(`"${w.route}"`))failures.push('route literal missing from runtime owner '+w.owner+':'+w.route);
  if(!/\bstore\.mutate(?:Decided|Proposed|Attested)?\s*\(/.test(body))failures.push('missing audited mutation in '+w.owner);
  if(!clientPaths.length)failures.push('no literal client consumer for '+w.route);
  const collision=Object.entries(sourceByPath).filter(([p,s])=>p.startsWith('src/runtime/')&&p!==w.owner&&s.includes(w.route)&&/\bstore\.mutate(?:Decided|Proposed|Attested)?\s*\(/.test(s)).map(([p])=>p);
  observed.push({...w,clientCandidates:clientPaths,otherWriterCandidates:collision,writerCollisionStatus:collision.length?'DISPATCH_PRECEDENCE_TO_BE_QUALIFIED':'NO_LITERAL_COLLISION'});
 }
 if(unresolved.length)failures.push('unresolved relative ESM source imports: '+unresolved.slice(0,8).map(e=>e.from+'>'+e.spec).join(','));
 return {schema:'ictc-observed-consumer-writer-reticulum/v1',authority:'NONE_DERIVED',
  source:'Git tracked source/HTML/CSS/workflow literals + canonical procedure adapters + current handler plan',
  pathsScanned:Object.keys(sourceByPath).length,trackedPaths:paths.size,staticEdges:edges.length,unresolved,observedDynamicSources:dynamic.length,
  dynamicExamples:dynamic.slice(0,12),writerCandidateFiles:writers.length,procedures:observed,
  witnesses:observed.length,failures,
  browserProof:'REQUIRED_SEPARATELY',runtimeReceiptProof:'REQUIRED_SEPARATELY',
  externalConsumers:'UNKNOWN_HOLD',automaticMoveOrDeleteAuthorized:false,
  claimBoundary:'Complete observed literal source graph within scanned modules and seven route witnesses; NOT total dynamic/HTTP/external reachability or unique dispatch proof. Runtime and native browser must each supply independent receipts.'};
}
