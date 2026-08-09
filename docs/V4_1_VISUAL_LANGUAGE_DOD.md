# ICTC V4.1 — Business language & progressive disclosure DoD

## Release intent
V4.1 is a presentation-only epistemic refinement over V4 Enterprise Nexus. Runtime process IDs, authority topology, decision semantics, evidence semantics, workflow states and role permissions do not change. The release improves what an end user sees first, what is progressively disclosed, and how business actions are named.

## Primary-language rules
1. First-level headings use business language understandable outside GRC engineering.
2. Technical lineage terms (mapping, assurance, heatmap, checkpoint, receipt, projection, epistemic, digest, SHA-256, bounded) are allowed only in secondary/proof detail unless they are the object of the user's task.
3. Every process exposes one direct role-aware CTA: `Apri …` for operational roles, `Consulta …` for auditors.
4. AI is named as optional assistance; it never appears as the prerequisite in primary process copy.
5. Each process surface exposes four business answers: purpose, next step, accountable human action, proof that remains.
6. Deep provenance and methodological detail use `<details>` or a dedicated evidence/trace detail panel.

## Screen gates
### Global shell
- Product subtitle: `Compliance operativa e tracciabile`.
- Permanent navigation remains `Oggi / Processi / Prove`.
- Access label is `Profilo`; admin AI action is `Impostazioni AI`.

### Oggi
- Enterprise Nexus remains the primary process overview.
- Guided routing is secondary and titled `Non sai da dove iniziare?`.
- Queue title is `Da fare`; human review title is `Decisioni da confermare`.
- Deterministic insight title is `Indicatori di compliance`; technical basis moves to detail.

### Processi
- Header: `Processi di compliance`.
- Lifecycle map is labelled `Vista per ciclo operativo` and does not imply a mandatory sequence.
- Primary cards use the canonical V4.1 process vocabulary.

### RN-01
- Primary title: `Monitoraggio normativo`.
- Primary description focuses on sources, changes and impact.
- AI planning detail is secondary; manual plan remains first-class.

### EC-01
- Primary title: `Eventi e segnalazioni`.
- Primary action describes registering/managing facts, not AI analysis.
- Technical provenance remains available in the incident workspace.

### AO-01
- Primary title: `Inventario di sistemi e oggetti`.
- Candidate semantics are phrased `Da verificare`; provenance is secondary.

### MC-01
- Primary title: `Controlli e copertura`.
- Primary language avoids `Target IDs` and explains linked objects/controls.
- Gap/N.A./unresolved remain semantically distinct.

### AP-01
- Primary title: `Azioni correttive`.
- `Completa` is not used for execution if verification is still required; use `Invia a verifica`.

### RC-01
- Primary title: `Rischi di compliance`.
- Heatmap primary title becomes `Mappa dei rischi validati`; method and AI overlay are secondary.

### AR-01
- Primary title: `Questionari e verifiche`.
- `Assurance` remains visible only as specialist terminology in detail.
- Manual and AI drafts converge on the same human approval language.

### Prove
- Primary title: `Prove e tracciabilità`.
- Main promise: reconstruct what was recorded, decided and supported.
- Claim boundaries are prominent but not the page headline.
- Standard translation packs are labelled `Riferimenti a standard`.

### Trace explorer
- Primary title: `Ricostruisci una decisione o un fascicolo`.
- Sections use: Origine, Supporto AI, Decisioni umane, Stato e verifiche, Collegamenti, Registro delle modifiche, Limiti.
- Raw epistemic JSON and hashes are progressively disclosed.

## Metrics
- 7/7 business processes use canonical V4.1 primary labels.
- 7/7 process CTAs are direct and role-aware.
- 0 forbidden technical terms in primary process titles/descriptions/CTAs.
- 0 auditor write-affordance wording in primary process entry.
- 100% AI-off process discoverability retained.
- 100,000 heterogeneous lexical scenarios with zero critical clarity findings.
- V1/V2/V3/V4 runtime, authority and browser rails remain green.

## Global DoD
V4.1 is done only when all screen gates are satisfied on the same exact head, the lexical saturation is green, no runtime authority file is changed except presentation labels/edition metadata where explicitly intended, existing process/evidence semantics are unchanged, and all existing CI rails remain green.
