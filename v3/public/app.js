import { notify } from './ui/common.js';
import { refresh } from './ui/controller.js';
import { installActiveExperience } from './ui/active-experience.js';

installActiveExperience();
refresh({ keepDialog: false }).catch(error => notify(error.message, true));
