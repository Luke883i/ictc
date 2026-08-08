import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(process.env.ICTC_API_CONTRACT_ROOT || path.join(here, '..'));
const openapiPath = path.join(repoRoot, 'docs', 'openapi.yaml');
const serverPath = path.join(repoRoot, 'v3', 'server.mjs');
const artifactPath = path.join(repoRoot, 'artifacts', 'api-contract.json');

const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']);
const normalizePath = value => value.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
const keyFor = (method, pathname) => `${method.toUpperCase()} ${normalizePath(pathname)}`;

function methodsFrom(text) {
  return [...text.matchAll(/\bmethod\s*===\s*['"]([A-Z]+)['"]/g)]
    .map(match => match[1])
    .filter(method => HTTP_METHODS.has(method));
}

export function extractMountedRuntimeImports(serverSource) {
  const imports = new Set();
  for (const match of serverSource.matchAll(/from\s+['"]\.\/runtime\/([^'"]+\.mjs)['"]/g)) imports.add(`v3/runtime/${match[1]}`);
  return [...imports].sort();
}

export function extractRuntimeRoutes(source, file = 'runtime') {
  const routes = new Map();
  const add = (method, pathname, evidence) => {
    const key = keyFor(method, pathname);
    if (!routes.has(key)) routes.set(key, { method, path: normalizePath(pathname), evidence: [] });
    routes.get(key).evidence.push({ file, ...evidence });
  };
  const getOnlyGuard = /request\.method\s*\|\|\s*['"]GET['"]\s*\)\s*!==\s*['"]GET['"]/.test(source)
    || /\(request\.method\s*\|\|\s*['"]GET['"]\)\s*!==\s*['"]GET['"]/.test(source);

  for (const match of source.matchAll(/\bpathname\s*===\s*(['"])(\/api\/[^'"]+)\1/g)) {
    const ifIndex = source.lastIndexOf('if', match.index);
    const context = source.slice(Math.max(0, ifIndex), match.index + match[0].length);
    const methods = methodsFrom(context);
    if (methods.length) for (const method of methods) add(method, match[2], { kind: 'direct' });
    else if (getOnlyGuard) add('GET', match[2], { kind: 'guarded-get' });
  }

  const routeMatchRegex = /routeMatch\(pathname,\s*(['"])(\/api\/[^'"]+)\1\)/g;
  for (const match of source.matchAll(routeMatchRegex)) {
    const after = match.index + match[0].length;
    const nextRoute = source.indexOf('routeMatch(pathname', after);
    const segment = source.slice(after, nextRoute === -1 ? Math.min(source.length, after + 800) : nextRoute);
    const ifIndex = segment.indexOf('if');
    const braceIndex = ifIndex === -1 ? -1 : segment.indexOf('{', ifIndex);
    const condition = ifIndex === -1 ? '' : segment.slice(ifIndex, braceIndex === -1 ? Math.min(segment.length, ifIndex + 400) : braceIndex);
    if (!condition.includes('params')) continue;
    for (const method of methodsFrom(condition)) add(method, match[2], { kind: 'route-match' });
  }

  for (const match of source.matchAll(/declareApiRoute\(\s*['"]([A-Z]+)['"]\s*,\s*['"](\/api\/[^'"]+)['"]\s*\)/g)) {
    if (HTTP_METHODS.has(match[1])) add(match[1], match[2], { kind: 'declared-regex-route' });
  }
  return routes;
}

export function extractOpenApiRoutes(source) {
  const routes = new Map(); let currentPath = null;
  for (const line of source.split(/\r?\n/)) {
    const pathMatch = line.match(/^  (\/api\/[^:]+):\s*$/);
    if (pathMatch) { currentPath = pathMatch[1]; continue; }
    const methodMatch = currentPath && line.match(/^    (get|post|put|patch|delete|options|head):\s*$/);
    if (methodMatch) { const method = methodMatch[1].toUpperCase(); routes.set(keyFor(method, currentPath), { method, path: currentPath }); continue; }
    if (/^  \S/.test(line) && !line.startsWith('  /api/')) currentPath = null;
  }
  return routes;
}

export function compareRouteSets(runtimeRoutes, openApiRoutes, openapiText = '') {
  const runtimeKeys = new Set(runtimeRoutes.keys()); const openapiKeys = new Set(openApiRoutes.keys());
  const missingFromOpenApi = [...runtimeKeys].filter(key => !openapiKeys.has(key)).sort();
  const extraInOpenApi = [...openapiKeys].filter(key => !runtimeKeys.has(key)).sort();
  const staleClaims = [];
  if (/append-only\s+(events|state)/i.test(openapiText)) staleClaims.push('append-only canonical-state/event reconstruction claim');
  if (/rebuild\s+domain\s+state.*seed/i.test(openapiText)) staleClaims.push('rebuild-from-seed canonical-state claim');
  return { missingFromOpenApi, extraInOpenApi, staleClaims };
}

async function collectRuntimeRoutes() {
  const serverSource = await readFile(serverPath, 'utf8');
  const files = [{ path: serverPath, source: serverSource }, ...await Promise.all(extractMountedRuntimeImports(serverSource).map(async relative => ({ path: path.join(repoRoot, relative), source: await readFile(path.join(repoRoot, relative), 'utf8') }))];
  const combined = new Map();
  for (const file of files) {
    const relative = path.relative(repoRoot, file.path);
    for (const [key, route] of extractRuntimeRoutes(file.source, relative)) {
      if (!combined.has(key)) combined.set(key, { ...route, evidence: [] });
      combined.get(key).evidence.push(...route.evidence);
    }
  }
  return { routes: combined, mountedFiles: files.map(file => path.relative(repoRoot, file.path)).sort() };
}

async function runSelfTest() {
  const direct = extractRuntimeRoutes("const method=request.method||'GET';if(method==='GET'&&pathname==='/api/health'){}", 'direct.mjs');
  if (!direct.has('GET /api/health')) throw new Error('self-test direct route extraction failed');
  const routed = extractRuntimeRoutes("let params=routeMatch(pathname,'/api/incidents/:id/formulation');if((method==='POST'||method==='PUT')&&params){}", 'route.mjs');
  if (!routed.has('POST /api/incidents/{id}/formulation') || !routed.has('PUT /api/incidents/{id}/formulation')) throw new Error('self-test routeMatch extraction failed');
  const guarded = extractRuntimeRoutes("if((request.method||'GET')!=='GET')return false;if(pathname==='/api/workbench/meta'){}", 'guarded.mjs');
  if (!guarded.has('GET /api/workbench/meta')) throw new Error('self-test guarded GET extraction failed');
  const declared = extractRuntimeRoutes("declareApiRoute('GET','/api/evidence/:type/:id.zip');", 'declared.mjs');
  if (!declared.has('GET /api/evidence/{type}/{id}.zip')) throw new Error('self-test declared regex route extraction failed');
  const mounted = extractMountedRuntimeImports("import { createA } from './runtime/a.mjs'; import { helper } from './runtime/http.mjs'; const handlers=[createA()];");
  if (mounted.join(',') !== 'v3/runtime/a.mjs,v3/runtime/http.mjs') throw new Error('self-test mounted authority failed');
  const openapi = extractOpenApiRoutes("paths:\n  /api/health:\n    get:\n      responses: {}\n  /api/items/{id}:\n    post:\n      responses: {}\n");
  if (!openapi.has('GET /api/health') || !openapi.has('POST /api/items/{id}')) throw new Error('self-test OpenAPI extraction failed');
  const mismatch = compareRouteSets(direct, openapi, 'append-only events');
  if (!mismatch.extraInOpenApi.length || mismatch.staleClaims.length !== 1) throw new Error('self-test mismatch detection failed');
  console.log('api-contract-check: self-test ok (mounted authority, direct, routeMatch, declared regex, guarded GET, OpenAPI, mismatch)');
}

async function runContractCheck() {
  const openapiText = await readFile(openapiPath, 'utf8'); const runtime = await collectRuntimeRoutes(); const openApiRoutes = extractOpenApiRoutes(openapiText); const comparison = compareRouteSets(runtime.routes, openApiRoutes, openapiText);
  const report = { schemaVersion: '1.1.0', result: comparison.missingFromOpenApi.length || comparison.extraInOpenApi.length || comparison.staleClaims.length ? 'failed' : 'passed', runtimeRouteCount: runtime.routes.size, openApiRouteCount: openApiRoutes.size, mountedRuntimeFiles: runtime.mountedFiles, runtimeRoutes: [...runtime.routes.keys()].sort(), openApiRoutes: [...openApiRoutes.keys()].sort(), ...comparison, boundary: 'Executable check binds the method/path surface mounted by v3/server.mjs and its direct runtime imports. Regex routes require an explicit co-located declareApiRoute declaration. The check rejects known stale canonical-state claims but does not prove full payload schema equivalence, authorization correctness, or semantic compatibility.' };
  await mkdir(path.dirname(artifactPath), { recursive: true }); await writeFile(artifactPath, JSON.stringify(report, null, 2));
  if (report.result !== 'passed') { const diagnostic = [report.missingFromOpenApi.length ? `missing=${report.missingFromOpenApi.join(',')}` : '',report.extraInOpenApi.length ? `extra=${report.extraInOpenApi.join(',')}` : '',report.staleClaims.length ? `stale=${report.staleClaims.join(',')}` : ''].filter(Boolean).join(' | ');console.error(`::error title=API contract drift::${diagnostic}`);console.error(JSON.stringify(report, null, 2));process.exitCode=1;return; }
  console.log(`api-contract-check: ok (runtime=${runtime.routes.size}, openapi=${openApiRoutes.size}, exact mounted method/path surface)`);
}
if (process.argv.includes('--self-test')) await runSelfTest(); else await runContractCheck();
