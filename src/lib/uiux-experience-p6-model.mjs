export const P6_SURFACE_IDS=Object.freeze(['home','processes','monitoring','incidents','objects','coverage','actions','risks','assurance','proof','epistemic','admin','ai-settings']);
export const P6_OWNERS=Object.freeze({home:'stable-shell.js',processes:'procedure-frame.js',monitoring:'procedure-frame.js',incidents:'procedure-frame.js',objects:'grc-workspace-3-2.js',coverage:'grc-workspace-3-2.js',actions:'grc-workspace-3-2.js',risks:'grc-workspace-3-2.js',assurance:'grc-workspace-3-2.js',proof:'proof-workspace-3-2.js',epistemic:'epistemic-workspace-3-2.js',admin:'admin-workspace-3-2.js','ai-settings':'settings-1-8-fix.js'});
export const P6_PRIMITIVES=Object.freeze(['Chrome','SurfaceIdentity','SurfacePurposeBoundary','AttentionStrip','ControlRail','RecordRow','PrimaryAction','StateChip','ProgressiveDetail','EvidenceConfigurationRow']);
export function validateP6(contract){
  const errors=[];
  if(contract?.schemaVersion!=='1.0.0')errors.push('schema');
  if(contract?.profile!=='UIUX-EXPERIENCE-P6')errors.push('profile');
  if(contract?.createsNewAuthority!==false)errors.push('authority');
  if(contract?.canonicalTitle!=='Integrated Compliance Tower Control')errors.push('home-title');
  if(JSON.stringify(contract?.commonPrimitives)!==JSON.stringify(P6_PRIMITIVES))errors.push('primitives');
  const surfaces=Array.isArray(contract?.surfaces)?contract.surfaces:[];
  if(JSON.stringify(surfaces.map(x=>x.id))!==JSON.stringify(P6_SURFACE_IDS))errors.push('surface-census');
  for(const row of surfaces){if(row.owner!==P6_OWNERS[row.id])errors.push(`owner:${row.id}`);if(!Array.isArray(row.opportunities)||row.opportunities.length<5)errors.push(`opportunities:${row.id}`);if(new Set(row.opportunities||[]).size!==(row.opportunities||[]).length)errors.push(`opportunity-duplicate:${row.id}`);}
  const g=contract?.geometry||{};if(g.controlMinPx!==44||g.compactRowPx!==52||g.rowMaxPx!==64||g.processListActionMinRem!==8.75||g.iconPx!==16)errors.push('geometry');
  const m=contract?.homeMount||{};if(m.staticTitle!==contract.canonicalTitle||m.stableShellTitleRewrite!==false||m.a6Ux3TitleRewrite!==false||m.expectedVisibleTitleTransitions!==0)errors.push('home-mount');
  const nav=contract?.globalNavigation||{};if(nav.trigger!=='Vai a'||nav.dialogTitle!=='Vai a'||nav.searchIcon!=='search')errors.push('navigation');
  const ai=contract?.aiStatus||{};if(ai.visualMode!=='admin-inline'||ai.shellVisible!==false||ai.readyText!=='Configurazione AI operativa'||ai.unconfiguredText!=='Configurazione AI non completata'||ai.keyMissingText!=='Configurazione AI da verificare'||ai.tooltip!==false||ai.colorVerdict!==false||ai.roleVisibleElsewhere!==true)errors.push('ai-status');
  const prop=contract?.productProposition||{};if(!Array.isArray(prop.requiredTerms)||!['governance','assurance interna','GDPR','NIS2'].every(x=>prop.requiredTerms.includes(x))||prop.aiBoundary!=='L’AI assiste'||prop.humanBoundary!=='decisioni restano umane'||Number(prop.maxCharacters)!==240)errors.push('product-proposition');
  const p=contract?.palette||{};if(p.pageBackground!=='#eef2f6'||JSON.stringify(p.header)!==JSON.stringify(['#24415f','#315b7c','#3f7092'])||JSON.stringify(p.footer)!==JSON.stringify(['#1b324b','#274966','#365f7f'])||JSON.stringify(p.landing)!==JSON.stringify(['#f7f9fc','#edf2f7'])||p.onChrome!=='#ffffff')errors.push('palette');
  if(Number(contract?.falsification?.trials)!==10_000_000||Number(contract?.falsification?.minimumFamilies)<55)errors.push('falsification');
  if(!String(contract?.humanEvidenceBoundary||'').includes('E3-HUMAN'))errors.push('human-boundary');
  return {ok:errors.length===0,errors};
}
