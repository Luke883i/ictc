import { notify } from './ui/common.js';
import { refresh } from './ui/controller.js';
import { installActiveExperience } from './ui/active-experience.js';
import { installSequentialProcedureUx } from './ui/procedure-sequential-ux-2-2.js';

installActiveExperience();
installSequentialProcedureUx();
refresh({ keepDialog: false }).catch(error => notify(error.message, true));
