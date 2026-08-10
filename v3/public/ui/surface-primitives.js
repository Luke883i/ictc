import { $, $$ } from './common.js';

export const SURFACE_PRIMITIVE_ROOTS=Object.freeze({home:'#homeView',processes:'#processesView',monitoring:'#monitoringView',incidents:'#incidentsView',grc:'#grcView',proof:'#proofView',epistemic:'#epistemicView'});
const TOOLBAR_SELECTORS='.market-toolbar,.standard-toolbar,.grc-toolbar,.proof-toolbar,.command-search,[data-surface-toolbar]';
const HERO_SELECTORS=':scope > .hero,:scope > .procedure-frame,:scope > .proof-head,:scope > .processes-head,:scope > [data-surface-hero]';
const PANEL_SELECTORS=':scope > section,:scope > article,:scope > .market-section,:scope > .grc-section,:scope > [data-surface-panel]';

function markDataRegions(root){for(const table of $$('table',root)){const owner=table.parentElement;if(owner&&owner!==root){owner.classList.add('surface-data-region');owner.dataset.surfaceDataRegion='table';}}for(const node of $$('.global-search-results,.command-results,[data-surface-data-region]',root)){node.classList.add('surface-data-region');}}
function markRoot(surface,selector){const root=$(selector);if(!root)return;root.classList.add('surface-canvas');root.dataset.surfacePrimitive='canvas';root.dataset.surfaceKind=surface;for(const node of $$(HERO_SELECTORS,root))node.classList.add('surface-hero');for(const node of $$(PANEL_SELECTORS,root))node.classList.add('surface-panel');for(const node of $$(TOOLBAR_SELECTORS,root))node.classList.add('surface-toolbar');markDataRegions(root);}
export function applySurfacePrimitives(){for(const [surface,selector] of Object.entries(SURFACE_PRIMITIVE_ROOTS))markRoot(surface,selector);document.documentElement.dataset.ictcSurfacePrimitives='2.0';}
let installed=false;
export function installSurfacePrimitives(){if(installed)return;installed=true;applySurfacePrimitives();document.addEventListener('ictc:rendered',()=>queueMicrotask(applySurfacePrimitives));document.addEventListener('ictc:surface-changed',()=>queueMicrotask(applySurfacePrimitives));}
