import { notify } from './ui/common.js';
import { refresh } from './ui/controller.js';
import { installBindings } from './ui/actions.js';
import { installAdminCenter } from './ui/admin-center.js';
import { installEnterpriseExperience } from './ui/enterprise-ux.js';
import { installStandardProof16Experience } from './ui/standard-proof-1-6.js';

installBindings();
installAdminCenter();
installEnterpriseExperience();
installStandardProof16Experience();
refresh({ keepDialog: false }).catch(error => notify(error.message, true));
