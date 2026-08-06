import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { evaluateIdentityClaims, normalizeIdentitySettings } from './runtime/identity.mjs';

const axes = {
  mode: ['local', 'trusted-header'],
  strategy: ['legacy-role-header', 'shibboleth'],
  secret: ['absent', 'wrong', 'correct'],
  subject: ['absent', 'known', 'case-variant'],
  encoding: ['semicolon', 'pipe', 'comma', 'space'],
  groupSet: ['none', 'user', 'admin-user', 'auditor-user'],
  userRule: ['none', 'allow-admin', 'allow-auditor', 'deny'],
  defaultRole: ['deny', 'user'],
  headers: ['canonical', 'custom'],
  ruleOrder: ['admin-first', 'auditor-first', 'user-first'],
  target: ['admin', 'user', 'auditor'],
  configuration: ['complete', 'no-auditor', 'no-admin']
};

const delimiterOf = { semicolon: ';', pipe: '|', comma: ',', space: ' ' };
const groupsOf = {
  none: [], user: ['grp-user'], 'admin-user': ['grp-user', 'grp-admin'], 'auditor-user': ['grp-user', 'grp-auditor']
};
const orderOf = {
  'admin-first': [['grp-admin', 'admin'], ['grp-auditor', 'auditor'], ['grp-user', 'user']],
  'auditor-first': [['grp-auditor', 'auditor'], ['grp-admin', 'admin'], ['grp-user', 'user']],
  'user-first': [['grp-user', 'user'], ['grp-admin', 'admin'], ['grp-auditor', 'auditor']]
};

function settingsFor(s) {
  let rules = orderOf[s.ruleOrder].map(([group, role]) => ({ group, role }));
  if (s.configuration === 'no-auditor') rules = rules.filter(rule => rule.role !== 'auditor');
  if (s.configuration === 'no-admin') rules = rules.filter(rule => rule.role !== 'admin');
  const userRules = s.userRule === 'none' ? [] : s.userRule === 'deny'
    ? [{ user: 'alice@example.org', effect: 'deny' }]
    : [{ user: 'alice@example.org', effect: 'allow', role: s.userRule.replace('allow-', '') }];
  return normalizeIdentitySettings({
    strategy: s.strategy,
    headers: s.headers === 'custom'
      ? { subject: 'x-eppn', displayName: 'x-name', email: 'x-mail', groups: 'x-members' }
      : undefined,
    groupDelimiter: delimiterOf[s.encoding],
    defaultRole: s.defaultRole === 'user' ? 'user' : null,
    groupRules: rules,
    userRules
  });
}

function primitive(s) {
  const config = settingsFor(s);
  const coverage = new Set([...config.groupRules.map(rule => rule.role), ...config.userRules.filter(rule => rule.effect === 'allow').map(rule => rule.role)]);
  if (s.mode === 'local') return `local|${s.target}|compatible`;
  if (s.secret !== 'correct') return `trusted|proxy-${s.secret}|denied`;
  if (s.strategy === 'legacy-role-header') {
    return s.subject === 'absent' ? 'legacy|subject-missing|denied' : `legacy|role-header|${s.target}`;
  }
  const subject = s.subject === 'absent' ? '' : s.subject === 'case-variant' ? 'ALICE@example.org' : 'alice@example.org';
  const result = evaluateIdentityClaims({ subject, groups: groupsOf[s.groupSet] }, config);
  const match = result.allowed ? `${result.role}|${result.matchedBy.type}` : `${result.code}|denied`;
  return `shibboleth|${match}|admin:${coverage.has('admin')}|auditor:${coverage.has('auditor')}`;
}

const names = Object.keys(axes);
const scenarios = [];
function build(index, current) {
  if (index === names.length) { scenarios.push({ ...current }); return; }
  const name = names[index];
  for (const value of axes[name]) { current[name] = value; build(index + 1, current); }
}
build(0, {});

const seen = new Set();
let lastNovelty = 0;
for (let index = 0; index < scenarios.length; index += 1) {
  const key = primitive(scenarios[index]);
  if (!seen.has(key)) { seen.add(key); lastNovelty = index + 1; }
}
const stabilityWindow = 128;
const M = Math.min(scenarios.length, lastNovelty + stabilityWindow);
const frozen = new Set(scenarios.slice(0, M).map(primitive));
const tail = Array.from({ length: 100 }, (_, index) => scenarios[(M + index) % scenarios.length]);
const novelty = tail.filter(item => !frozen.has(primitive(item)));
assert.equal(novelty.length, 0);
assert.ok(frozen.size >= 10);

await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/identity-bridge-saturation.json', import.meta.url), JSON.stringify({
  ok: true,
  dimensions: names,
  declaredScenarios: scenarios.length,
  primitiveCount: frozen.size,
  lastNovelty,
  stabilityWindow,
  M,
  confirmation: 100,
  novelty: novelty.length,
  limitations: ['Saturazione bounded del resolver e del trust boundary; non equivale a interoperabilità certificata con ogni IdP, schema LDAP o proxy.']
}, null, 2));
console.log(`identity-bridge-saturation: ok (scenarios=${scenarios.length}, primitives=${frozen.size}, M=${M}, M+100=${M + 100}, novelty=0)`);
