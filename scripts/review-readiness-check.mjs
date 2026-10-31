import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessReviewReadiness} from './review-readiness-lib.mjs';
export const REVIEW_READINESS_FILES=Object.freeze(['README.md','CONTRIBUTING.md','docs/START_HERE.md','GOVERNANCE.md','docs/ENGINEERING_GOVERNANCE.md','.github/PULL_REQUEST_TEMPLATE.md','docs/DOCUMENTATION_STANDARD.md']);
export function checkReadiness(root) {
  const source=Object.fromEntries(REVIEW_READINESS_FILES.map(p=>[p,readFileSync(path.join(root,p),'utf8')]));
  const j=p=>JSON.parse(readFileSync(path.join(root,p),'utf8'));
  return assessReviewReadiness(source,{manifest:j('docs/documentation-manifest.json'),release:j('v3/release-identity.json'),owners:j('v3/semantic-owner-contract.json'),gaps:j('v3/gaps.json')});
}
const me=fileURLToPath(import.meta.url);
if(process.argv[1]&&path.resolve(process.argv[1])===me){const root=path.resolve(process.argv[2]||new URL('../',import.meta.url).pathname);const result=checkReadiness(root);console.log(JSON.stringify({control:'review-readiness-E2-observer',...result,claimBoundary:'local E2 text/source consistency only; does not attest GitHub branch protection, real reviewer approval, users or deployment'}));if(!result.ok)process.exitCode=1;}
