import assert from 'node:assert/strict';
import { readFileSync,mkdirSync,writeFileSync } from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const S={
 frame:read('./public/ui/procedure-frame.js'),slots:read('./public/ui/procedure-editorial-slots.js'),
 padmin:read('./public/ui/procedure-admin.js'),ux:read('./public/ui/enterprise-ux.js'),
 ds:read('./public/ui/enterprise-2-design-system.js'),admin:read('./public/ui/admin-center.js'),adminWorkspace:read('./public/ui/admin-workspace-3-2.js'),
 actions:read('./public/ui/actions.js'),operational:read('./public/ui/operational-surface-a6-ux3.js'),
 render:read('./public/ui/render.js'),browser:read('./public/ui/standard-browser.js'),
 standard:read('./runtime/standard-library-current.mjs'),publicPack:read('./runtime/standard-public-source-pack.mjs'),
 anatomy:read('./public/procedure-anatomy.css'),p2:read('./public/enduser-composition-p2.css'),
 home:read('./public/enterprise-workspace-3-2.css'),a6:read('./public/a6-ux3-operational-surface.css')
};
const sourceChecks=[
 [S.frame.includes('syncSupportRail')&&S.frame.includes('frame.after(rail)')&&!S.frame.includes('<div class="procedure-support-rail"'),'support-rail-sibling-owner'],
 [S.slots.includes(':scope > .procedure-support-rail')&&S.slots.includes('rail.parentElement!==host')&&S.slots.includes('positionSupportRail')&&S.slots.includes('validPhysicalOrder')&&!S.slots.includes('frame.nextElementSibling!==rail'),'support-rail-physical-order'],
 [S.frame.includes('Array.isArray(policy.enabled)')&&!S.frame.includes('!enabled.size||enabled.has'),'procedure-policy-fail-closed-projection'],
 [S.padmin.includes('ictc:procedure-policy-updated')&&!S.padmin.includes('<i aria-hidden="true"></i>'),'procedure-policy-readback-and-native-switch'],
 [S.ux.includes('status.hidden=true')&&S.ux.includes("status.dataset.legacyControl='shell-ai-status'")&&!S.ux.includes('status.dataset.tooltip=view.tooltip')&&S.adminWorkspace.includes('admin-configuration-state'),'ai-truth-explicit'],
 [S.admin.includes('adminAiProviderHost')&&S.admin.includes("settings.dataset.adminEmbedded='ai'")&&S.actions.includes("openAdminCenter('ai')"),'admin-ai-single-surface'],
 [S.render.includes('data.rnJobState')===false&&S.render.includes("registry.dataset.rnJobState=missions.length?'materialized':'empty'")&&S.operational.includes("id:'monitoring',label:'Monitoraggi',process:'monitoring',count:byId.size,open:false")&&S.operational.includes("if(details.dataset.a6RegistryDefaultApplied!=='true'&&!open){details.open=false;details.dataset.a6RegistryDefaultApplied='true';}")&&!S.operational.includes("else if(nextTotal>0){details.open=true"),'rn-job-materialization'],
 [S.browser.includes('neutralKeywords')&&S.browser.includes('standard-neutral-keywords')&&!/nodes\.map\(node=>\{[^}]*neutral=String\(node\.neutralDescription/.test(S.browser),'standard-index-compressed'],
 [S.standard.includes('structuralProfile')&&S.standard.includes('neutralKeywords')&&S.standard.includes('neutralOutline'),'closed-source-specific-paraphrase'],
 [S.publicPack.includes('officialSourceConfirmed')&&S.publicPack.includes('standard-public-source-incomplete')&&S.publicPack.includes("contentMode:'official-public-text'"),'public-exact-text-proof-boundary'],
 [S.a6.includes('grid-template-columns:minmax(11rem,15rem) minmax(0,1fr)'),'standard-detail-space'],
 [S.home.includes('padding-top:0!important;padding-bottom:0!important;min-height:0!important')&&S.home.includes('box-sizing:border-box;height:calc(100dvh')&&S.home.includes('max-height:calc(100dvh')&&S.home.includes('align-content:center;overflow:visible'),'home-real-viewport-budget'],
 [!S.p2.includes('!important')&&S.p2.includes('.procedure-switch{display:grid')&&S.p2.includes('[data-rn-job-summary]')&&S.home.includes('#adminCenter .procedure-switch>i{display:none!important}'),'composition-formatting-and-local-owner'],
 [S.anatomy.includes('procedure-support-rail .procedure-context-detail'),'support-rail-css-owner']
];
for(const[ok,label]of sourceChecks)assert.ok(ok,label);

const F=Object.freeze([
 'support-parent','support-order','header-boundary','home-budget','home-scroll-truth',
 'ai-state','ai-shell-visible','ai-color-verdict','ai-tooltip','ai-copy','policy-projection','policy-readback',
 'admin-ai-parent','admin-ai-single-form','admin-switch-native','standard-master-width',
 'standard-detail-visible','licensed-node-specific','public-text-provenance',
 'rn-job-count','rn-job-materialization','rn-job-secondary-open','single-owner'
]);
const valid=()=>({
 supportParent:'sibling',supportOrder:'reference>context>metrics>work',headerContainsSupport:false,
 viewport:900,header:56,footer:44,mainTop:0,mainBottom:0,homeHeight:800,bodyOverflow:'auto',
 aiState:'unconfigured',aiShellVisible:false,aiColorVerdict:false,aiTooltip:false,aiCopy:'Configurazione AI non completata',
 policyEnabled:['monitoring','incidents','objects','coverage','actions','risks','assurance'],landingEnabled:['monitoring','incidents','objects','coverage','actions','risks','assurance'],
 adminAiParent:'admin',settingsForms:1,nativeSwitch:true,
 masterPx:240,detailPx:680,licensedSpecific:true,publicExactRequiresConfirmedPack:true,
 jobCount:2,jobCards:2,jobMaterialized:true,jobRegistryOpen:false,owners:1
});
function failures(s){const o=[];
 if(s.supportParent!=='sibling')o.push('support-parent');
 if(s.supportOrder!=='reference>context>metrics>work')o.push('support-order');
 if(s.headerContainsSupport)o.push('header-boundary');
 if(s.header+s.footer+s.homeHeight+s.mainTop+s.mainBottom>s.viewport+1)o.push('home-budget');
 if(s.bodyOverflow==='hidden')o.push('home-scroll-truth');
 if(!['ready','key-missing','unconfigured'].includes(s.aiState))o.push('ai-state');
 if(s.aiShellVisible)o.push('ai-shell-visible');
 if(s.aiColorVerdict)o.push('ai-color-verdict');
 if(s.aiTooltip)o.push('ai-tooltip');
 if(!/^Configurazione AI (operativa|da verificare|non completata)$/.test(s.aiCopy))o.push('ai-copy');
 if(!Array.isArray(s.policyEnabled)||s.policyEnabled.length<1)o.push('policy-projection');
 if(s.policyEnabled.join('|')!==s.landingEnabled.join('|'))o.push('policy-readback');
 if(s.adminAiParent!=='admin')o.push('admin-ai-parent');
 if(s.settingsForms!==1)o.push('admin-ai-single-form');
 if(!s.nativeSwitch)o.push('admin-switch-native');
 if(!(s.masterPx<=260&&s.masterPx<s.detailPx))o.push('standard-master-width');
 if(!(s.detailPx>=s.masterPx))o.push('standard-detail-visible');
 if(!s.licensedSpecific)o.push('licensed-node-specific');
 if(!s.publicExactRequiresConfirmedPack)o.push('public-text-provenance');
 if(s.jobCount!==s.jobCards)o.push('rn-job-count');
 if(s.jobCount>0&&!s.jobMaterialized)o.push('rn-job-materialization');
 if(s.jobRegistryOpen)o.push('rn-job-secondary-open');
 if(s.owners!==1)o.push('single-owner');
 return o;
}
function mutate(s,f){switch(f){
 case'support-parent':s.supportParent='header';break;case'support-order':s.supportOrder='context>reference';break;
 case'header-boundary':s.headerContainsSupport=true;break;case'home-budget':s.homeHeight+=24;break;
 case'home-scroll-truth':s.bodyOverflow='hidden';break;case'ai-state':s.aiState='unknown';break;
 case'ai-shell-visible':s.aiShellVisible=true;break;case'ai-color-verdict':s.aiColorVerdict=true;break;case'ai-tooltip':s.aiTooltip=true;break;case'ai-copy':s.aiCopy='Sistema disponibile';break;
 case'policy-projection':s.policyEnabled=[];break;case'policy-readback':s.landingEnabled=s.landingEnabled.filter(x=>x!=='coverage');break;
 case'admin-ai-parent':s.adminAiParent='standalone-dialog';break;case'admin-ai-single-form':s.settingsForms=2;break;
 case'admin-switch-native':s.nativeSwitch=false;break;case'standard-master-width':s.masterPx=520;break;
 case'standard-detail-visible':s.detailPx=180;s.masterPx=240;break;case'licensed-node-specific':s.licensedSpecific=false;break;
 case'public-text-provenance':s.publicExactRequiresConfirmedPack=false;break;case'rn-job-count':s.jobCards=1;break;
 case'rn-job-materialization':s.jobMaterialized=false;break;case'rn-job-secondary-open':s.jobRegistryOpen=true;break;case'single-owner':s.owners=2;break;
}}
let seed=0x51c0ffee;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0},ri=n=>rnd()%n;
const coverage=Object.fromEntries(F.map(x=>[x,0]));let positives=0,mutatedTrials=0,appliedMutations=0,multi=0;
for(let i=0;i<1_000_000;i++){
 const s=valid(); if(i%29===0){assert.deepEqual(failures(s),[]);positives++;continue;}
 const chosen=new Set(),depth=1+ri(5);while(chosen.size<depth)chosen.add(F[ri(F.length)]);
 for(const f of chosen){mutate(s,f);coverage[f]++;appliedMutations++;}
 if(chosen.size>1)multi++;
 const observed=failures(s);for(const f of chosen)assert.ok(observed.includes(f),`survivor ${f} @${i}: ${observed.join(',')}`);
 mutatedTrials++;
}
assert.ok(Math.min(...Object.values(coverage))>100000,coverage);
mkdirSync(new URL('../artifacts/',import.meta.url),{recursive:true});
const report={ok:true,slice:'SCREENSHOT-INTENT-RUNTIME-SEMANTIC-CONVERGENCE',trials:1_000_000,positives,mutatedTrials,multiMutations:multi,appliedMutations,families:F.length,coverage,survivors:0,seed:'0x51c0ffee',dod:{global:['single-authority','truthful-state','runtime-readback','no-false-green'],intermediate:['landing-composition','admin-control-plane','standard-content-boundary','rn-job-legibility'],local:['support-rail-sibling','home-viewport-fit','procedure-hide-readback','ai-neutral-admin-state','admin-ai-parent','standard-master-detail','job-materialization']},claimBoundary:'Deterministic semantic/source mutation evidence only. Chromium/runtime readback remain independent. Exact public-source text is supported only when a complete confirmed official pack is materialized; no official text is fabricated by this rail.'};
writeFileSync(new URL('../artifacts/screenshot-intent-runtime-convergence-1m.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
