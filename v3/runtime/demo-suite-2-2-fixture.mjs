import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

export const DEMO_SUITE_22_VERSION='2.2';
export const DEMO_SUITE_22_ENV='ICTC_DEMO_SUITE';
export const DEMO_SUITE_22_EXPECTED_DIGEST='4266e20a3a89efe65d9e1d050b81fbaaccbccd378e81f28b8e26d0a51c46d61e';
const PARTS=['01','02','03'];
const encoded=(await Promise.all(PARTS.map(part=>readFile(new URL(`../demo/demo-suite-2-2-fixture-${part}.b64`,import.meta.url),'utf8')))).join('').replace(/\s+/g,'');
export const DEMO_SUITE_22_MANIFEST=Object.freeze(JSON.parse(gunzipSync(Buffer.from(encoded,'base64')).toString('utf8')));
export const DEMO_SUITE_22_ID=DEMO_SUITE_22_MANIFEST.id;
export const DEMO_SUITE_22_SCENARIO=Object.freeze({...structuredClone(DEMO_SUITE_22_MANIFEST),records:undefined});
