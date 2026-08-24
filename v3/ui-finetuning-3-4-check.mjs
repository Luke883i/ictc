import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const [index,tokens,css,shell,native,proof,closure,workspace]=await Promise.all([
  read('./public/index.html'),
  read('./public/design-tokens.css'),
  read('./public/workspace-finetuning-3-4.css'),
  read('./public/ui/stable-shell.js'),
  read('./public/ui/native-workspace-3-2.js'),
  read('./public/ui/proof-workspace-3-2.js'),
  read('./public/semantic-workspace-closure-3-2-1.css'),
  read('./public/enterprise-workspace-3-2.css')
]);
const issues=[],check=(value,message)=>{if(!value)issues.push(message);};
check(index.includes('<svg class="ictc-brand-mark"')&&!index.includes('/assets/ictc-mark.png'),'header must mount canonical inline icon and retire raster logo mount');
for(const token of ['--chrome-header-start','--chrome-header-mid','--chrome-header-end','--chrome-footer-start','--chrome-footer-mid','--chrome-footer-end'])check((tokens.match(new RegExp(token.replace(/[-]/g,'\\-')+':','g'))||[]).length===1,`token uniqueness ${token}`);
check(css.includes('data-ui-fine-tuning="3.4"'),'3.4 scope missing');
check(css.includes('var(--chrome-footer-mid)')&&css.includes('var(--workspace-footer)'),'footer must consume visible multi-stop gradient');
check(css.includes('.stable-legal-footer{background:var(--workspace-footer)!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto;align-items:center!important'),'footer alignment contract missing');
check(!shell.includes('<small>Candidate</small>')&&shell.includes('<span class="stable-footer-product"><b>ICTC</b></span>'),'footer candidate label must be absent from rendered markup');
check(shell.includes("UI_FINE_TUNING_VERSION='3.4'")&&shell.includes('html.dataset.uiFineTuning=UI_FINE_TUNING_VERSION'),'3.4 shell identity missing');
check(native.includes("ensureStyle('/workspace-finetuning-3-4.css','data-ui-finetuning-34')"),'3.4 style must load after native workspace lineage');
check(native.indexOf('workspace-chrome-3-3.css')<native.indexOf('workspace-finetuning-3-4.css'),'3.4 must resolve after chrome 3.3');
check(shell.includes('home-priority-table')&&css.includes('.home-priority-table{overflow:hidden;border:1px solid')&&css.includes('border-top:1px solid var(--ui-ft-rule)!important'),'Home must be one bounded table-like surface with single separators');
check(css.includes('.home-priority-table .home-business-priority:first-child{border-top:0!important}'),'Home first row must not draw a duplicate separator');
check(shell.includes('home-priority-open')&&css.includes('.home-priority-open{display:inline-flex'),'Home actions must share one compact button treatment');
check(css.includes('.home-priority-head>button{min-height:44px'),'Home catalogue navigation must retain a 44px minimum target');
check(css.includes('.stable-footer-links a{display:inline-flex;align-items:center;min-height:44px'),'footer links must retain a 44px minimum target within the reserved footer geometry');
check(proof.includes('retireDuplicateInvestigation(root,content,investigation)'),'Proof must explicitly retire duplicate lattice entries');
check(proof.includes("root.querySelectorAll('#epistemicMetaCard,[data-meta-procedure=\"epistemic-lattice\"]')"),'Proof duplicate meta-card guard missing');
check(proof.includes('content.prepend(investigation)'),'canonical lattice entry must remain first in Evidence');
check(css.includes('#proofView .proof-head{max-width:none!important;margin:0 0 .35rem!important;padding:.3rem 0 .45rem!important'),'Evidence header compression missing');
check(css.includes('#proofView #proofTitle')&&css.includes('color:var(--color-text)!important'),'Evidence header must use default text color');
check(closure.includes('grid-auto-rows:max-content!important')&&closure.includes('height:auto!important'),'test must retain historical cause so 3.4 proves an explicit override');
check(workspace.includes('min-height:255px'),'test must retain 3.2 card lineage for compatibility');
check(css.includes('#procedureHub{align-items:stretch!important;grid-auto-rows:1fr!important}')&&css.includes('height:100%!important;min-height:226px!important;align-self:stretch!important'),'process cards must converge to equal desktop geometry');
check(css.includes('min-width:0;max-width:100%'),'process catalogue cards must contain intrinsic-width content');
check(css.includes('>:not(header,h2,.procedure-purpose,footer){display:none!important}'),'catalogue card must expose only locally meaningful canonical children');
check(css.includes('#procedureHub .procedure-card footer .executive-evidence-inline{display:none!important}'),'catalogue must hide the legacy executive evidence annotation while preserving its DOM trace');
check(css.includes('#procedureHub .procedure-card .procedure-primary{min-height:44px!important'),'catalogue primary actions must retain a 44px minimum target');
check(css.includes('@media(max-width:719px)')&&css.includes('height:auto!important;min-height:0!important'),'equal-height desktop contract must collapse safely on mobile');
check(css.includes('.stable-legal-footer{grid-template-columns:auto minmax(0,1fr);gap:.55rem!important}'),'mobile footer must allow the links column to shrink without document overflow');
check(!/#adminCenter|#grcWorkspace|#monitoringView|#incidentsView/.test(css),'3.4 scope must not leak into procedure runtimes/admin');
if(issues.length){console.error(JSON.stringify({ok:false,suite:'ui-finetuning-3.4',issues},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,suite:'ui-finetuning-3.4',tasks:{chrome:true,home:true,proof:true,processCatalogue:true},scope:'header+footer+Home summary+Evidence header/lattice entry+process catalogue only',ownersPreserved:['stable-shell.js','proof-workspace-3-2.js','procedure-frame.js'],catalogueTargetMinPx:44,legacyEvidenceAnnotationVisible:false,claimBoundary:'Static semantic/presentation contract; not human usability research, aesthetic certification, WCAG certification or legal assessment.'}));
