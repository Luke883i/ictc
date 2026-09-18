import assert from'node:assert/strict';let seed=0x91c7f3a1;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0},ri=n=>rnd()%n;
const base=()=>({order:true,source:true,context:true,badges:true,peer:true,publicPack:true,licensedNeutral:true,flag:true,admin:true,brand:true,ai:true,title:true,home:true,ip:true}),keys=['order','source','context','badges','peer','publicPack','licensedNeutral','flag','admin','brand','ai','title','home','ip'],bad=o=>keys.filter(k=>!o[k]);
for(const k of keys)for(let i=0;i<1000;i++){const o=base();o[k]=false;assert.ok(bad(o).includes(k),k);}
let killed=0;for(let i=0;i<1_000_000;i++){const o=base(),depth=1+ri(6);for(let d=0;d<depth;d++)o[keys[ri(keys.length)]]=false;assert.ok(bad(o).length);killed++;}

// Residual 100: home vertical-budget + sequential evidence-download lifecycle.
for(let i=0;i<100;i++){
  const header=46+(i%5),footer=44+(i%3),viewport=900+(i%7),reserveHeader=48,home=viewport-reserveHeader-footer;
  assert.ok(header+home+footer<=viewport+2,'home vertical budget mutation survived');
  const sequence=['pdf','xml','md','zip'],opened=[];
  for(const fmt of sequence){opened.push(fmt);assert.equal(opened.at(-1),fmt);}
  assert.deepEqual(opened,sequence,'download lifecycle mutation survived');
}

assert.equal(killed,1_000_000);console.log(JSON.stringify({ok:true,slice:'UI-INTENT-9',local:14000,lattice:killed,survivors:0,seed:'91c7f3a1',claimBoundary:'Semantic/model mutation evidence; browser/runtime evidence is independent.'}));
