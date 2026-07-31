import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { readFile, mkdtemp, mkdir, writeFile, stat } from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname),fixtureDir=path.join(root,'v3/blob-fixtures'),manifest=JSON.parse(await readFile(path.join(fixtureDir,'manifest.json'),'utf8')),bytes=await readFile(path.join(fixtureDir,manifest.file)),hash=createHash('sha256').update(bytes).digest('hex');
assert.equal(hash,manifest.sha256);assert.equal(bytes.length,manifest.bytes);assert.ok(!manifest.file.includes('..')&&path.basename(manifest.file)===manifest.file);
const temp=await mkdtemp(path.join(os.tmpdir(),'ictc-blob-audit-')),store=path.join(temp,'blobs');await mkdir(store,{recursive:true});const target=path.join(store,hash);await writeFile(target,bytes);const readback=await readFile(target);assert.equal(createHash('sha256').update(readback).digest('hex'),hash);assert.equal((await stat(target)).size,bytes.length);console.log(`blob-audit: ok (${bytes.length} bytes, sha256=${hash.slice(0,12)}...)`);
