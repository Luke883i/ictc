import { COMPLIANCE_BASIS, PROCEDURE_COMPOSITION, WORKBOOK_AUTHORITY_VERSION, WORKBOOK_COPY } from './semantic-composition-model.js';

export const NATIVE_SEMANTIC_LATTICE_VERSION='3.2.0';
export const SEMANTIC_WORKSPACE_CLOSURE_VERSION='3.2.1';
export const WORKBOOK_AUTHORITY_CLOSURE_VERSION=WORKBOOK_AUTHORITY_VERSION;
export const PRODUCT_PROPOSITION=WORKBOOK_COPY.home.catalogueSummary;

export const PROCEDURE_WORKSPACE=Object.freeze(Object.fromEntries(Object.entries(PROCEDURE_COMPOSITION).map(([id,row])=>[id,Object.freeze({
  code:row.code,catalogueSummary:row.catalogueSummary,workspacePurpose:row.workspacePurpose,examples:row.examples,basis:row.basis,value:row.value,boundary:row.boundary,primary:row.primary,entry:row.secondary
})])));

export const LOCAL_COMPOSITION_OWNERS=Object.freeze({home:'stable-shell.js',processes:'procedure-frame.js',monitoring:'procedure-frame.js',incidents:'procedure-frame.js',objects:'grc-workspace-3-2.js',coverage:'grc-workspace-3-2.js',actions:'grc-workspace-3-2.js',risks:'grc-workspace-3-2.js',assurance:'grc-workspace-3-2.js',proof:'proof-workspace-3-2.js',epistemic:'epistemic-workspace-3-2.js',admin:'admin-workspace-3-2.js',navigation:'global-tools.js'});
export const NATIVE_LATTICE_INVARIANTS=Object.freeze(['global-runtime-zero-local-adapters','global-runtime-zero-business-copy-rewrites','global-runtime-zero-local-dom-reorders','local-owner-before-global-annotation','catalogue-workspace-copy-split','heterogeneous-capabilities-use-matrix','homogeneous-records-use-list','home-product-identity-not-ui-instruction','proof-investigation-first-collapsed','proof-workbook-default-supersession-explicit','proof-method-progressive','epistemic-search-first','epistemic-rules-progressive','epistemic-experience-interaction-only','admin-feature-policy-explicit','admin-confirm-diff-only','navigation-single-column','exactly-seven-business-processes','ep01-cross-cutting-not-business-process','c01-five-phases-fixed-order','no-color-as-compliance-verdict','header-dark-gradient-white-controls','footer-darker-gradient-high-contrast','mobile-no-horizontal-overflow','canonical-copy-owned-by-g0']);
export const NATIVE_LATTICE_METRICS=Object.freeze({localAdaptersInGlobalRuntime:0,businessCopyRewritesInGlobalRuntime:0,localDomReordersInGlobalRuntime:0,procedureCoverage:1,localOwnerCoverage:1,workbookApplicationMin:1,mutationKillRate:1,mPlusNoNoveltyMin:10000,holdoutNovelFamiliesMax:0});
export const WORKSPACE_COPY=Object.freeze({
  home:WORKBOOK_COPY.home,
  proof:Object.freeze({title:WORKBOOK_COPY.proof.surface,productProposition:WORKBOOK_COPY.proof.catalogueSummary,purpose:WORKBOOK_COPY.proof.workspacePurpose,boundary:WORKBOOK_COPY.proof.boundary,primary:WORKBOOK_COPY.proof.primary,disclosure:WORKBOOK_COPY.proof.secondary,investigationTitle:'Reticolo epistemico',investigationPurpose:'Esplora relazioni, versioni e basi registrate prima di leggere la singola evidenza; il reticolo organizza conoscenza e non produce giudizi di conformità.',investigationAction:'Apri reticolo epistemico',traceTitle:'Ricostruisci un elemento di lavoro',tracePurpose:'Segui originale, assistenza, decisioni umane, relazioni ed evidenze per ricostruire la storia registrata.',decisionsTitle:'Decisioni e tracciabilità',decisionsPurpose:WORKBOOK_COPY.proof.workspacePurpose,decisionsAction:WORKBOOK_COPY.proof.primary}),
  epistemic:Object.freeze({title:WORKBOOK_COPY.epistemic.surface,productProposition:WORKBOOK_COPY.epistemic.catalogueSummary,purpose:WORKBOOK_COPY.epistemic.workspacePurpose,examples:WORKBOOK_COPY.epistemic.examples,boundary:WORKBOOK_COPY.epistemic.boundary,primary:WORKBOOK_COPY.epistemic.primary,disclosure:WORKBOOK_COPY.epistemic.secondary}),
  admin:Object.freeze({title:'Amministrazione ICTC',procedurePolicyTitle:'Disponibilità operativa dei processi',procedurePolicyPurpose:'Questi interruttori controllano quali processi possono ricevere nuovo lavoro nel runtime. Disattivare un processo impedisce nuove creazioni, routing e automazioni; non cancella dati esistenti, non modifica decisioni registrate e non sospende obblighi normativi dell’organizzazione.',procedurePolicyCta:'Salva disponibilità operativa'})
});

export { COMPLIANCE_BASIS };
