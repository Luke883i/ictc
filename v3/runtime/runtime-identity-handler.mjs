import { readFileSync } from 'node:fs';
import { json } from './http.mjs';
import { runtimeIdentityProjection } from './runtime-identity.mjs';
const release=JSON.parse(readFileSync(new URL('../release-identity.json',import.meta.url),'utf8'));
const startedAt=new Date().toISOString();
export function createRuntimeIdentityHandler(){
  return async function runtimeIdentityHandler(request,response,pathname){
    if((request.method||'GET')!=='GET'||pathname!=='/api/runtime/identity')return false;
    json(response,200,runtimeIdentityProjection({release,startedAt}));return true;
  };
}
