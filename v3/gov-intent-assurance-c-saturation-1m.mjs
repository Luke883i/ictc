import {runSaturation} from './gov-intent-assurance-lib.mjs';
const argv=process.argv.slice(2),arg=(k,d)=>{const i=argv.indexOf(k);return i>=0?argv[i+1]:d};
const result=runSaturation('C',{trials:Number(arg('--trials','1000000')),tail:Number(arg('--tail','100000')),seed:BigInt(arg('--seed','10723151780598845931'))});
console.log(JSON.stringify(result));
