import assert from 'node:assert/strict';

export function assertActiveInstallers(source,names,{label='active experience'}={}){
  const start=source.indexOf('const INSTALL_ORDER');
  const end=source.indexOf('export function installActiveExperience');
  assert.ok(start>=0&&end>start,`${label} must expose an inspectable INSTALL_ORDER before installActiveExperience`);
  const pipeline=source.slice(start,end);
  for(const name of names){
    const matches=pipeline.match(new RegExp(`\\b${name}\\b`,'g'))||[];
    assert.equal(matches.length,1,`${label}: ${name} must appear exactly once in INSTALL_ORDER`);
  }
  assert.match(source,/for \(const install of INSTALL_ORDER\) install\(\);/,`${label} must use one install executor`);
  return{installers:names.length,pipelineStart:start,pipelineEnd:end};
}
