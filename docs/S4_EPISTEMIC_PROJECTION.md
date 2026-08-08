# S4 — EPISTEMIC-PROJECTION

## Outcome

ICTC exposes one role-scoped epistemic projection derived from authoritative runtime records and the S3 human DecisionRecord projection. No epistemic state is persisted as a competing source of truth.

## Grammar

The projection is intentionally multidimensional:

- `original`: preserved-original / observed / unavailable;
- `proposal`: none / ai-proposed;
- `checkpoint`: awaiting-human-decision / human-reviewed / human-verified / human-rejected / superseded;
- `availability`: available / unavailable;
- `assessment`: not-assessed.

`unknown`, `unavailable` and `not-assessed` remain distinct concepts. An AI proposal can coexist with an awaiting-human-decision checkpoint and can never derive human-reviewed or human-verified by itself.

## Authority

Source authority remains external-source or external-master as appropriate. Incident organizational decisions remain human. The projection describes epistemic posture; it does not acquire decision authority.

## DoD

- one epistemic projection;
- one vocabulary exposed through runtime ontology;
- AI-only source cannot become human-reviewed or human-verified;
- internal master authority remains explicit;
- private incident epistemic records remain role-scoped;
- not-assessed remains distinct from unavailable;
- bootstrap semantic ratchet advances without a second browser vocabulary.

## Weld to S5

S5 may reference epistemic records from the canonical evidence graph and exports. It must not infer stronger claims than the epistemic facets support.
