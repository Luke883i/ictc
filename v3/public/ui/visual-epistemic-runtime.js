import { installOperationalSurfaceA6Ux3 } from './operational-surface-a6-ux3.js';
let installed=false,pending=false;
function apply(){pending=false;document.documentElement.dataset.visualEpistemicRuntime='compat-3.1';}
function schedule(){if(pending)return;pending=true;queueMicrotask(apply);}
export function installVisualEpistemicRuntime(){if(installed)return;installed=true;for(const eventName of ['ictc:rendered','ictc:surface-changed','ictc:context-changed','ictc:projection-committed'])document.addEventListener(eventName,schedule);installOperationalSurfaceA6Ux3();schedule();}
