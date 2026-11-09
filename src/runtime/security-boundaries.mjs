import path from 'node:path';
import { asString } from '../domain.mjs';

function boundaryError(status,code,message,details=null){return Object.assign(new Error(message),{status,code,details});}

export function edgeRateLimitKey({tenantId,remoteAddress}={}){
  const tenant=asString(tenantId,200)||'default';
  const remote=asString(remoteAddress,200)||'unknown';
  return `${tenant}|remote:${remote}`;
}

export function authenticatedRateLimitKey({tenantId,actor,remoteAddress}={}){
  const tenant=asString(tenantId,200)||'default';
  const subject=asString(actor?.id,240);
  if(actor?.identityMode==='trusted-header'&&subject)return `${tenant}|subject:${subject}`;
  const remote=asString(remoteAddress,200)||'unknown';
  return `${tenant}|remote:${remote}`;
}

export function normalizeAttachmentId(value){
  const raw=String(value??''),attachmentId=asString(value,200);
  if(raw!==attachmentId||!attachmentId||attachmentId==='.'||attachmentId==='..'||!/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/.test(attachmentId)){
    throw boundaryError(400,'attachment-id-invalid','Identificativo allegato non valido');
  }
  return attachmentId;
}

export function attachmentStoragePath(root,value){
  const base=path.resolve(root),attachmentId=normalizeAttachmentId(value),resolved=path.resolve(base,attachmentId);
  if(resolved!==path.join(base,attachmentId)||!resolved.startsWith(`${base}${path.sep}`)){
    throw boundaryError(400,'attachment-path-invalid','Percorso allegato non confinato',{attachmentId});
  }
  return resolved;
}
