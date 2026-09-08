export const A5_FAILURE_FAMILIES=Object.freeze([
  'rta-order','rta-exact-target','rta-admin-partial','implementation-lock','keyboard','focus-obstruction','reflow','reduced-motion','contrast','target-size','footer-overlap','human-validation-external'
]);
export function contrastRatio(a,b){
 const lum=rgb=>rgb.map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 const [x,y]=[lum(a),lum(b)].sort((m,n)=>n-m);return(x+.05)/(y+.05);
}
export function classifyA5Failure(x){
 if(x.humanValidationNeeded)return'human-validation-external';
 if(!x.rtaOrder)return'rta-order';if(!x.exactTarget)return'rta-exact-target';if(!x.adminPartial)return'rta-admin-partial';
 if(x.oracleTechniqueLocked)return'implementation-lock';if(!x.keyboard)return'keyboard';if(!x.focusVisible||x.focusObstructed)return'focus-obstruction';
 if(x.horizontalOverflow)return'reflow';if(!x.reducedMotion)return'reduced-motion';if(x.contrastRatio<4.5)return'contrast';if(x.targetHeight<44)return'target-size';if(x.footerOverlap>0)return'footer-overlap';return null;
}
export function a5Baseline(){return{rtaOrder:true,exactTarget:true,adminPartial:true,oracleTechniqueLocked:false,keyboard:true,focusVisible:true,focusObstructed:false,horizontalOverflow:false,reducedMotion:true,contrastRatio:7,targetHeight:44,footerOverlap:0,humanValidationNeeded:false};}
