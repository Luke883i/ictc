const list = value => Array.isArray(value) ? value : [];

export function buildSupportBundle(data, options = {}) {
  const integrity = data?.meta?.integrity || {};
  return {
    schemaVersion: '1.0.0',
    generatedAt: options.generatedAt || new Date().toISOString(),
    correlationId: options.correlationId || 'local-correlation-id',
    service: {
      name: 'ictc-v3',
      version: data?.meta?.version || 'unknown',
      profile: 'current',
      localSot: true
    },
    integrity: {
      ok: Boolean(integrity.ok),
      eventCount: Number(integrity.eventCount || 0),
      headPrefix: integrity.head ? String(integrity.head).slice(0, 16) : null
    },
    counts: {
      sources: list(data?.sources).length,
      findings: list(data?.findings).length,
      changes: list(data?.changes).length,
      matters: list(data?.matters).length,
      jobs: list(data?.jobs).length,
      projectedObjects: Object.keys(data?.objectIndex || {}).length,
      semanticRelations: list(data?.views?.semanticGraph?.edges).length
    },
    capabilities: list(data?.views?.supply).map(item => ({
      id: item.id,
      label: item.label,
      state: item.epistemicStatus,
      limitation: list(item.limitations)[0] || 'non disponibile'
    })),
    redactions: [
      'payload del ledger',
      'contenuto dei file',
      'locator e URL delle fonti',
      'racconti degli eventi',
      'messaggi dell’assistente',
      'motivazioni e note libere'
    ],
    limitations: [
      'Il bundle descrive salute e struttura locale; non attesta correttezza sostanziale dei dati.',
      'Non sostituisce telemetria centralizzata, tracing distribuito o raccolta forense.',
      'Il correlationId è locale e non costituisce identità forte dell’attore.'
    ]
  };
}

export function hasForbiddenSupportData(value) {
  const text = JSON.stringify(value).toLowerCase();
  return ['narrative','locator','contentbase64','payload','rationale','assistant messages'].some(key => text.includes(`"${key}"`));
}
