import { notify } from './ui/common.js';
import { refresh } from './ui/controller.js';
import { installBindings } from './ui/actions.js';
import { installAdminCenter } from './ui/admin-center.js';
import { installEnterpriseExperience } from './ui/enterprise-ux.js';
import { installSurfaceRouter } from './ui/surface-router.js';
import { installStandardProof16Experience } from './ui/standard-proof-1-6.js'; // retained as a regression contract, intentionally not installed
import { installStandardProof17Experience } from './ui/standard-proof-1-7.js';
import { installEnterpriseClarity17 } from './ui/clarity-1-7.js';
import { installEnterpriseWorkbench18 } from './ui/workbench-1-8.js';
import { installSettings18Structure } from './ui/settings-1-8-fix.js';
import { installWorkbenchLabels18 } from './ui/labels-1-8-fix.js';
import { installEnterprise2Candidate } from './ui/enterprise-2.js';
import { installEnterprise2ProcessArchitecture } from './ui/enterprise-2-processes.js';
import { installEnterprise2EditorialSystem } from './ui/enterprise-2-editorial.js';

installSurfaceRouter();
installBindings();
installAdminCenter();
installEnterpriseExperience();
installStandardProof17Experience();
installEnterpriseClarity17();
installEnterpriseWorkbench18();
installSettings18Structure();
installWorkbenchLabels18();
installEnterprise2Candidate();
installEnterprise2ProcessArchitecture();
installEnterprise2EditorialSystem();
refresh({ keepDialog: false }).catch(error => notify(error.message, true));
