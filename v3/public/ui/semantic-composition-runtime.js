import { SEMANTIC_COMPOSITION_VERSION, SURFACE_BLUEPRINTS } from './semantic-composition-model.js';
import { LOCAL_COMPOSITION_OWNERS, NATIVE_SEMANTIC_LATTICE_VERSION } from './native-semantic-lattice-3-2.js';

let installed=false,pending=false;
const DEFAULT_ROLE=Object.freeze({work:'attention',catalogue:'action',procedure:'action',evidence:'evidence',relationships:'context',administration:'attention',configuration:'action'});
const ROOT_COUNTS=Object.freeze(Object.values(SURFACE_BLUEPRINTS).reduce((out,row)=>({...out,[row.root]:(out[row.root]||0)+1}),{}));
function annotateSurface(id,blueprint){const root=document.querySelector(blueprint.root);if(!root)return;root.dataset.semanticComposition=SEMANTIC_COMPOSITION_VERSION;root.dataset.nativeSemanticLattice=NATIVE_SEMANTIC_LATTICE_VERSION;if(ROOT_COUNTS[blueprint.root]===1)root.dataset.compositionSurface=id;root.dataset.informationRole=DEFAULT_ROLE[blueprint.kind]||'context';root.dataset.localCompositionOwner=LOCAL_COMPOSITION_OWNERS[id]||LOCAL_COMPOSITION_OWNERS[blueprint.procedure]||'native-surface';}
function annotate(){pending=false;if(!document.body)return;for(const [id,blueprint] of Object.entries(SURFACE_BLUEPRINTS))annotateSurface(id,blueprint);document.documentElement.dataset.semanticComposition=SEMANTIC_COMPOSITION_VERSION;document.documentElement.dataset.nativeSemanticLattice=NATIVE_SEMANTIC_LATTICE_VERSION;}
function schedule(){if(pending)return;pending=true;queueMicrotask(annotate);}
export function applySemanticComposition(){annotate();}
export function installSemanticComposition(){if(installed)return;installed=true;for(const event of ['ictc:rendered','ictc:surface-changed','ictc:context-changed','ictc:projection-committed'])document.addEventListener(event,schedule);schedule();}
