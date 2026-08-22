import { readFile, readdir } from 'node:fs/promises';
const root=new URL('../docs/',import.meta.url);
const [start,authority,standard,readme,testing,development,dod]=await Promise.all([
  readFile(new URL('START_HERE.md',root),'utf8'),
  readFile(new URL('authority-matrix.yaml',root),'utf8'),
  readFile(new URL('DOCUMENTATION_STANDARD.md',root),'utf8'),
  readFile(new URL('../README.md',root),'utf8'),
  readFile(new URL('TESTING.md',root),'utf8'),
  readFile(new URL('DEVELOPMENT.md',root),'utf8'),
  readFile(new URL('SEMANTIC_COMPOSITION_3_1_DOD.md',root),'utf8')
]);
const files=(await readdir(root,{withFileTypes:true})).filter(x=>x.isFile()).map(x=>x.name);
const failures=[];const check=(c,m)=>{if(!c)failures.push(m);};
for(const token of ['README.md','authority-matrix.yaml','11_ARCHITECTURE.md','02_EPISTEMIC_CONTRACT.md','03_ENDUSER_LANGUAGE.md','SEMANTIC_COMPOSITION_3_1_DOD.md','TESTING.md','DEVELOPMENT.md','DOCUMENTATION_STANDARD.md'])check(start.includes(token),`START_HERE missing ${token}`);
for(const token of ['ui_information_composition','ui_composition_root','ui_decision_presentation','enduser_language','release_identity','architecture'])check(authority.includes(token),`authority matrix missing ${token}`);
for(const token of ['entrypoint','current authority','lineage / historical evidence','generated evidence','La data più recente non conferisce autorità'])check(standard.includes(token),`documentation standard missing ${token}`);
check(readme.includes('docs/START_HERE.md'),'README must route engineers to START_HERE');
check(testing.includes('npm test')||testing.includes('test:current'),'TESTING must expose canonical test command');
check(development.length>200,'DEVELOPMENT guide unexpectedly empty');
check(dod.includes('40.000.000')&&dod.includes('tutte le superfici'),'current UI DoD must expose all-surface mutation evidence');
check(files.includes('START_HERE.md')&&files.includes('DOCUMENTATION_STANDARD.md'),'documentation entry/standard files missing');
const authorityRefs=[...authority.matchAll(/authority:\s*([^\n#]+)/g)].map(m=>m[1].trim()).filter(v=>v.startsWith('docs/')).map(v=>v.slice(5).replace(/\/$/,''));
for(const ref of authorityRefs){const top=ref.split('/')[0];check(files.includes(top)||ref.includes('/'),`authority document missing from docs root: ${ref}`);}
if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,docsFiles:files.length,entrypoint:'docs/START_HERE.md',standard:'docs/DOCUMENTATION_STANDARD.md',currentSlice:'SEMANTIC_COMPOSITION_3_1_DOD.md',classification:'entrypoint/current-authority/current-operating/lineage/generated'}));
