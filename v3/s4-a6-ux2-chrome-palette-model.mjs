const TOKEN_NAMES=Object.freeze([
  '--chrome-header-start','--chrome-header-mid','--chrome-header-end',
  '--chrome-footer-start','--chrome-footer-mid','--chrome-footer-end',
  '--chrome-on-dark','--chrome-on-dark-muted'
]);
const HEADER=['--chrome-header-start','--chrome-header-mid','--chrome-header-end'];
const FOOTER=['--chrome-footer-start','--chrome-footer-mid','--chrome-footer-end'];
const count=(s,n)=>s.split(n).length-1;
function hexValue(tokens,name){const m=tokens.match(new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s*:\\s*(#[0-9a-fA-F]{6})`));return m?.[1]||null;}
function rgb(hex){if(!hex)return null;return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);}
function luminance(hex){const v=rgb(hex);if(!v)return NaN;const f=x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4;return .2126*f(v[0])+.7152*f(v[1])+.0722*f(v[2]);}
function contrast(a,b){const l1=luminance(a),l2=luminance(b);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);}
export function validateChromePalette(s){const f=[];const fail=(code,detail)=>f.push({code,detail});
  for(const t of TOKEN_NAMES)if(count(s.tokens,`${t}:`)!==1)fail('TOKEN_CARDINALITY',t);
  const hd=s.chrome.match(/--workspace-header\s*:\s*linear-gradient\([^;]+\);/)?.[0]||'';
  const fd=s.chrome.match(/--workspace-footer\s*:\s*linear-gradient\([^;]+\);/)?.[0]||'';
  for(const t of HEADER)if(!hd.includes(`var(${t})`))fail('HEADER_TOKEN_CONSUMPTION',t);
  for(const t of FOOTER)if(!fd.includes(`var(${t})`))fail('FOOTER_TOKEN_CONSUMPTION',t);
  if(!s.chrome.includes('[data-workspace-chrome="3.3"] .topbar{'))fail('LIVE_HEADER_SELECTOR','.topbar');
  if(/\.stable-header(?=[\s:{.#>])/.test(s.chrome))fail('DEAD_HEADER_SELECTOR','.stable-header');
  const controlRule=s.chrome.match(/\.topbar :where\(\.service-nav button,[^{]+\)\{([^}]*)\}/)?.[1]||'';
  if(!controlRule)fail('CONTROL_PALETTE_RULE','live header control palette rule missing');
  if(/(?:^|;)\s*(?:min-height|height|padding(?:-[^:]*)?|border-radius|box-sizing)\s*:/m.test(controlRule))fail('CONTROL_GEOMETRY_CONTAMINATION','A6-UX2 palette owner must not acquire header-control geometry');
  if(!s.chrome.includes('@media(forced-colors:active)'))fail('FORCED_COLORS','missing');
  if(!s.chrome.includes('@media(prefers-reduced-motion:reduce)'))fail('REDUCED_MOTION','missing');
  if(!s.chrome.includes(':focus-visible'))fail('FOCUS_VISIBLE','missing');
  if(/\.topbar|#stableLegalFooter|\.stable-legal-footer/.test(s.business))fail('BUSINESS_CHROME_OWNER','business 2.7 must not own chrome');
  for(const marker of ['.home-business-metric','.procedure-card[data-business-procedure-card="2.7"]','.proof-scope-tabs','.business-acceptance'])if(!s.business.includes(marker))fail('BUSINESS_SURFACE_PRESERVATION',marker);
  if(s.styles.includes('business-surface-convergence-2-7-closure.css'))fail('RETIRED_CLOSURE_IMPORT','styles.css');
  if(s.closureExists)fail('RETIRED_CLOSURE_FILE','physical closure remains');
  const imports=[...s.styles.matchAll(/@import\s+url\(['"]([^'"]+)['"]\)/g)].map(x=>x[1]);if(imports.at(-1)!=='./a6-ux1-fixed-safe-footer.css')fail('UX1_FINAL_GEOMETRY_IMPORT',imports.at(-1));
  if(!/position:fixed!important/.test(s.ux1)||!s.ux1.includes('scroll-padding-bottom:calc(var(--a6-ux1-footer-reserve) + 12px)')||!s.ux1.includes('padding-bottom:var(--a6-ux1-footer-reserve)!important')||!s.ux1.includes('--a6-ux1-footer-reserve:calc(var(--a6-ux1-footer-min) + var(--a6-ux1-footer-safe-bottom))'))fail('UX1_GEOMETRY','fixed-safe contract drift');
  if(/(?:^|[;{])\s*(?:background(?:-color|-image)?|color)\s*:/m.test(s.ux1))fail('UX1_PALETTE_CONTAMINATION','geometry resolver owns palette');
  const hs=HEADER.map(t=>hexValue(s.tokens,t)),fs=FOOTER.map(t=>hexValue(s.tokens,t)),on=hexValue(s.tokens,'--chrome-on-dark'),muted=hexValue(s.tokens,'--chrome-on-dark-muted');
  if([...hs,...fs,on,muted].some(x=>!x))fail('TOKEN_PARSE','missing hex token');else{
    for(let i=0;i<3;i++)if(!(luminance(fs[i])<luminance(hs[i])))fail('FOOTER_NOT_DARKER',`${fs[i]} !< ${hs[i]}`);
    for(const bg of [...hs,...fs])if(contrast(on,bg)<4.5)fail('ON_DARK_CONTRAST',`${on}/${bg}`);
    for(const bg of [...hs,...fs])if(contrast(muted,bg)<4.5)fail('MUTED_CONTRAST',`${muted}/${bg}`);
  }
  if(!s.registry.includes('v3/s4-a6-ux2-chrome-palette-check.mjs')||!s.registry.includes('v3/s4-a6-ux2-chrome-palette-saturation.mjs'))fail('GATE_REGISTRY','UX2 gates missing');
  if(!s.workflow.includes('node v3/s4-a6-ux2-chrome-palette-check.mjs')||!s.workflow.includes('node v3/s4-a6-ux2-chrome-palette-saturation.mjs')||!s.workflow.includes('browser-s4-a6-ux2-chrome-palette.py'))fail('WORKFLOW_BINDING','dedicated rail incomplete');
  if(/contents:\s*write/i.test(s.workflow))fail('WORKFLOW_WRITE_AUTHORITY','contents:write forbidden');
  if(!s.design.includes('design-tokens.css` è l\'unico owner')||!s.design.includes('solo owner canonico ed effettivo'))fail('DESIGN_AUTHORITY','owner statement drift');
  return f;
}
export function paletteMetrics(tokens){const values=Object.fromEntries(TOKEN_NAMES.map(t=>[t,hexValue(tokens,t)]));return{values,headerLuminance:HEADER.map(t=>luminance(values[t])),footerLuminance:FOOTER.map(t=>luminance(values[t])),onDarkMinContrast:Math.min(...[...HEADER,...FOOTER].map(t=>contrast(values['--chrome-on-dark'],values[t]))),mutedMinContrast:Math.min(...[...HEADER,...FOOTER].map(t=>contrast(values['--chrome-on-dark-muted'],values[t])))};}
