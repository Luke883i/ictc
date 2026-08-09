export function classifyHoldout(text){
  const s=String(text||'').toLowerCase();
  if(s.includes('100000-loop'))return'REJECT_COUNT_AS_COVERAGE';
  if(s.includes('profession, experience'))return'REJECT_INERT_AXIS';
  if(s.includes('novice comprehension'))return'REQUIRE_E4_HUMAN';
  if(s.includes('localstorage'))return'REQUIRE_SERVER_POLICY';
  if(s.includes('ten files'))return'REJECT_TRANSPORT_MISMATCH';
  if(s.includes('only filename'))return'REJECT_FALSE_PRESERVATION';
  if(s.includes('legacy home'))return'REQUIRE_NATIVE_SHELL';
  if(s.includes('environment flags'))return'REQUIRE_BOUND_EVIDENCE';
  if(s.includes('ten thousand audit'))return'REJECT_AUDIT_CEILING';
  if(s.includes('entire growing audit'))return'REQUIRE_SEPARATE_LEDGER';
  if(s.includes('two governed processes'))return'REQUIRE_CURRENT_SOT';
  if(s.includes('security workflow is skipped'))return'DO_NOT_COUNT_SKIPPED';
  if(s.includes('builder authored generator'))return'REQUIRE_E3_RUNTIME';
  if(s.includes('internally stable'))return'BOUND_STABLE_CLAIM';
  return'UNCLASSIFIED';
}
