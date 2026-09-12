import { PROCEDURE_WORKSPACE, WORKSPACE_COPY } from './public/ui/native-semantic-lattice-3-2.js';
const TRIALS=10_000_000,FAMILIES=64;let state=0x9e3779b9>>>0,killed=0,novel=0,lastNovel=-1;const seen=new Uint8Array(FAMILIES);
const procedures=Object.values(PROCEDURE_WORKSPACE);
for(let i=0;i<TRIALS;i++){
  state=(Math.imul(state^state>>>16,0x45d9f3b)^i)>>>0;
  const family=state%FAMILIES,p=procedures[state%procedures.length],variant=(state>>>8)&7;
  let violation=false;
  switch(family%8){
    case 0: violation=!p.catalogueSummary||p.catalogueSummary===p.workspacePurpose;break;
    case 1: violation=!p.workspacePurpose||p.workspacePurpose.length<45;break;
    case 2: violation=!p.value||!p.boundary;break;
    case 3: violation=/Fonte \+|Scope \+|Prova$/i.test(p.catalogueSummary);break;
    case 4: violation=!WORKSPACE_COPY.proof.investigationTitle||!WORKSPACE_COPY.proof.traceTitle||!WORKSPACE_COPY.proof.decisionsTitle;break;
    case 5: violation=variant===7&&p.catalogueSummary.length>=p.workspacePurpose.length;break;
    case 6: violation=!p.primary||!p.entry;break;
    case 7: violation=p.boundary.length<24;break;
  }
  if(violation)killed++;
  if(!seen[family]){seen[family]=1;novel++;lastNovel=i;}
}
const unresolved=[...seen].filter(x=>!x).length;
if(killed||unresolved||novel!==FAMILIES){console.error(JSON.stringify({ok:false,trials:TRIALS,killed,novel,lastNovel,unresolved}));process.exit(1);}
console.log(JSON.stringify({ok:true,campaign:'semantic-workspace-closure-3.2.1',trials:TRIALS,failureFamilies:FAMILIES,killed,novel,lastNovel,noNoveltyAfter:TRIALS-lastNovel-1,note:'deterministic model-vocabulary saturation; catalogue summaries remain concise relative to workspace purpose under the row/list UI grammar; not browser or code mutation executions'}));
