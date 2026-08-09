# ICTC Control Tower V4 Experimental — Compliance Operating System

## Product outcome
V4 turns the V3 guided GRC control tower into a compliance operating system that remains completely usable without AI. The same canonical objects, ProcessDefinitions, human decisions, receipts, epistemic projection and evidence graph are exposed through three equivalent perspectives:

- **Oggi** — task-centric: what needs attention now.
- **Processi** — process-centric: what compliance lifecycles ICTC manages and how to apply each procedure.
- **Prove** — evidence-centric: what ICTC can demonstrate, where data came from, who decided, on which version, and what remains unproven.

No perspective creates a new authority. They are projections of the same runtime state.

## UX contract
A user must never need to know the correct module name before starting. A knowledgeable user must never be forced through AI routing before opening a process. An auditor must never need developer/database knowledge to reconstruct a closed record.

Every procedure screen answers, above the fold:
1. **Dove sono?** process code + business label.
2. **A cosa serve?** one sentence outcome.
3. **Cosa faccio adesso?** one primary CTA.
4. **Cosa succede dopo?** next checkpoint and expected exit.
5. **Chi decide?** human/AI/external authority boundary.
6. **Che prova resta?** receipt/dossier/trace affordance.

AI affordances are always secondary and marked `AI · proposta`. A manual equivalent exists for every business-critical AI-assisted step.

## Target metrics
| Metric | Target |
|---|---:|
| Business processes discoverable from Processi | 7/7 |
| Business processes directly openable without routing | 7/7 |
| AI-off business journey completion | 7/7 |
| AI-on business journey completion | 7/7 |
| Mandatory AI calls in business state transitions | 0 |
| Human decision authority coverage | 100% |
| Write receipt coverage | 100% |
| Closed-record dossier coverage | 100% |
| Procedure trace coverage | 100% supported subjects |
| Same-as-read export/evidence authorization | 100% |
| Heatmap contribution from unreviewed AI risk | 0 |
| KPI mutation by AI insight | 0 |
| Top-level business navigation items | 3 |
| Primary CTA per active context | <=1 |
| Hidden/unreachable business process | 0 |
| Global search coverage of visible operational subject families | 100% |
| ProcessDefinition core edits for synthetic process | 0 |
| Adversarial routing auto-launch | 0 |
| Auditor write affordances | 0 |
| Regulator-facing unbounded compliance claims | 0 |

## Delivery slices and gates

### S0 — Contract, metrics and semantic ratchet
**Goal:** freeze the V4 outcome before changing behavior.

Subtasks:
- S0.1 document V4 outcome, UX contract, target metrics and boundaries.
- S0.2 define lifecycle presentation phases without changing process ontology.
- S0.3 define AI optionality as a release invariant.
- S0.4 define global no-novelty saturation rule.

Subtask DoD:
- S0.1 names all 7 business processes and 3 permanent shell areas.
- S0.2 every business process belongs to exactly one presentation phase; EV-01 remains proof support.
- S0.3 gate fails when any mandatory business transition requires provider readiness.
- S0.4 deterministic saturation records finding classes and requires 100 subsequent scenarios without a new class before convergence.

Slice DoD: one ProcessDefinition authority; no new store, decision model or evidence graph; target metrics are machine-checkable where possible.

### S1 — Hybrid Process Landscape
**Goal:** make Processi a usable compliance-program view, not a card dump.

Presentation phases:
1. **Osserva & delimita** — RN-01, AO-01.
2. **Valuta & collega** — MC-01, RC-01.
3. **Agisci & rispondi** — AP-01, EC-01.
4. **Assicura & dimostra** — AR-01, with EV-01 proof support.

Subtasks:
- S1.1 add `processLandscapeProjection` derived from procedure hub + work queue + review inbox.
- S1.2 add `/api/process-landscape` and bootstrap projection.
- S1.3 render lifecycle map above existing procedure cards.
- S1.4 add purpose, current attention, next checkpoint and proof produced.
- S1.5 preserve direct `Apri procedura` without AI/intent routing.

Subtask DoD: role-visible processes exactly once; read-only endpoint; map usable on narrow viewport and keyboard order; each node has purpose/status/CTA/checkpoint/proof; direct opening works with LLM unconfigured.

