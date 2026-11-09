import crypto from 'node:crypto';
import path from 'node:path';
import { link, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';

const SHA256_RE = /^[a-f0-9]{64}$/;
const SAFE_EXTENSION_RE = /^\.[a-z0-9]{1,12}$/;

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function safeExtension(value = '') {
  if (!value) return '';
  const normalized = String(value).toLowerCase();
  if (!SAFE_EXTENSION_RE.test(normalized)) throw new Error('Estensione blob non valida.');
  return normalized;
}

function ensureWithin(root, target) {
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Riferimento blob non valido.');
  }
  return target;
}

function normalizeLocator(locator, publicPrefix) {
  const value = String(locator || '').replaceAll('\\', '/');
  const prefix = `${publicPrefix.replace(/\/$/, '')}/`;
  if (!value.startsWith(prefix)) throw new Error('Riferimento blob fuori dal perimetro runtime.');
  const fileName = value.slice(prefix.length);
  if (!fileName || fileName.includes('/') || fileName.includes('..')) throw new Error('Riferimento blob non valido.');
  return fileName;
}

export function createBlobStore({ root, publicPrefix = 'runtime/blobs' }) {
  const absoluteRoot = path.resolve(root);

  async function putBytes(value, options = {}) {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
    const maxBytes = Number(options.maxBytes || 5_000_000);
    if (!bytes.length) throw new Error('Il contenuto blob è vuoto.');
    if (bytes.length > maxBytes) throw new Error(`Contenuto blob oltre ${maxBytes} byte.`);

    const extension = safeExtension(options.extension || '');
    const checksum = sha256(bytes);
    const fileName = `${checksum}${extension}`;
    const target = ensureWithin(absoluteRoot, path.join(absoluteRoot, fileName));
    const temporary = ensureWithin(absoluteRoot, path.join(absoluteRoot, `.${fileName}.${crypto.randomUUID()}.tmp`));

    await mkdir(absoluteRoot, { recursive: true });
    await writeFile(temporary, bytes, { flag: 'wx', mode: 0o600 });
    let created = true;
    try {
      await link(temporary, target);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      created = false;
    } finally {
      await rm(temporary, { force: true });
    }

    const stored = await stat(target);
    if (stored.size !== bytes.length) throw new Error('Dimensione blob non coerente dopo la scrittura.');

    return {
      checksum,
      digestAlgorithm: 'sha256',
      locator: `${publicPrefix.replace(/\/$/, '')}/${fileName}`,
      byteLength: bytes.length,
      mediaType: options.mediaType || 'application/octet-stream',
      created
    };
  }

  async function putText(value, options = {}) {
    const maximumCharacters = Number(options.maximumCharacters || 1_000_000);
    const text = String(value ?? '').replaceAll('\u0000', '').slice(0, maximumCharacters);
    if (!text.trim()) throw new Error('Il contenuto testuale è vuoto.');
    return putBytes(Buffer.from(text, 'utf8'), {
      extension: options.extension || '.txt',
      mediaType: options.mediaType || 'text/plain; charset=utf-8',
      maxBytes: options.maxBytes || 1_000_000
    });
  }

  async function read(locator) {
    const fileName = normalizeLocator(locator, publicPrefix);
    const target = ensureWithin(absoluteRoot, path.join(absoluteRoot, fileName));
    return readFile(target);
  }

  async function verify(locator, expectedChecksum = null) {
    const fileName = normalizeLocator(locator, publicPrefix);
    const checksumFromName = fileName.split('.')[0];
    if (!SHA256_RE.test(checksumFromName)) throw new Error('Nome blob privo di digest SHA-256 valido.');
    const bytes = await read(locator);
    const actualChecksum = sha256(bytes);
    const expected = expectedChecksum || checksumFromName;
    return {
      ok: actualChecksum === expected && checksumFromName === expected,
      checksum: actualChecksum,
      byteLength: bytes.length,
      locator
    };
  }

  return Object.freeze({ root: absoluteRoot, publicPrefix, putBytes, putText, read, verify });
}
