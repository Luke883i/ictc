import { installProofWorkspace32 } from './proof-workspace-3-2.js';
import { installEpistemicWorkspace32 } from './epistemic-workspace-3-2.js';
import { installAdminWorkspace32 } from './admin-workspace-3-2.js';
import { installGrcWorkspace32 } from './grc-workspace-3-2.js';
import { installDialogWorkspace32 } from './dialog-workspace-3-2.js';
let installed=false;
function ensureWorkspaceStyle(){if(document.querySelector('link[data-enterprise-workspace-32]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href='/enterprise-workspace-3-2.css';link.dataset.enterpriseWorkspace32='';document.head.append(link);}
export function installNativeWorkspace32(){if(installed)return;installed=true;ensureWorkspaceStyle();installProofWorkspace32();installEpistemicWorkspace32();installAdminWorkspace32();installGrcWorkspace32();installDialogWorkspace32();}
