import { procedureWorklistProvider,procedureWorklistProviderIds } from './procedure-worklist.mjs';
export function procedureSummaryProvider(id){const provider=procedureWorklistProvider(id);return({state,actor,ctx,metric})=>{const computed=provider({state,actor,ctx}),attention=(computed.items||[]).filter(item=>item.actionable).length;return{attention,metrics:(computed.metrics||[]).map(item=>metric(item.id,item.value,item.severity)),extra:computed.extra||null};};}
export function procedureSummaryProviderIds(){return procedureWorklistProviderIds();}
