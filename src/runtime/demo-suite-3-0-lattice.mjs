import { sha256 } from '../domain.mjs';
import { DEMO_SUITE_22_ID } from './demo-suite-2-2-fixture.mjs';
import { DEMO_SUITE_30_ID, DEMO_SUITE_30_VERSION, demoSuite30Violations } from './demo-suite-3-0.mjs';
import { buildClosedDemoEvidenceLattice30 } from './demo-evidence-lattice-3-0-closure.mjs';

const BUSINESS_COLLECTIONS=Object.freeze(['missions','incidents','grcObjects','grcMappings','grcActions','grcRisks','grcAssurance']);
const clone=value=>structuredClone(value);
function compatibilityState(state){const out=clone(state);for(const collection of BUSINESS_COLLECTIONS)for(const record of out[collection]||[]){if(record?.demo?.datasetId===DEMO_SUITE_30_ID){record.demo.sourceScenarioId=record.demo.sourceScenarioId||DEMO_SUITE_22_ID;record.demo.scenarioId=DEMO_SUITE_22_ID;}}return out;}

export function buildDemoSuite30EvidenceLattice(state={},options={}){
  const marker=state?.settings?.demoSuite30;if(marker?.status!=='complete')return{enabled:false,ok:false,version:DEMO_SUITE_30_VERSION,id:'demo-evidence-lattice-3-0',sourceSuite:'3.0',sourceScenarioId:DEMO_SUITE_30_ID,authority:'derived-read-only-demo-lattice',violations:['demo-suite-3-0-disabled'],closure:{closed:false,reasons:['demo-disabled']}};
  const suiteViolations=demoSuite30Violations(state);if(suiteViolations.length)return{enabled:true,ok:false,version:DEMO_SUITE_30_VERSION,id:'demo-evidence-lattice-3-0',sourceSuite:'3.0',sourceScenarioId:DEMO_SUITE_30_ID,authority:'derived-read-only-demo-lattice',violations:suiteViolations,closure:{closed:false,reasons:suiteViolations.map(item=>`suite:${item}`)}};
  const graph=buildClosedDemoEvidenceLattice30(compatibilityState(state),options),summary={...(graph.summary||{}),sourceSuite:'3.0',sourceScenarioId:DEMO_SUITE_30_ID,datasetAuthority:'demo-suite-3-0',legacyGeneratorSuite:'2.2-deprecated'};
  const digest=sha256({datasetId:DEMO_SUITE_30_ID,datasetVersion:DEMO_SUITE_30_VERSION,sourceGraphDigest:graph.digest,summary});
  return{...graph,version:DEMO_SUITE_30_VERSION,sourceSuite:'3.0',sourceScenarioId:DEMO_SUITE_30_ID,datasetAuthority:'demo-suite-3-0',legacyGeneratorSuite:'2.2-deprecated',digest,summary,closure:{...(graph.closure||{}),sourceSuite:'3.0',datasetAuthority:'demo-suite-3-0',legacyGeneratorSuite:'2.2-deprecated',claimBoundary:'Suite 3.0 e la sola autorita DEMO attiva; il generatore 2.2 e lineage deprecata. Il lattice resta derivato e read-only.'}};
}
