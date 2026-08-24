import { CURRENT_SEMANTIC } from './current-release-suite.mjs';

export const POLICY_GATES=Object.freeze(['v3/runtime-temp-cleanup-contract-check.mjs','v3/ci-topology-contract-check.mjs']);
export const LEGACY_DEMO_GATES=Object.freeze(['v3/demo-seed-contract-check.mjs','v3/demo-seed-saturation.mjs','v3/demo-outcome-audit-check.mjs','v3/demo-outcome-saturation.mjs','v3/demo-reality-context-check.mjs','v3/demo-procedure-ontology-check.mjs','v3/demo-operating-year-check.mjs','v3/demo-operating-year-saturation.mjs']);
export const DEMO_SUITE_GATES=Object.freeze(['v3/demo-suite-2-2-module-load-check.mjs','v3/demo-suite-2-2-runtime-semantic-check.mjs','v3/demo-suite-2-2-runtime-store-check.mjs','v3/demo-suite-2-2-projection-closure-check.mjs']);
export const NATIVE_GATES=Object.freeze(['v3/current-gate-registry-check.mjs','v3/native-semantic-lattice-3-2-check.mjs','v3/native-semantic-lattice-3-2-ui-check.mjs','v3/semantic-workspace-closure-3-2-1-saturation.mjs','v3/workspace-chrome-3-3-saturation.mjs','v3/ui-finetuning-3-4-check.mjs','v3/ui-finetuning-3-4-saturation.mjs','v3/native-semantic-lattice-3-2-saturation.mjs','v3/native-semantic-lattice-3-2-stress.mjs','v3/experience-readiness-3-2-saturation.mjs','v3/product-ci-coevolution-3-2.mjs','v3/surface-commit-3-2-v2-saturation.mjs','v3/grc-canonical-render-3-2-saturation.mjs','v3/grc-coverage-handoff-3-2-saturation.mjs','v3/ci-verdict-fanout-3-2-saturation.mjs']);

const COMPATIBILITY_PATTERNS=Object.freeze([
 /(?:^|\/)v1-2-/,/(?:^|\/)v1-9-/,/refined-product/,/procedure-journey-2-1/,/semantic-closure-2-8/,/runtime-stabilization-2-9/,/semantic-foundation-3-0/,
 /shell-admin-demo-2-6/,/business-surface-convergence-2-7/,/procedure-finetuning-2-3/,/procedure-record-(?:contract|saturation)-2-4/,/surface-truth-(?:contract|saturation)-2-5/,
 /onto-compliance/,/visual-grace/,/ui-epistemic/,/pr60-/,/v2-grc/,/v4-stable/,/stable-1-4/,/standard-proof-1-6/,/enterprise-1-8/,/v15-/,/enterprise-t-/
]);
const legacyDemo=new Set(LEGACY_DEMO_GATES);
export function classifyBaseGate(gate){
 if(legacyDemo.has(gate))return 'replaced';
 return COMPATIBILITY_PATTERNS.some(pattern=>pattern.test(gate))?'compatibility-regression':'current-required';
}
export const CURRENT_BASE_GATE_REGISTRY=Object.freeze(CURRENT_SEMANTIC.map(gate=>Object.freeze({gate,class:classifyBaseGate(gate)})));
export const CURRENT_REQUIRED_BASE=Object.freeze(CURRENT_BASE_GATE_REGISTRY.filter(entry=>entry.class==='current-required').map(entry=>entry.gate));
export const COMPATIBILITY_REGRESSION_BASE=Object.freeze(CURRENT_BASE_GATE_REGISTRY.filter(entry=>entry.class==='compatibility-regression').map(entry=>entry.gate));
export const REPLACED_BASE=Object.freeze(CURRENT_BASE_GATE_REGISTRY.filter(entry=>entry.class==='replaced').map(entry=>entry.gate));
export const CURRENT_AUTHORITY_VECTOR=Object.freeze({product:'1.8.0',uiComposition:'3.2',workspaceChrome:'3.3',uiPresentation:'3.4-transitional',demoProjection:'2.2',journey:'2.2-sequential-onto-epistemic',constitution:'C0.1',documentation:'1.0'});
