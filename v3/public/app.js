import { notify } from './ui/common.js';
import { refresh } from './ui/controller.js';
import { installBindings } from './ui/actions.js';
import { installAdminCenter } from './ui/admin-center.js';
import { installEnterpriseExperience } from './ui/enterprise-ux.js';

installBindings();
installAdminCenter();
installEnterpriseExperience();
refresh({ keepDialog: false }).catch(error => notify(error.message, true));
