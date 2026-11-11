// Deterministic, material mutation of real production source excerpts (NOT full runtime mutants).
// This ledger intentionally makes its proof boundary explicit.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const paths={
 S:'public/ui/stable-shell.js', C:'public/styles-experience.css',
 H:'public/enterprise-workspace-3-2.css', P:'public/ui/procedure-frame.js',
 R:'public/semantic-workspace-closure-3-2-1.css', I:'public/ui/ui-icons.js',
 E:'public/ui/proof-workspace-3-2.js'
};
// An anchor is admitted only after verifying its single occurrence in the current owner.
const rules=[
 ['rounded-modal','C','border-radius:24px;overflow:hidden!important'],
 ['native-lesson','S','<details data-homeboarding-lesson="'],
 ['expand-copy','S','<span class="onboarding-lesson-open">Espandi</span>'],
 ['collapse-copy','S','<span class="onboarding-lesson-close">Comprimi</span>'],
 ['lesson-chevron','S',"uiIcon('chevron-right','ui-icon onboarding-lesson-chevron')"],
 ['accepted-copy','S','Tutte le 15 lezioni sono disponibili: espandi un tema'],
 ['lesson-state','S','lesson.open=expandedLessons.has('],
 ['home-replay-route','S','data-onboarding-open data-onboarding-replay'],
 ['profile-menu-copy','S',"button.dataset.onboardingReplay='';button.textContent='Onboarding';actions.append(button);"],
 ['home-reading-width','H','#homeView .home-compliance-answer p{inline-size:100%;min-width:0;max-width:none'],
 ['process-detail-sibling','P','</footer>$'+'{process?'],
 ['process-secondary-owner','P','data-process-secondary-detail'],
 ['process-natural-height','R','#procedureHub{grid-auto-rows:auto!important;'],
 ['process-no-ellipsis','R','text-overflow:clip!important;white-space:normal!important;overflow-wrap:anywhere'],
 ['process-pictogram','I',"'RN-01':'radar'"],
 ['proof-reading-width','R','#proofContent>details.proof-section>summary small{max-width:none;inline-size:100%'],
 ['proof-chevron','E',"uiIcon('chevron-right','ui-icon proof-section-chevron')"],
 ['keyboard-focus','C','.onboarding-lessons>details>summary:focus-visible'],
 ['handoff-not-certification','P','<p class="process-inline-handoff"><b>Collega a:</b>'],
 ['placeholder-not-operational','P',"placeholder?'<span class=\"procedure-unavailable\""],
 ['onboarding-nonbypass','C','data-onboarding-mode="first-run-gate"] [data-onboarding-close]{display:none!important}'],
 ['proof-icon-idempotence','E',"summary.lastElementChild?.setAttribute('data-proof-chevron','1')"],
 ['equal-process-cta-height','R','procedure-card .procedure-primary{height:3.5rem!important;min-height:3.5rem!important']
];
function good(id,s){
 switch(id){
 case 0:{const m=s.match(/border-radius:(\d+(?:\.\d+)?)px;overflow:hidden!important/);return !!m&&Number(m[1])>=12&&Number(m[1])<=32;}
 case 1:return s.includes('<details data-homeboarding-lesson="');
 case 2:return /onboarding-lesson-open">Espandi<\/span>/.test(s);
 case 3:return /onboarding-lesson-close">Comprimi<\/span>/.test(s);
 case 4:return s.includes("uiIcon('chevron-right','ui-icon onboarding-lesson-chevron')");
 case 5:return s.includes('Tutte le 15 lezioni sono disponibili: espandi un tema');
 case 6:return s.includes('lesson.open=expandedLessons.has(');
 case 7:return s.includes('data-onboarding-open data-onboarding-replay');
 case 8:return s.includes("button.dataset.onboardingReplay='';button.textContent='Onboarding';actions.append(button);");
 case 9:return /home-compliance-answer p\{inline-size:100%;min-width:0;max-width:none/.test(s);
 case 10:return s.includes('</footer>$'+'{process?');
 case 11:return s.includes('data-process-secondary-detail');
 case 12:return /grid-auto-rows:auto!important/.test(s);
 case 13:return /text-overflow:clip!important;white-space:normal!important;overflow-wrap:anywhere/.test(s);
 case 14:return /'RN-01':'radar'/.test(s);
 case 15:return /proof-section>summary small\{max-width:none;inline-size:100%/.test(s);
 case 16:return s.includes("uiIcon('chevron-right','ui-icon proof-section-chevron')");
 case 17:return s.includes('.onboarding-lessons>details>summary:focus-visible');
 case 18:return s.includes('<p class="process-inline-handoff"><b>Collega a:</b>');
 case 19:return s.includes("placeholder?'<span class=\"procedure-unavailable\"");
 case 20:return s.includes('data-onboarding-mode="first-run-gate"] [data-onboarding-close]{display:none!important}');
 case 21:return s.includes("summary.lastElementChild?.setAttribute('data-proof-chevron','1')");
 case 22:return /procedure-card \.procedure-primary\{height:3\.5rem!important;min-height:3\.5rem!important/.test(s);
 default:throw Error('Unrecognized family '+id);
 }
}
function mutate(id,body,n){
 const v=String(n>>>0);
 switch(id){
 case 0:return body.replace('border-radius:24px','border-radius:0.'+v+'px');
 case 1:return body.replace('<details data-homeboarding-lesson','<div data-lesson-div-'+v);
 case 2:return body.replace('>Espandi</span>','>Apri-'+v+'</span>');
 case 3:return body.replace('>Comprimi</span>','>Completa-'+v+'</span>');
 case 4:return body.replace("'chevron-right'","'invalid-lesson-icon-"+v+"'");
 case 5:return body.replace('Tutte le 15 lezioni sono disponibili: espandi un tema','Le '+v+' lezioni saranno disponibili nei capitoli successivi');
 case 6:return body.replace('lesson.open=expandedLessons.has(','lesson.open=new Set(['+v+']).has(');
 case 7:return body.replace('data-onboarding-open data-onboarding-replay','data-inert-'+v+' data-onboarding-replay');
 case 8:return body.replace("button.textContent='Onboarding'","button.textContent='Rivedi-"+v+"'");
 case 9:return body.replace('max-width:none','max-width:'+(n%500000+1)+'ch');
 case 10:return body.replace('</footer>$'+'{process?','</footer><div data-false-detail="'+v+'">$'+'{process?');
 case 11:return body.replace('data-process-secondary-detail','data-secondary-unknown-'+v);
 case 12:return body.replace('grid-auto-rows:auto','grid-auto-rows:'+(n%500000+1)+'fr');
 case 13:return body.replace('text-overflow:clip','text-overflow:ellipsis;max-inline-size:'+(n%500000+1)+'ch');
 case 14:return body.replace("'radar'","'unknown-icon-"+v+"'");
 case 15:return body.replace('max-width:none','max-width:'+(n%500000+1)+'ch');
 case 16:return body.replace("'chevron-right'","'unknown-proof-chevron-"+v+"'");
 case 17:return body.replace(':focus-visible',':focus-mutant-'+v);
 case 18:return body.replace('<b>Collega a:</b>','<b>Conformita-'+v+':</b>');
 case 19:return body.replace("placeholder?'<span class=\"procedure-unavailable\"","placeholder?'<button data-active-placeholder=\""+v+"\"");
 case 20:return body.replace('display:none!important','display:block!important;/*escaped-'+v+'*/');
 case 21:return body.replace("'data-proof-chevron'","'proof-wrong-"+v+"'");
 case 22:return body.replace('height:3.5rem!important;min-height:3.5rem!important','height:'+(n%500000+1)+'rem!important;min-height:'+(n%500000+1)+'rem!important');
 default:throw Error('Unknown mutation family '+id);
 }
}
const cache=new Map(Object.entries(paths).map(([key,file])=>[key,readFileSync(join(root,file),'utf8')]));
const excerpts=rules.map(([name,file,anchor],i)=>{
 const src=cache.get(file),at=src.indexOf(anchor);
 assert(at>=0,'Missing target '+name);
 assert.equal(src.indexOf(anchor,at+anchor.length),-1,'Ambiguous target '+name);
 const excerpt=src.slice(Math.max(0,at-24),Math.min(src.length,at+anchor.length+64));
 assert(good(i,excerpt),'Baseline contract not met '+name);
 const sample=mutate(i,excerpt,i+101);
 assert.notEqual(sample,excerpt,'Nonmaterial mutation '+name);
 assert.equal(good(i,sample),false,'Survivor for '+name);
 return excerpt;
});
const seed=0x1c7c0284;
let rng=seed>>>0;
function next(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
const count=1000000;
const counts=Array(rules.length).fill(0),failures=[],fingerprint=createHash('sha256');
for(let i=0;i<count;i++){
 const id=i%rules.length;
 const n=(next()^(i+1))>>>0;
 const changed=mutate(id,excerpts[id],n);
 if(changed===excerpts[id]){failures.push({i,id,kind:'no-material-diff'});continue;}
 if(good(id,changed)){failures.push({i,id,kind:'mutant-survived'});continue;}
 fingerprint.update(String(id)).update('\u0000').update(changed).update('\n');
 counts[id]++;
 if(failures.length>0)break;
}
assert.equal(failures.length,0,'Material mutant survived: '+JSON.stringify(failures[0]));
assert.equal(counts.reduce((a,b)=>a+b,0),count,'Mutation campaign incomplete');
const report={
 schema:'ictc.ux-native-source-mutation.v1',seed:'0x'+seed.toString(16),actualMaterialMutations:count,
 familyCounts:Object.fromEntries(rules.map((r,i)=>[r[0],counts[i]])),mutationDigestSha256:fingerprint.digest('hex'),
 survivors:0,source:'production code excerpts read from this exact checkout',
 scope:'Material source-excerpt perturbations. NOT one million compiled whole-repository or browser runtime mutants.',
 limitation:'Real Chromium coverage is a separate exact-head Playwright P4 gate; E3/E4 are not inferred.'
};
mkdirSync(join(root,'artifacts'),{recursive:true});
writeFileSync(join(root,'artifacts/ux-native-disclosure-mutation-1m.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ok:true,seed:report.seed,mutants:count,families:rules.length,survivors:0,digest:report.mutationDigestSha256}));
