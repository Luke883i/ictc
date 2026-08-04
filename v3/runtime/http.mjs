import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { ROLES, asString, safeFilename } from '../domain.mjs';

export function httpError(status, message, code = 'request-failed', details = null) {
  return Object.assign(new Error(message), { status, code, details });
}

export function actorFrom(request, permissions) {
  const identityMode = process.env.ICTC_IDENTITY_MODE === 'trusted-header' ? 'trusted-header' : 'local';
  const roleHeader = asString(request.headers['x-ictc-role'], 20).toLowerCase();
  if (identityMode === 'trusted-header' && !roleHeader) throw httpError(401, 'Identità non disponibile', 'identity-required');
  const role = ROLES.includes(roleHeader) ? roleHeader : 'user';
  const actorId = asString(request.headers['x-ictc-actor-id'], 160) || `local-${role}`;
  return { id: actorId, role, identityMode, permissions: [...permissions[role]] };
}

export function requirePermission(actor, permission, permissions) {
  if (!permissions[actor.role]?.has(permission)) throw httpError(403, 'Operazione non consentita', 'forbidden');
}

export function commandFrom(request) {
  const rawRevision = request.headers['x-ictc-expected-revision'];
  return {
    id: asString(request.headers['x-ictc-command-id'], 200),
    expectedRevision: rawRevision == null || rawRevision === '' ? null : Number(rawRevision),
    metadata: { userAgent: asString(request.headers['user-agent'], 500) }
  };
}

export function json(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store'
  });
  response.end(payload);
}

export async function bodyJson(request, limit = 8_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw httpError(413, 'Richiesta troppo grande', 'payload-too-large');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw httpError(400, 'JSON non valido', 'invalid-json'); }
}

export function routeMatch(pathname, pattern) {
  const keys = [];
  const regex = new RegExp(`^${pattern.replace(/:[A-Za-z0-9_]+/g, value => {
    keys.push(value.slice(1));
    return '([^/]+)';
  })}$`);
  const found = pathname.match(regex);
  return found ? Object.fromEntries(keys.map((key, index) => [key, decodeURIComponent(found[index + 1])])) : null;
}

export async function serveStatic(response, pathname, publicRoot, mime) {
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(publicRoot, relative);
  const root = path.resolve(publicRoot);
  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== path.join(root, 'index.html')) {
    throw httpError(403, 'Percorso non consentito', 'forbidden');
  }
  try {
    if (!(await stat(filePath)).isFile()) throw new Error('not-file');
    const content = await readFile(filePath);
    response.writeHead(200, {
      'content-type': mime.get(path.extname(filePath)) || 'application/octet-stream',
      'content-length': content.length,
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff'
    });
    response.end(content);
  } catch {
    throw httpError(404, 'Risorsa non trovata', 'not-found');
  }
}

export function sendEvidence(response, bundle, type, idValue) {
  response.writeHead(200, {
    'content-type': 'application/json; charset=utf-8',
    'content-disposition': `attachment; filename="ictc-${safeFilename(type)}-${safeFilename(idValue)}.json"`,
    'cache-control': 'no-store'
  });
  response.end(JSON.stringify(bundle, null, 2));
}
