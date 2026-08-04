import { notify } from './ui/common.js';
import { refresh } from './ui/controller.js';
import { installBindings } from './ui/actions.js';

installBindings();
refresh({ keepDialog: false }).catch(error => notify(error.message, true));
