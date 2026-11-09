// Independent, strict readback oracle; no duplicate services or aliases accepted.
export function exactProcedureSet(actual,expected){
  return Array.isArray(actual)&&Array.isArray(expected)&&expected.length===7&&
    actual.length===7&&new Set(expected).size===7&&new Set(actual).size===7&&
    actual.every(x=>typeof x==='string'&&expected.includes(x));
}
export function validateRuntimeHealth(payload,canonicalIds,expectedVersion){
  const failures=[];
  const check=(label,value)=>{if(!value)failures.push(label);};
  check('health-payload',payload?.ok===true);
  check('exact-enabled-procedure-set',exactProcedureSet(payload?.services,canonicalIds));
  check('exact-supported-procedure-set',exactProcedureSet(payload?.supportedServices,canonicalIds));
  check('canonical-version',payload?.version===expectedVersion);
  check('integrity-verdict',payload?.integrity?.ok===true||payload?.integrity?.valid===true);
  return {ok:failures.length===0,failures,integrityOK:!failures.includes('integrity-verdict'),procedureCount:Array.isArray(payload?.services)?new Set(payload.services).size:0};
}
