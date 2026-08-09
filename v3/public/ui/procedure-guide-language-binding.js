import { $ } from './common.js';
import { applyBusinessLanguagePolish } from './business-language-polish.js';

let installed=false;

export function installProcedureGuideLanguageBinding(){
  if(installed)return;
  installed=true;
  const dialog=$('#v3ProcedureDialog');
  if(!dialog)throw Object.assign(new Error('Procedure Guide dialog non disponibile'),{code:'procedure-guide-dialog-missing'});
  dialog.addEventListener('toggle',()=>{if(dialog.open)queueMicrotask(applyBusinessLanguagePolish);});
}
