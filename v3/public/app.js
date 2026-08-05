import { notify } from './ui/common.js';
import { refresh } from './ui/controller.js';
import { installBindings } from './ui/actions.js';
import { installAdminCenter } from './ui/admin-center.js';
import { installEnterpriseExperience } from './ui/enterprise-ux.js';
import { installStable14Experience } from './ui/stable-1-4-home.js';

installBindings();
installAdminCenter();
installEnterpriseExperience();
installStable14Experience();
refresh({ keepDialog: false }).catch(error => notify(error.message, true));
