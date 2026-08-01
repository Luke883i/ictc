export const uxFixture = {
  meta: { version: '1.0.0', integrity: { ok: true, eventCount: 17, head: 'fixture-head' } },
  views: {
    sources: [
      { id: 'source-a', epistemicStatus: 'human-reviewed', data: { id: 'a', lifecycle: 'active' } },
      { id: 'source-b', epistemicStatus: 'candidate', data: { id: 'b', lifecycle: 'candidate' } },
      { id: 'source-c', epistemicStatus: 'observed', data: { id: 'c', lifecycle: 'active' } }
    ],
    findings: [
      { id: 'finding-a', epistemicStatus: 'awaiting-human-review', data: { id: 'fa', humanState: 'awaiting-review' } },
      { id: 'finding-b', epistemicStatus: 'human-reviewed', data: { id: 'fb', humanState: 'reviewed-relevant' } }
    ],
    changes: [
      { id: 'change-a', epistemicStatus: 'awaiting-human-review', data: { id: 'ca', state: 'impact-to-assess' } },
      { id: 'change-b', epistemicStatus: 'awaiting-human-review', data: { id: 'cb', state: 'controls-to-map' } }
    ],
    matters: [
      { id: 'matter-a', epistemicStatus: 'attention-required', data: { id: 'ma', state: 'facts-to-confirm' } },
      { id: 'matter-b', epistemicStatus: 'human-owned', data: { id: 'mb', state: 'assessing' } },
      { id: 'matter-c', epistemicStatus: 'human-reviewed', data: { id: 'mc', state: 'closed' } }
    ],
    traces: [{ id: 'trace-a' }, { id: 'trace-b' }, { id: 'trace-c' }, { id: 'trace-d' }]
  },
  release: { version: '1.0.0', readiness: 'ready', stabilityClass: 'stable-local-single-user' }
};
