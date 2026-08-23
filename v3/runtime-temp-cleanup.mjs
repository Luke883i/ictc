import { rm } from 'node:fs/promises';

export const TEMP_CLEANUP_POLICY=Object.freeze({maxRetries:12,retryDelay:75});

export async function cleanupTempDir(target,{maxRetries=TEMP_CLEANUP_POLICY.maxRetries,retryDelay=TEMP_CLEANUP_POLICY.retryDelay}={}){
  if(!target)return;
  await rm(target,{recursive:true,force:true,maxRetries,retryDelay});
}
