const stages=[
  ['fixture','./runtime/demo-suite-2-2-fixture.mjs'],
  ['foundation','./runtime/demo-suite-2-2-replay-foundation.mjs'],
  ['work','./runtime/demo-suite-2-2-replay-work.mjs'],
  ['replay','./runtime/demo-suite-2-2-replay.mjs'],
  ['materializer','./runtime/demo-suite-2-2.mjs']
];
for(const [stage,path] of stages){
  try{
    await import(path);
    console.log('demo-suite-2-2-module-load: '+stage+' ok');
  }catch(error){
    console.error('demo-suite-2-2-module-load: '+stage+' failed',error);
    process.exitCode=1;
    break;
  }
}
if(!process.exitCode)console.log('demo-suite-2-2-module-load: ok');
