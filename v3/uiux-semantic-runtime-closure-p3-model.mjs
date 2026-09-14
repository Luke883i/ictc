export const P3_MUTATION_FLAGS=Object.freeze({
  duplicateRegistryHeading:1<<0,
  ambiguousCount:1<<1,
  splitControlRail:1<<2,
  mergedBoundaryPurpose:1<<3,
  nullAmplification:1<<4,
  untypedStateAxis:1<<5,
  hierarchyInversion:1<<6,
  contextlessMapping:1<<7,
  ambiguousShortcutGlyph:1<<8,
  providerProtocolMismatch:1<<9,
  referenceOriginUnknown:1<<10,
  unverifiedProviderConfig:1<<11,
  missingOfficialSourcePath:1<<12,
  colorOnlyState:1<<13,
  competingPrimaryAction:1<<14,
  rawTechnicalFirstPlane:1<<15,
  typedVisibleCount:1<<16,
  canonicalControlRail:1<<17,
  providerAdapterBoundary:1<<18,
  contentProvenanceBoundary:1<<19,
  contextualMappingEntry:1<<20,
  keyboardLegendCanonical:1<<21
});
const F=P3_MUTATION_FLAGS;
export const P3_FORBIDDEN_MASK=F.duplicateRegistryHeading|F.ambiguousCount|F.splitControlRail|F.mergedBoundaryPurpose|F.nullAmplification|F.untypedStateAxis|F.hierarchyInversion|F.contextlessMapping|F.ambiguousShortcutGlyph|F.providerProtocolMismatch|F.referenceOriginUnknown|F.unverifiedProviderConfig|F.missingOfficialSourcePath|F.colorOnlyState|F.competingPrimaryAction|F.rawTechnicalFirstPlane;
export const P3_REQUIRED_MASK=F.typedVisibleCount|F.canonicalControlRail|F.providerAdapterBoundary|F.contentProvenanceBoundary|F.contextualMappingEntry|F.keyboardLegendCanonical;
export function convergeSemanticMutation(mask){let value=mask>>>0;value&=~P3_FORBIDDEN_MASK;value|=P3_REQUIRED_MASK;return value>>>0;}
export function p3InvariantSnapshot(mask){const value=mask>>>0;return Object.freeze({forbiddenClear:(value&P3_FORBIDDEN_MASK)===0,requiredPresent:(value&P3_REQUIRED_MASK)===P3_REQUIRED_MASK,singleRegistryOwner:(value&F.duplicateRegistryHeading)===0,typedCounts:(value&F.ambiguousCount)===0&&Boolean(value&F.typedVisibleCount),singleControlRail:(value&F.splitControlRail)===0&&Boolean(value&F.canonicalControlRail),providerPortable:(value&F.providerProtocolMismatch)===0&&Boolean(value&F.providerAdapterBoundary),contentTruthful:(value&F.referenceOriginUnknown)===0&&Boolean(value&F.contentProvenanceBoundary),mappingTaskFirst:(value&F.contextlessMapping)===0&&Boolean(value&F.contextualMappingEntry)});}
