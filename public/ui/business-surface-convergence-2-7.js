const VERSION='2.7.1-compat';
let installed=false,pending=false;
function apply(){pending=false;document.documentElement.dataset.businessSurfaceConvergence=VERSION;}
function schedule(){if(pending)return;pending=true;queueMicrotask(apply);}
export function installBusinessSurfaceConvergence27(){if(installed)return;installed=true;for(const eventName of ['ictc:rendered','ictc:surface-changed','ictc:context-changed','ictc:projection-committed'])document.addEventListener(eventName,schedule);schedule();}