Slice DoD: 7/7 business services visible to admin; role scope preserved; no new permanent nav; ProcedureHub remains exhaustive fallback.

### S2 — AI Independence
**Goal:** every business lifecycle is valid with AI disabled.

Subtasks:
- S2.1 RN-01 manual plan creation/revision.
- S2.2 RN-01 manual observation/source intake when automated discovery is unavailable.
- S2.3 AR-01 human draft path independent of AI proposal.
- S2.4 normalize assurance approval to approve a draft with authority `human` or `ai-assist`.
- S2.5 add AI-off gate for RN/EC/AO/MC/AP/RC/AR.

Subtask DoD: needs-plan mission can receive human plan; manual source observation preserves provenance/receipt; assurance can approve with no AI trace; approval binds request/draft/answers digests; no mandatory transition fails because provider is absent.

Slice DoD: AI-off and AI-on journeys reach semantically equivalent human checkpoints; AI changes assist trace only, never decision authority.

### S3 — Cross-process handoffs
**Goal:** remove lifecycle dead ends between identification, assessment and remediation.

Subtasks:
- S3.1 RN verified source → human impact record → MC/AP handoff.
- S3.2 MC gap → AP action with originType/originId.
- S3.3 RC treatment `mitigate` → AP action.
- S3.4 EC event → affected object/risk/action relations.
- S3.5 render handoff CTA only when permitted by role.

Subtask DoD: impact is human-recorded and never legal applicability; generated action carries canonical origin; mitigation links action while accept/avoid/transfer are reasoned human decisions; incident relations preserve original; no unauthorized CTA.

Slice DoD: source→impact→gap→action→verified closure and incident→object→risk→treatment/action chains are reconstructible.

### S4 — Risk and remediation fidelity
**Goal:** raise RC/AP to defensible enterprise lifecycle without new modules.

Subtasks:
- S4.1 distinguish inherent vs residual human risk assessments.
- S4.2 add treatment decision mitigate/accept/avoid/transfer.
- S4.3 AP adds `ready-for-review` and `closed` semantics.
- S4.4 closure requires review reason + evidence refs and distinct review event.
- S4.5 heatmap labels assessment basis.

Subtask DoD: AI never populates human portfolios; treatment is canonical human decision; executor completion != verified closure; closure without evidence/reason fails; heatmap basis explicit/deterministic.

Slice DoD: risk→treatment→action→completion→verification is traceable without interpreting raw audit text.

### S5 — Evidence & Trace Explorer
**Goal:** make Prove the regulator/auditor entrypoint to the evidence graph.

Subtasks:
- S5.1 expose ProcedureTrace list/filter/search in Prove.
- S5.2 show original/provenance, AI assist, human decisions, epistemic state, audit/receipts, evidence and limitations.
- S5.3 subject-scoped dossier download.
- S5.4 preserve Standard Proof posture/readiness separately.
- S5.5 forbid synthesized unbounded compliance status.

Subtask DoD: auditor can find any visible supported subject without IDs; trace sections declare authority; download auth=same-as-read; deployment readiness remains distinct; forbidden claim patterns fail a static gate.

Slice DoD: a random closed supported record is explainable end-to-end from UI alone.

### S6 — Novice-safe web experience
**Goal:** reduce cognitive error without reducing professional capability.

Subtasks:
- S6.1 real operational entry controls for objective/url/text/file/internal reference.
- S6.2 global search includes all visible GRC subject families.
- S6.3 auditor copy uses consultation verbs and exposes zero mutation CTA.
- S6.4 receipt pulse has business labels for all GRC/V4 writes.
- S6.5 contextual `Cosa succede dopo` and `Perché serve` copy in every process.
- S6.6 mobile/progressive-disclosure/focus gate.

Subtask DoD: selected input type has matching payload shape; search covers GRC+legacy; auditor sees no mutate verbs/buttons; every runtime write maps to intelligible receipt text; first-time user can infer next human action; primary CTA remains visible at narrow viewport.

Slice DoD: novice, distracted, under-pressure, expert and hostile-auditor deterministic journeys complete without dead-end.

### S7 — Saturation, no-novelty and release seal
**Goal:** prove the candidate rather than exercise happy paths.

