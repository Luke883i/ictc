import { installProofWorkspace32 } from './proof-workspace-3-2.js';
import { installEpistemicWorkspace32 } from './epistemic-workspace-3-2.js';
import { installAdminWorkspace32 } from './admin-workspace-3-2.js';
import { installGrcWorkspace32 } from './grc-workspace-3-2.js';
import { installDialogWorkspace32 } from './dialog-workspace-3-2.js';
let installed=false;
function ensureStyle(href,attribute){if(document.querySelector(`link[${attribute}]`))return;const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.setAttribute(attribute,'');document.head.append(link);}
function ensureWorkspaceStyle(){ensureStyle('/enterprise-workspace-3-2.css','data-enterprise-workspace-32');ensureStyle('/semantic-workspace-closure-3-2-1.css','data-semantic-workspace-closure-321');ensureStyle('/workspace-chrome-3-3.css','data-workspace-chrome-33');ensureStyle('/workspace-finetuning-3-4.css','data-ui-finetuning-34');}
export function installNativeWorkspace32(){if(installed)return;installed=true;ensureWorkspaceStyle();installProofWorkspace32();installEpistemicWorkspace32();installAdminWorkspace32();installGrcWorkspace32();installDialogWorkspace32();}
