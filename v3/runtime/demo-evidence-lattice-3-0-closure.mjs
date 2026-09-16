import { readFileSync } from 'node:fs';
import { sha256 } from '../domain.mjs';
import { canonicalEpistemicProjection } from './epistemic-projection-1-3.mjs';
import { buildDemoEvidenceLattice30, DEMO_EVIDENCE_LEVELS } from './demo-evidence-lattice-3-0.mjs';

const taxonomy=JSON.parse(readFileSync(new URL('../object-types.json',import.meta.url),'utf8'));
const groupSet=name=>new Set(taxonomy.groups?.[name]||[]);
const technology=groupSet('technology'),informationPrivacy=groupSet('information-privacy'),organizationTypes=groupSet('organization'),securityCompliance=groupSet('security-compliance');
const EXTERNAL_DEPENDENCY_TYPES=new Set(['supplier','processor-or-third-party','contract','facility']);
const CONTROL_TYPES=new Set(['control','control-implementation','policy','procedure','work-instruction']);
const hasType=(state,set)=>(state.grcObjects||[]).some(item=>set.has(item.type));
const subjectProcedure=new Map();

export const DEMO_SME_CLOSED_ONTOLOGY=Object.freeze([
  'organization-and-roles','technology-estate','information-and-privacy','organization-and-third-parties','security-and-compliance-objects','normative-universe','monitoring-sources','operational-events','controls-and-tests','mappings','actions','risks','assurance','evidence','time','cross-procedure-relations'
]);
export const ICTC_CANONICAL_EPISTEMIC_FAMILIES=Object.freeze(['observed','derived','proposed','decided','attested']);

function crossProcedureCount(graph){subjectProcedure.clear();for(const node of graph.nodes||[])if(node.kind==='subject')subjectProcedure.set(node.id,node.procedureId);let count=0;for(const edge of graph.edges||[])if(edge.kind==='correlation'){const a=subjectProcedure.get(edge.from),b=subjectProcedure.get(edge.to);if(a&&b&&a!==b)count++;}return count;}
function annualPortfolioNode(graph){return {id:'portfolio:operating-year',kind:'portfolio',label:'Portafoglio annuale DEMO',epistemicStatus:'derived',evidenceLevel:'E5-portfolio-view',authority:'derived-read-only-demo-lattice',data:{sourceGraphDigest:graph.digest,subjects:graph.summary.subjects,procedures:graph.summary.procedureCounts,claimBoundary:'Vista annuale derivata: aggregazione non equivale a conclusione di conformità, assurance o verità nel mondo.'}};}
export function buildClosedDemoEvidenceLattice30(state={},options={}){
  const base=buildDemoEvidenceLattice30(state,options);if(!base.enabled)return{...base,closure:{closed:false,reasons:['demo-disabled']}};
  const graph=structuredClone(base),portfolio=annualPortfolioNode(base);graph.nodes.push(portfolio);graph.edges.push({id:`edge:${sha256('portfolio:year').slice(0,24)}`,schemaVersion:'3.0.0',kind:'membership',from:portfolio.id,to:'period:year-1',predicate:'summarizes-period',basis:'derived-annual-projection',causal:false,authorityTransfer:'none'},{id:`edge:${sha256('portfolio:organization').slice(0,24)}`,schemaVersion:'3.0.0',kind:'about',from:portfolio.id,to:'organization:demo',predicate:'summarizes-organization',basis:'derived-annual-projection',causal:false,authorityTransfer:'none'});
  const actor={id:'local-admin',displayName:'Amministratore locale',role:'admin',identityMode:'local'},epistemic=canonicalEpistemicProjection(state,actor),families=new Set(epistemic.records.flatMap(record=>record.epistemicFamilies||[])),objectTypes=new Set((state.grcObjects||[]).map(item=>item.type)),crossProcedureRelations=crossProcedureCount(graph);
  const ontology={
    'organization-and-roles':Boolean(graph.nodes.some(n=>n.kind==='organization')&&(state.users||[]).length>=3),
    'technology-estate':hasType(state,technology),
    'information-and-privacy':hasType(state,informationPrivacy),
    'organization-and-third-parties':hasType(state,organizationTypes)&&hasType(state,EXTERNAL_DEPENDENCY_TYPES),
    'security-and-compliance-objects':hasType(state,securityCompliance),
    'normative-universe':(state.catalog||[]).length>0&&(state.grcMappings||[]).length>0,
    'monitoring-sources':(state.missions||[]).length>0,
    'operational-events':(state.incidents||[]).length>0,
    'controls-and-tests':hasType(state,CONTROL_TYPES)&&(state.controlTests||[]).length>0,
    mappings:(state.grcMappings||[]).length>0,actions:(state.grcActions||[]).length>0,risks:(state.grcRisks||[]).length>0,assurance:(state.grcAssurance||[]).length>0,
    evidence:graph.nodes.some(n=>n.kind==='evidence'),time:graph.summary.period?.months===12&&graph.summary.period?.quarters===4,
    'cross-procedure-relations':crossProcedureRelations>0
  };
  const epistemicCoverage=Object.fromEntries(ICTC_CANONICAL_EPISTEMIC_FAMILIES.map(family=>[family,families.has(family)]));
  const evidenceCoverage=Object.fromEntries(DEMO_EVIDENCE_LEVELS.map(level=>[level,graph.nodes.some(node=>node.evidenceLevel===level)]));
  const dangling=graph.edges.filter(edge=>!graph.nodes.some(node=>node.id===edge.from)||!graph.nodes.some(node=>node.id===edge.to));
  const reasons=[...Object.entries(ontology).filter(([,ok])=>!ok).map(([key])=>`ontology:${key}`),...Object.entries(epistemicCoverage).filter(([,ok])=>!ok).map(([key])=>`epistemic:${key}`),...Object.entries(evidenceCoverage).filter(([,ok])=>!ok).map(([key])=>`evidence-level:${key}`),...(dangling.length?[`dangling:${dangling.length}`]:[])];
  graph.summary={...graph.summary,nodes:graph.nodes.length,edges:graph.edges.length,evidenceLevels:{...graph.summary.evidenceLevels,'E5-portfolio-view':1},ontologyCoverage:ontology,epistemicCoverage,evidenceCoverage,crossProcedureRelations};
  graph.digest=sha256({baseDigest:base.digest,portfolio,ontology,epistemicCoverage,evidenceCoverage,crossProcedureRelations});
  graph.closure={closed:reasons.length===0,reasons,ontologyContract:'typical-sme-operating-ontology-bounded-by-ictc-vocabulary',ontologyDimensions:DEMO_SME_CLOSED_ONTOLOGY,objectTypes:[...objectTypes].sort(),canonicalEpistemicFamilies:ICTC_CANONICAL_EPISTEMIC_FAMILIES,evidenceLevels:DEMO_EVIDENCE_LEVELS,crossProcedureRelations,danglingEdges:dangling.length,claimBoundary:'Closed relative to the declared ICTC SME ontology and epistemic vocabulary; not a universal ontology of every possible SME or legal reality.'};
  graph.ok=base.ok&&graph.closure.closed;return graph;
}
