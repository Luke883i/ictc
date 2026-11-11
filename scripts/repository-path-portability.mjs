/** Derived filesystem portability diagnostic for the existing repository contract.
 * No ownership, rename, deletion, or CI authority is inferred from a clean scan. */
import {readdirSync} from 'node:fs';
import {join,relative,resolve,sep} from 'node:path';
const GENERATED=new Set(['.git','node_modules','.ictc','artifacts','dist','coverage']);
const WINDOWS_DEVICE=/^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/i;
const WINDOWS_FORBIDDEN=/[<>:"\\|?*\u0000-\u001f]/;
export function checkPortablePaths(paths){
 const seen=new Map(),errors=[];
 for(const p of paths){
  const segments=p.split('/');
  for(const segment of segments){
   if(segment!==segment.normalize('NFC'))errors.push(`non-NFC filesystem name: ${p}`);
   if(WINDOWS_DEVICE.test(segment)||WINDOWS_FORBIDDEN.test(segment)||/[. ]$/.test(segment))
    errors.push(`non-portable filesystem name: ${p}`);
  }
  const key=p.normalize('NFC').toLowerCase();
  const old=seen.get(key);
  if(old&&old!==p)errors.push(`case-insensitive path collision: ${old} <> ${p}`);
  else seen.set(key,p);
 }
 return [...new Set(errors)];
}
export function inspectRepositoryFilesystem(root,{exclude=GENERATED}={}){
 const base=resolve(root),paths=[],symlinks=[];
 function walk(dir){
  for(const entry of readdirSync(dir,{withFileTypes:true})){
   if(dir===base&&exclude.has(entry.name))continue;
   const full=join(dir,entry.name),rel=relative(base,full).split(sep).join('/');
   paths.push(rel);
   // A symlink may leave the checkout or be unsupported by consumers on Windows.
   // No current ICTC source requires one. Keep the disposition HOLD_REVIEW.
   if(entry.isSymbolicLink()){symlinks.push(rel);continue;}
   if(entry.isDirectory())walk(full);
  }
 }
 walk(base);
 const errors=[...checkPortablePaths(paths),...symlinks.map(p=>`unqualified repository symlink: ${p}`)];
 return {examined:paths.length,symlinks,errors,scope:'filesystem paths outside generated/ignored root directories; current checkout only',disposition:'HOLD_REVIEW, never SAFE_DELETE'};
}
