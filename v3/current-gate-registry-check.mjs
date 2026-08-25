import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CURRENT_SEMANTIC } from './current-release-suite.mjs';
import { POLICY_GATES,LEGACY_DEMO_GATES,DEMO_SUITE_GATES,NATIVE_GATES,CURRENT_CONTRACT_GATES,COMPATIBILITY_REGRESSION_GATES,CURRENT_BASE_GATE_REGISTRY,CURRENT_REQUIRED_BASE,COMPATIBILITY_REGRESSION_BASE,REPLACED_BASE,CURRENT_AUTHORITY_VECTOR } from './current-gate-registry.mjs';

assert.equal(CURRENT_BASE_GATE_REGISTRY.length,CURRENT_SEMANTIC.length,'every base semantic gate must have one registry entry');
assert.equal(new Set(CURRENT_BASE_GATE_REGISTRY.map(entry=>entry.gate)).size,CURRENT_SEMANTIC.length,'base gate registry must be unique');
assert.deepEqual([...REPLACED_BASE].sort(),[...LEGACY_DEMO_GATES].sort(),'replaced base gates must be exactly the legacy DEMO lattice');
assert.deepEqual([...COMPATIBILITY_REGRESSION_BASE].sort(),[...COMPATIBILITY_REGRESSION_GATES].sort(),'compatibility class must be explicit and complete');
for(const gate of [...LEGACY_DEMO_GATES,...COMPATIBILITY_REGRESSION_GATES])assert.ok(CURRENT_SEMANTIC.includes(gate),`classified gate is not in CURRENT_SEMANTIC: ${gate}`);
const active=[...CURRENT_REQUIRED_BASE,...COMPATIBILITY_REGRESSION_BASE];
assert.equal(new Set(active).size,active.length,'active base classes must not overlap');
assert.ok(CURRENT_REQUIRED_BASE.length>0,'current-required base class must not be empty');
assert.ok(COMPATIBILITY_REGRESSION_BASE.length>0,'compatibility-regression class must expose historical rail explicitly');
for(const gate of REPLACED_BASE)assert.ok(!active.includes(gate),`replaced gate still active: ${gate}`);
for(const gate of DEMO_SUITE_GATES)assert.ok(!LEGACY_DEMO_GATES.includes(gate),`DEMO Suite gate collides with replaced gate: ${gate}`);
assert.equal(NATIVE_GATES.filter(gate=>gate==='v3/current-gate-registry-check.mjs').length,1,'registry check must be canonical native gate');

const requiredResponsibilities=['v3/documentation-authority-check.mjs','v3/release-identity-check.mjs','v3/product-contract-check.mjs','v3/procedure-contracts-check.mjs','v3/experience-constitution-check.mjs','v3/security-boundary-check.mjs','v3/write-authority-census-check.mjs',...CURRENT_CONTRACT_GATES];
for(const gate of requiredResponsibilities)assert.ok(CURRENT_REQUIRED_BASE.includes(gate),`current responsibility misclassified: ${gate}`);
for(const gate of ['v3/refined-product-check.mjs','v3/procedure-journey-2-1-check.mjs','v3/semantic-closure-2-8-causality-check.mjs','v3/runtime-stabilization-semantic-check.mjs'])assert.ok(COMPATIBILITY_REGRESSION_BASE.includes(gate),`known lineage gate must be compatibility-regression: ${gate}`);

const releaseIdentity=JSON.parse(readFileSync(new URL('./release-identity.json',import.meta.url),'utf8'));
const documentationManifest=JSON.parse(readFileSync(new URL('../docs/documentation-manifest.json',import.meta.url),'utf8'));
const axes=documentationManifest.versionAxes;
assert.equal(axes.product.value,releaseIdentity.productVersion,'product version must agree across current authorities');
assert.equal(axes.journey.value,releaseIdentity.contracts.journey,'journey version must agree across current authorities');
assert.equal(axes.constitution.value,releaseIdentity.contracts.constitution,'constitution version must agree across current authorities');
assert.ok(releaseIdentity.informationComposition.startsWith(`${axes.uiComposition.value}-`),'release identity information composition must agree with documentation axis');
assert.equal(CURRENT_AUTHORITY_VECTOR.product,releaseIdentity.productVersion);
assert.equal(CURRENT_AUTHORITY_VECTOR.semantic,releaseIdentity.contracts.semantic);
assert.equal(CURRENT_AUTHORITY_VECTOR.experience,releaseIdentity.contracts.experience);
assert.equal(CURRENT_AUTHORITY_VECTOR.epistemic,releaseIdentity.contracts.epistemic);
assert.equal(CURRENT_AUTHORITY_VECTOR.uiComposition,axes.uiComposition.value);
assert.equal(CURRENT_AUTHORITY_VECTOR.workspaceChrome,axes.workspaceChrome.value);
assert.deepEqual(CURRENT_AUTHORITY_VECTOR.uiPresentation,{value:axes.uiPresentation.value,classification:axes.uiPresentation.classification});
assert.ok(CURRENT_AUTHORITY_VECTOR.uiPresentation.classification.includes('transitional'),'3.4 presentation closure must remain explicitly transitional');
assert.equal(CURRENT_AUTHORITY_VECTOR.journey,releaseIdentity.contracts.journey);
assert.equal(CURRENT_AUTHORITY_VECTOR.constitution,releaseIdentity.contracts.constitution);
assert.equal(CURRENT_AUTHORITY_VECTOR.documentation,documentationManifest.documentationRuntime);
const vector=JSON.stringify(CURRENT_AUTHORITY_VECTOR);
assert.ok(!vector.includes('+'),'current authority vector must not concatenate lineage generations');
assert.deepEqual(Object.keys(CURRENT_AUTHORITY_VECTOR),['product','semantic','experience','epistemic','uiComposition','workspaceChrome','uiPresentation','journey','constitution','documentation']);

console.log(JSON.stringify({ok:true,suite:'current-gate-registry',base:{total:CURRENT_SEMANTIC.length,currentRequired:CURRENT_REQUIRED_BASE.length,compatibilityRegression:COMPATIBILITY_REGRESSION_BASE.length,replaced:REPLACED_BASE.length},currentContractOverrides:CURRENT_CONTRACT_GATES.length,explicitCompatibility:COMPATIBILITY_REGRESSION_GATES.length,policy:POLICY_GATES.length,demoSuite:DEMO_SUITE_GATES.length,native:NATIVE_GATES.length,currentAuthorityVector:CURRENT_AUTHORITY_VECTOR,claimBoundary:'Classification is explicit and fail-closed. Compatibility-regression gates remain blocking until a later responsibility-coverage contraction proves safe demotion. Authority-vector values are projections of current canonical sources, not a parallel version registry.'}));
