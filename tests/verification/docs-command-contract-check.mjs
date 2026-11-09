import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here,'../..');
const normativeFiles = ['README.md','docs/DEVELOPMENT.md','docs/TESTING.md','.github/PULL_REQUEST_TEMPLATE.md','docs/OPERATIONS.md','docs/RELEASE.md','docs/RUN_PROFILES.md','docs/SECURITY_HARDENING.md'];
const launcherCommands = new Set(['start','demo','stop','restart','status','logs','doctor','test','audit','help','codespace']);

function isDocumentedCommand(text) { return /^(?:npm\s+(?:ci(?:\s+--ignore-scripts)?|start|test|run\s+\S+)|\.\/ictc\.sh\s+\S+|(?:ICTC_RELEASE_RUNTIME_WITNESS=\S+\s+)?node\s+(?:(?:src\/lib|tests\/verification|scripts|v3)\/)\S+)/.test(text.trim()); }
function collectCommands(text) { const commands=[];let fenced=false;for(const line of text.split(/\r?\n/)){const trimmed=line.trim();if(/^```/.test(trimmed)){fenced=!fenced;continue;}if(fenced&&isDocumentedCommand(trimmed))commands.push(trimmed);if(!fenced&&!(/script storici/i.test(line)&&/non sono comandi definiti/i.test(line))){for(const match of line.matchAll(/`([^`\n]+)`/g)){const candidate=match[1].trim();if(isDocumentedCommand(candidate))commands.push(candidate);}}}return[...new Set(commands)]; }
async function exists(rel){try{await stat(path.join(root,rel));return true;}catch{return false;}}
function validateNpm(command,scripts){if(command==='npm ci'||command==='npm ci --ignore-scripts')return null;if(command==='npm start')return scripts.start?null:'npm start documented but package script start is missing';if(command==='npm test')return scripts.test?null:'npm test documented but package script test is missing';const run=command.match(/^npm\s+run\s+([A-Za-z0-9:_-]+)$/);if(!run)return`unsupported npm command shape: ${command}`;return Object.hasOwn(scripts,run[1])?null:`documented npm script does not exist: ${run[1]}`;}
function validateLauncher(command){const tokens=command.split(/\s+/),subcommand=tokens[1];if(subcommand==='codespace')return tokens.length===2?null:'codespace alias accepts no extra arguments';if(!launcherCommands.has(subcommand))return`unsupported ictc.sh command: ${subcommand||'missing'}`;for(let i=2;i<tokens.length;i+=1){const token=tokens[i];if(token==='--no-open'&&(subcommand==='start'||subcommand==='demo'))continue;if((token==='--demo-seed'||token==='-demoseed')&&subcommand==='start')continue;if(token==='--profile'){const profile=tokens[++i];if(profile==='current'||profile==='v3')continue;return`unsupported ictc.sh profile: ${profile||'missing'}`;}return`unsupported ictc.sh option for ${subcommand}: ${token}`;}return null;}
async function validateNode(command) {
  const withWitness=command.startsWith('ICTC_RELEASE_RUNTIME_WITNESS=');
  const normalized=withWitness?command.replace(/^ICTC_RELEASE_RUNTIME_WITNESS=\S+\s+(?=node\s)/,''):command;
  const match=normalized.match(/^node\s+((?:src\/lib|tests\/verification|scripts|v3)\/[A-Za-z0-9_./-]+\.(?:mjs|js))(?:\s+(.+))?$/);
  if(!match)return`unsupported node command shape: ${command}`;
  const [,target,args='']=match;
  if(target.startsWith('v3/'))return`retired migration path documented as executable: ${target}`;
  if(!await exists(target))return`documented node target does not exist: ${target}`;
  if(withWitness&&!['tests/verification/release-readiness-e2-runtime.mjs','tests/verification/release-readiness-e2-check.mjs'].includes(target))return`witness scope not allowed for ${target}`;
  const allowed = args==='' ||
    (target==='src/lib/trama-engineering.mjs'&&/^--intent\s+(?:"[^"\n]+"|'[^'\n]+'|\S+)\s+--phase\s+(?:PLAN|ACT)$/.test(args)) ||
    (target==='tests/verification/governance-free-private-check.mjs'&&args==='--self-test') ||
    (target.startsWith('scripts/')&&args==='--falsify') ||
    (target==='scripts/repository-retirement-mutations.mjs'&&args==='--cases=1 --negatives=1 --exhaustive-proof') ||
    (target==='tests/verification/release-readiness-e2-check.mjs'&&args==='--require-release') ||
    (target==='scripts/recovery-cli.mjs'&&/^(?:backup\s+--tenant\s+\S+\s+--destination\s+\S+|restore\s+--source\s+\S+\s+--target\s+\S+)$/.test(args));
  return allowed?null:`unsupported node arguments for ${target}: ${args}`;
}
const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')),errors=[],observations=[];for(const rel of normativeFiles){const text=await readFile(path.join(root,rel),'utf8'),commands=collectCommands(text);observations.push({file:rel,commands});for(const command of commands){let error=null;if(command.startsWith('npm '))error=validateNpm(command,pkg.scripts||{});else if(command.startsWith('./ictc.sh '))error=validateLauncher(command);else if(command.startsWith('node ')||command.startsWith('ICTC_RELEASE_RUNTIME_WITNESS='))error=await validateNode(command);if(error)errors.push({file:rel,command,error});}}
const result={schemaVersion:3,check:'docs-command-contract',ok:errors.length===0,normativeFiles,observations,errors,boundary:'Validates that normative npm/ictc.sh/node commands documented in selected operational surfaces exist and use supported shapes; it does not prove the behavioral correctness of those commands.'};await mkdir(path.join(root,'artifacts'),{recursive:true});await writeFile(path.join(root,'artifacts','docs-command-contract.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(!result.ok)process.exit(1);
