import assert from 'node:assert/strict';
import { CURRENT_SEMANTIC } from './current-release-suite.mjs';
import { POLICY_GATES,LEGACY_DEMO_GATES,DEMO_SUITE_GATES,NATIVE_GATES,CURRENT_BASE_GATE_REGISTRY,CURRENT_REQUIRED_BASE,COMPATIBILITY_REGRESSION_BASE,REPLACED_BASE,CURRENT_AUTHORITY_VECTOR } from './current-gate-registry.mjs';

assert.equal(CURRENT_BASE_GATE_REGISTRY.length,CURRENT_SEMANTIC.length,'every base semantic gate must have one registry entry');
assert.equal(new Set(CURRENT_BASE_GATE_REGISTRY.map(entry=>entry.gate)).size,CURRENT_SEMANTIC.length,'base gate registry must be unique');
assert.deepEqual([...REPLACED_BASE].sort(),[...LEGACY_DEMO_GATES].sort(),'replaced base gates must be exactly the legacy DEMO lattice');
const active=[...CURRENT_REQUIRED_BASE,...COMPATIBILITY_REGRESSION_BASE];
assert.equal(new Set(active).size,active.length,'active base classes must not overlap');
assert.ok(CURRENT_REQUIRED_BASE.length>0,'current-required base class must not be empty');
assert.ok(COMPATIBILITY_REGRESSION_BASE.length>0,'compatibility-regression class must expose historical rail explicitly');
for(const gate of REPLACED_BASE)assert.ok(!active.includes(gate),`replaced gate still active: ${gate}`);
for(const gate of DEMO_SUITE_GATES)assert.ok(!LEGACY_DEMO_GATES.includes(gate),`DEMO Suite gate collides with replaced gate: ${gate}`);
assert.equal(NATIVE_GATES.filter(gate=>gate==='v3/current-gate-registry-check.mjs').length,1,'registry check must be canonical native gate');
const requiredResponsibilities=['v3/documentation-authority-check.mjs','v3/release-identity-check.mjs','v3/product-contract-check.mjs','v3/procedure-contracts-check.mjs','v3/experience-constitution-check.mjs','v3/security-boundary-check.mjs','v3/write-authority-census-check.mjs'];
for(const gate of requiredResponsibilities)assert.ok(CURRENT_REQUIRED_BASE.includes(gate),`current responsibility misclassified: ${gate}`);
const vector=JSON.stringify(CURRENT_AUTHORITY_VECTOR);assert.ok(!vector.includes('+'),'current authority vector must not concatenate lineage generations');
assert.deepEqual(Object.keys(CURRENT_AUTHORITY_VECTOR),['product','uiComposition','workspaceChrome','uiPresentation','demoProjection','journey','constitution','documentation']);
console.log(JSON.stringify({ok:true,suite:'current-gate-registry',base:{total:CURRENT_SEMANTIC.length,currentRequired:CURRENT_REQUIRED_BASE.length,compatibilityRegression:COMPATIBILITY_REGRESSION_BASE.length,replaced:REPLACED_BASE.length},policy:POLICY_GATES.length,demoSuite:DEMO_SUITE_GATES.length,native:NATIVE_GATES.length,currentAuthorityVector:CURRENT_AUTHORITY_VECTOR,claimBoundary:'Classification changes authority semantics and observability only; compatibility-regression gates remain blocking until a later responsibility-coverage contraction proves safe demotion.'}));
