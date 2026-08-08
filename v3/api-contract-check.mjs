import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(process.env.ICTC_API_CONTRACT_ROOT || path.join(here, '..'));
const openapiPath = path.join(repoRoot, 'docs', 'openapi.yaml');
const runtimeDir = path.join(repoRoot, 'v3', 'runtime');
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
    if (methods.length) {
      for (const method of methods) add(method, match[2], { kind: 'direct' });
    } else if (getOnlyGuard) {
      add('GET', match[2], { kind: 'guarded-get' });
    }
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
  return routes;
}

export function extractOpenApiRoutes(source) {
  const routes = new Map();
  let currentPath = null;
  for (const line of source.split(/\r?\n/)) {
    const pathMatch = line.match(/^  (\/api\/[^:]+):\s*$/);
    if (pathMatch) {
      currentPath = pathMatch[1];
      continue;
    }
    const methodMatch = currentPath && line.match(/^    (get|post|put|patch|delete|options|head):\s*$/);
    if (methodMatch) {
      const method = methodMatch[1].toUpperCase();
      routes.set(keyFor(method, currentPath), { method, path: currentPath });
      continue;
    }
    if (/^  \S/.test(line) && !line.startsWith('  /api/')) currentPath = null;
  }
  return routes;
}

export function compareRouteSets(runtimeRoutes, openApiRoutes, openapiText = '') {
  const runtimeKeys = new Set(runtimeRoutes.keys());
  const openapiKeys = new Set(openApiRoutes.keys());
  const missingFromOpenApi = [...runtimeKeys].filter(key => !openapiKeys.has(key)).sort();
  const extraInOpenApi = [...openapiKeys].filter(key => !runtimeKeys.has(key)).sort();
  const staleClaims = [];
  if (/append-only\s+(events|state)/i.test(openapiText)) staleClaims.push('append-only canonical-state/event reconstruction claim');
  if (/rebuild\s+domain\s+state.*seed/i.test(openapiText)) staleClaims.push('rebuild-from-seed canonical-state claim');
  return { missingFromOpenApi, extraInOpenApi, staleClaims };
}

async function collectRuntimeRoutes() {
  const files = [serverPath];
  for (const entry of await readdir(runtimeDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.mjs')) files.push(path.join(runtimeDir, entry.name));
  }
  const combined = new Map();
  for (const file of files.sort()) {
    const source = await readFile(file, 'utf8');
    const relative = path.relative(repoRoot, file);
    for (const [key, route] of extractRuntimeRoutes(source, relative)) {
      if (!combined.has(key)) combined.set(key, { ...route, evidence: [] });
      combined.get(key).evidence.push(...route.evidence);
    }
  }
  return combined;
}

async function runSelfTest() {
  const direct = extractRuntimeRoutes("const method=request.method||'GET';if(method==='GET'&&pathname==='/api/health'){}", 'direct.mjs');
  if (!direct.has('GET /api/health')) throw new Error('self-test direct route extraction failed');
  const routed = extractRuntimeRoutes("let params=routeMatch(pathname,'/api/incidents/:id/formulation');if((method==='POST'||method==='PUT')&&params){}", 'route.mjs');
  if (!routed.has('POST /api/incidents/{id}/formulation') || !routed.has('PUT /api/incidents/{id}/formulation')) throw new Error('self-test routeMatch extraction failed');
  const guarded = extractRuntimeRoutes("if((request.method||'GET')!=='GET')return false;if(pathname==='/api/workbench/meta'){}", 'guarded.mjs');
  if (!guarded.has('GET /api/workbench/meta')) throw new Error('self-test guarded GET extraction failed');
  const openapi = extractOpenApiRoutes("paths:\n  /api/health:\n    get:\n      responses: {}\n  /api/items/{id}:\n    post:\n      responses: {}\n");
  if (!openapi.has('GET /api/health') || !openapi.has('POST /api/items/{id}')) throw new Error('self-test OpenAPI extraction failed');
  const mismatch = compareRouteSets(direct, openapi, 'append-only events');
  if (!mismatch.extraInOpenApi.length || mismatch.staleClaims.length !== 1) throw new Error('self-test mismatch detection failed');
  console.log('api-contract-check: self-test ok (direct, routeMatch, guarded GET, OpenAPI, mismatch)');
}

async function runContractCheck() {
  const openapiText = await readFile(openapiPath, 'utf8');
  const runtimeRoutes = await collectRuntimeRoutes();
  const openApiRoutes = extractOpenApiRoutes(openapiText);
  const comparison = compareRouteSets(runtimeRoutes, openApiRoutes, openapiText);
  const report = {
    schemaVersion: '1.0.0',
    result: comparison.missingFromOpenApi.length || comparison.extraInOpenApi.length || comparison.staleClaims.length ? 'failed' : 'passed',
    runtimeRouteCount: runtimeRoutes.size,
    openApiRouteCount: openApiRoutes.size,
    runtimeRoutes: [...runtimeRoutes.keys()].sort(),
    openApiRoutes: [...openApiRoutes.keys()].sort(),
    ...comparison,
    boundary: 'Executable check binds the current method/path surface and rejects known stale canonical-state claims. It does not prove full request/response schema equivalence, authorization correctness, or semantic compatibility of payload fields.'
  };
  await mkdir(path.dirname(artifactPath), { recursive: true });
  await writeFile(artifactPath, JSON.stringify(report, null, 2));
  if (report.result !== 'passed') {
    const diagnostic = [
      report.missingFromOpenApi.length ? `missing=${report.missingFromOpenApi.join(',')}` : '',
      report.extraInOpenApi.length ? `extra=${report.extraInOpenApi.join(',')}` : '',
      report.staleClaims.length ? `stale=${report.staleClaims.join(',')}` : ''
    ].filter(Boolean).join(' | ');
    console.error(`::error title=API contract drift::${diagnostic}`);
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(`api-contract-check: ok (runtime=${runtimeRoutes.size}, openapi=${openApiRoutes.size}, exact method/path surface)`);
}

if (process.argv.includes('--self-test')) await runSelfTest();
else await runContractCheck();