Subtasks:
- S7.1 fix primary-action overflow falsifier so it can fail.
- S7.2 separate state-space saturation from language-routing saturation.
- S7.3 adversarial routing corpus: synonyms, typos, ambiguity, mixed intents, regulatory jargon, irrelevant text.
- S7.4 >=100k state-space saturation.
- S7.5 novelty tracker: after convergence execute +100 deterministic scenarios and require zero new finding class.
- S7.6 exact-head browser journey AI OFF.
- S7.7 exact-head browser journey AI ON.
- S7.8 exact-head all-workflow readback and PR attestation.

Subtask DoD: injecting multiple primaries fails test; reports separate state/language counts; routing never auto-launches; state saturation has zero authority/metric/heatmap/coverage/dead-end primitive failures; noveltyTail>=100 with zero new finding class; 7/7 AI-off and 7/7 AI-on journeys pass; exact head has no candidate failures/pending at attestation.

## Global Definition of Done
V4 is DONE only if all conditions are true on the same exact head.

### Discoverability and usability
- [ ] Oggi, Processi, Prove are the only permanent business navigation areas.
- [ ] Admin sees exactly 7 business services in Processi plus EV-01 proof support.
- [ ] Every business service opens directly from Processi with AI disabled.
- [ ] Every procedure exposes purpose, current state, one primary CTA, next checkpoint, authority and proof outcome.
- [ ] No role-visible process is reachable only through AI routing.

### AI independence and authority
- [ ] RN/EC/AO/MC/AP/RC/AR each pass AI-OFF E2E.
- [ ] RN/EC/AO/MC/AP/RC/AR each pass AI-ON E2E.
- [ ] AI produces only assist/proposal artifacts.
- [ ] Human decisions are explicit, reasoned and version/digest bound.
- [ ] No AI output mutates heatmap, KPI, work priority or final approval directly.

### Process fidelity
- [ ] RN: source → human impact → mapping/action handoff.
- [ ] AO: candidate → review → active → freshness review → retirement.
- [ ] MC: requirement → mapping → decision → gap → remediation → reassessment.
- [ ] RC: identification → inherent assessment → controls → residual assessment → treatment → monitoring.
- [ ] AP: origin → adoption → execution → ready-for-review → evidence-backed verification → closed.
- [ ] AR: original request → human or AI-assisted draft → human review → approval → dossier.
- [ ] EC: original → clarification/formulation → submit/close → linked object/risk/action remediation.

### Traceability and proof
- [ ] Every write has a receipt.
- [ ] Every supported subject has ProcedureTrace.
- [ ] Every AI intervention exposes trace digests/limitations.
- [ ] Every human checkpoint is visible in DecisionProjection.
- [ ] Every closed supported record has a downloadable same-as-read dossier.
- [ ] Standard Proof distinguishes operational evidence from deployment/readiness claims.
- [ ] No unbounded compliance/certification claim is rendered.

### Architecture
- [ ] one ontology authority; one relation grammar; one ProcessDefinition registry; one human DecisionProjection; one EpistemicProjection; one evidence graph/store authority; one active UI composition; one shared GRC workspace; no process-specific top-level nav; synthetic new ProcessDefinition requires zero core edits.

### Security and role boundaries
- [ ] same-as-read for exports/dossiers/traces; auditor write affordances=0; user cannot approve admin-only checkpoints; local role switch remains loopback/developer-bound and trusted-header deployment remains server-authoritative.

### Saturation and release
- [ ] state-space scenarios >= 100,000.
- [ ] adversarial language cases >= 10,000 deterministic cases.
- [ ] novelty tail >= 100 with zero new finding class.
- [ ] primary-action overflow falsifier is non-tautological.
- [ ] exact-head V1/V2/V3 regression rails green.
- [ ] exact-head V4 semantic/runtime/browser rails green.
- [ ] `main` unchanged until explicit human merge authorization.
- [ ] PR remains draft until exact-head attestation.

## Release claim boundary
**V4 Experimental ready to use** means a coherent, AI-optional, end-to-end controlled compliance operating baseline with bounded evidence and traceability. It does not mean legal compliance, certification, production hardening, HA, DR, external assessor approval, complete legal universe, complete asset discovery or perfect data quality.
