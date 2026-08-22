# Native Semantic Lattice 3.2 — DoD

## Stato target

**ICTC Enterprise Compliance Workspace 3.2 — Native Semantic Lattice**.

Semantic Composition 3.1 resta il contratto di gerarchia globale acquisito con PR #98. La 3.2 riduce il runtime globale a annotazione/authority metadata e delega la composizione locale a owner espliciti di superficie, senza nuove business write authority e senza nuovi participant C0.1.

## DoD globale

1. Esistono esattamente sette processi business; EP-01 resta cross-cutting e non diventa un ottavo processo.
2. `semantic-composition-runtime.js` contiene zero adapter locali, zero business-copy rewrite e zero local DOM reorder.
3. Gli owner locali convergono prima dell'annotazione globale; C0.1 conserva `harmonization -> presentation -> integrity -> journey -> annotation`.
4. Catalogo e workspace non condividono lo stesso copy: `catalogueSummary != workspacePurpose` per 7/7 procedure.
5. Il catalogo Processi usa capability card a matrice 3 -> 2 -> 1; le collezioni di record omogenei restano list/row.
6. Home presenta identità e funzione aziendale di ICTC prima della bounded attention queue; nessuna dashboard numerica autonoma.
7. Evidenze ICTC apre Decisioni e organizza progressivamente Evidenze e basi, Verifiche esterne, Integrità/Export e metodo di lettura.
8. EP-01 rende ricerca/relazioni primarie; compression, summary, boundary e dettagli tecnici sono progressivi.
9. Admin esplicita che la disponibilità procedure controlla nuovo lavoro/routing/automazioni e non applicabilità legale; conferma solo su diff.
10. Header/footer usano chrome scuro a gradiente e controlli/contrasti chiari senza usare colore come giudizio di conformità.
11. 320/390 px non introducono overflow orizzontale nelle superfici coperte.
12. La slice è falsificata da gate statico, UI statico, 10M mutation saturation, event stress e browser journey; exact-head CI resta acceptance separata.

## DoD intermedi — reticolo di authority

- Foundation 3.0 -> local native owners 3.2 -> global semantic annotation -> C0.1 final convergence.
- Proof, EP-01, GRC, Admin e dialoghi possiedono adapter locali isolati; nessuno registra un participant C0.1.
- Root condivisi (GRC) non vengono risolti dal kernel globale: l'identità attiva è responsabilità del local owner.
- Business Surface 2.7 e Visual Epistemic Runtime restano bridge di compatibilità e non recuperano copy ownership.

## DoD locali

- **Home**: `PRODUCT_PROPOSITION` unica; max 5 attività; severity prima del volume.
- **Processi**: 7 card, nessuna label `fonte + decisione / prova / scope + mapping`; descrizioni di significato compliance; una CTA.
- **Procedure**: workspace purpose compatto, lavoro prima di KPI/matrici/trace.
- **Evidenze**: Decisioni default open; interpretazione tecnica chiusa; 4 domini espliciti.
- **EP-01**: search visible; `Regole e dettagli della vista` chiuso; raw/summary/compression non primari.
- **Admin**: `Disponibilità operativa dei processi`; CTA `Salva disponibilità operativa`; acknowledgement visibile solo se esiste un diff.
- **Navigazione**: command palette a colonna singola, senza pane bianco riservato.
- **Visuale**: header navy->blue, footer deep-navy, business surfaces bianche, indigo azioni/selezione, teal evidenza/provenienza, amber attenzione.

## Metriche

- Local adapters in global semantic runtime: **0**.
- Business-copy rewrites in global semantic runtime: **0**.
- Local DOM reorders in global semantic runtime: **0**.
- Procedure coverage: **7/7**.
- Mutation campaign: **10,000,000 / 10,000,000** killed nel vocabolario dichiarato.
- Normalized mutation families: **220**.
- Last novel family: **M=960**.
- No novelty after M: **9,999,039** trial; requisito M+10,000 soddisfatto.
- Holdout: **100,000**, nuove famiglie **0**.
- Event/replay stress: **1,000,000** scenari.
- Workbook v1.1 + Iter1bis target coverage: **173/173 requisiti indirizzati**; **172/173 localmente verificabili**, con exact-head CI come gate esterno.

## Limiti

Le campagne deterministiche sono bounded model evidence. Non costituiscono parere legale, studio con utenti, certificazione di accessibilità, assessment di sicurezza del deployment o assurance indipendente. Il merge richiede osservazione dell'exact PR HEAD e dei check GitHub applicabili.
