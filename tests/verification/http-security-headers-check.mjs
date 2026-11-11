import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, symlink, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { json, securityHeaders, serveStatic } from '../../src/runtime/http.mjs';
const required=['content-security-policy','x-frame-options','x-content-type-options','referrer-policy','permissions-policy','cross-origin-opener-policy','cross-origin-resource-policy'];const headers=securityHeaders();for(const key of required)assert.ok(headers[key],`missing ${key}`);assert.ok(headers['content-security-policy'].includes("frame-ancestors 'none'"));assert.ok(headers['content-security-policy'].includes("object-src 'none'"));let captured=null;const response={writeHead(status,h){captured={status,headers:h};},end(){}};json(response,200,{ok:true});assert.equal(captured.status,200);for(const key of required)assert.ok(captured.headers[key],`json missing ${key}`);const root=await mkdtemp(path.join(os.tmpdir(),'ictc-http-'));try{await writeFile(path.join(root,'index.html'),'<h1>ICTC</h1>');captured=null;await serveStatic(response,'/',root,new Map([['.html','text/html; charset=utf-8']]));assert.equal(captured.status,200);for(const key of required)assert.ok(captured.headers[key],`static missing ${key}`);assert.equal(captured.headers['cache-control'],'no-cache');  // OWASP-style file containment: a lexical path may still resolve outside publicRoot.
  const privateRoot=await mkdtemp(path.join(os.tmpdir(),'ictc-static-secret-'));
  try{
    await writeFile(path.join(privateRoot,'secret.txt'),'private-canary');
    await symlink(path.join(privateRoot,'secret.txt'),path.join(root,'link.txt'));
    await mkdir(path.join(root,'nested'));
    await symlink(privateRoot,path.join(root,'nested','linked-dir'));
    for(const candidate of ['/link.txt','/nested/linked-dir/secret.txt']){
      captured=null;
      await assert.rejects(()=>serveStatic(response,candidate,root,new Map([['.txt','text/plain']])),error=>error?.status===403&&error?.code==='static-symlink-escape');
      assert.equal(captured,null,'a denied static request must not write an HTTP 200 response');
    }
    await writeFile(path.join(root,'safe.txt'),'public-canary');
    await symlink(path.join(root,'safe.txt'),path.join(root,'internal-link.txt'));
    captured=null;await serveStatic(response,'/internal-link.txt',root,new Map([['.txt','text/plain']]));
    assert.equal(captured.status,200,'internal symlink must preserve compatible public URL');
  }finally{await rm(privateRoot,{recursive:true,force:true});}
}finally{await rm(root,{recursive:true,force:true});}console.log('http-security-headers-check: ok',required.length);
