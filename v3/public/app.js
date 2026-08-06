import { notify } from './ui/common.js';
import { refresh } from './ui/controller.js';
import { installBindings } from './ui/actions.js';
import { installAdminCenter } from './ui/admin-center.js';
import { installEnterpriseExperience } from './ui/enterprise-ux.js';
import { installSurfaceRouter } from './ui/surface-router.js';
import { installStandardProof16Experience } from './ui/standard-proof-1-6.js'; // retained as a regression contract, intentionally not installed
import { installStandardProof17Experience } from './ui/standard-proof-1-7.js';
import { installEnterpriseClarity17 } from './ui/clarity-1-7.js';

installSurfaceRouter();
installBindings();
installAdminCenter();
installEnterpriseExperience();
installStandardProof17Experience();
installEnterpriseClarity17();
refresh({ keepDialog: false }).catch(error => notify(error.message, true));
