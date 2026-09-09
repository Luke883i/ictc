import { installOperationalSurfaceA6Ux3 } from './operational-surface-a6-ux3.js';
let installed=false,pending=false;
function applyOperationalDefaults(){
  for(const id of ['monitoring','incidents']){
    const details=document.querySelector(`[data-a6-registry="${id}"]`);
    if(!details||details.dataset.a6DefaultOpenApplied==='true')continue;
    details.open=true;
    details.dataset.a6DefaultOpenApplied='true';
  }
}
function apply(){pending=false;document.documentElement.dataset.visualEpistemicRuntime='compat-3.1';applyOperationalDefaults();}
function schedule(){if(pending)return;pending=true;queueMicrotask(apply);}
export function installVisualEpistemicRuntime(){if(installed)return;installed=true;installOperationalSurfaceA6Ux3();document.querySelector('link[data-a6-ux3-style]')?.remove();for(const eventName of ['ictc:rendered','ictc:surface-changed','ictc:context-changed','ictc:projection-committed'])document.addEventListener(eventName,schedule);schedule();}
