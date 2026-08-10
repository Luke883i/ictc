import { createGrcRuntime as createCompatibilityRuntime } from './grc-runtime-legacy.mjs';
import { routeMatch } from './http.mjs';
export const DELETE_MILESTONE='delete grc-runtime-legacy progress route after compatibility decomposition; current authority is procedure-invariant-handler';
export function createGrcRuntime(args){const compatibility=createCompatibilityRuntime(args);return async function handle(request,response,pathname,actor){const method=request.method||'GET';if(method==='POST'&&routeMatch(pathname,'/api/grc/actions/:id/progress'))return false;return compatibility(request,response,pathname,actor);};}
