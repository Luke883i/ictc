export function prepareChildProcess(child,{drainStdout=true,drainStderr=true}={}){
  if(!child)return child;
  if(drainStdout)child.stdout?.resume();
  if(drainStderr)child.stderr?.resume();
  return child;
}

export function childIsRunning(child){
  return Boolean(child)&&child.exitCode===null&&child.signalCode===null;
}

export async function closeChildProcess(child,{graceMs=1200,timeoutMs=5000}={}){
  if(!child)return;
  prepareChildProcess(child);
  if(childIsRunning(child)){
    await new Promise((resolve,reject)=>{
      let forceTimer,failTimer,settled=false;
      const cleanup=()=>{
        clearTimeout(forceTimer);clearTimeout(failTimer);
        child.off('close',done);child.off('error',failed);
      };
      const done=()=>{if(settled)return;settled=true;cleanup();resolve();};
      const failed=error=>{if(settled)return;settled=true;cleanup();reject(error);};
      child.once('close',done);child.once('error',failed);
      if(!childIsRunning(child)){done();return;}
      forceTimer=setTimeout(()=>{
        if(!childIsRunning(child))return;
        try{child.kill('SIGKILL');}catch(error){failed(error);}
      },graceMs);
      failTimer=setTimeout(()=>failed(new Error(`child ${child.pid||'unknown'} did not close after ${timeoutMs}ms`)),timeoutMs);
      try{child.kill('SIGTERM');}catch(error){failed(error);}
    });
  }
  child.stdout?.destroy();
  child.stderr?.destroy();
}
