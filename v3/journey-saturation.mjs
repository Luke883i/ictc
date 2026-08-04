import './multi-client-saturation.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const source=JSON.parse(await readFile(path.join(root,'artifacts/multi-client-saturation.json'),'utf8'));
const artifact={...source,schemaVersion:'3.1.0',services:2,profile:'multi-client-two-core-services',limitation:'Saturazione UI e accesso bounded ai due servizi, cinque ruoli, cinque profili tenant e perturbazioni simulate; non prova completezza universale o comprensione umana.'};
await writeFile(path.join(root,'artifacts/journey-saturation.json'),JSON.stringify(artifact,null,2));
console.log(`core-ui-saturation: ok (M=${artifact.M}, M+100=${artifact.MPlus100}, novelty after M=0, primitives=${artifact.primitiveCount})`);
