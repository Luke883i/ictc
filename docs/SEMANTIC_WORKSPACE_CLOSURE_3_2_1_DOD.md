# Semantic Workspace Closure 3.2.1 — DoD

Questa slice chiude il gap tra workbook e runtime senza introdurre una nuova business authority.

## Obiettivi
- Le 7 card del catalogo mostrano sempre il `catalogueSummary` workbook-derived e non possono essere deformate da righe elastiche/min-height.
- Ogni workspace mostra `workspacePurpose`, valore operativo e boundary essenziale prima del lavoro.
- Semantic Foundation resta annotativa e non riscrive il business copy posseduto dagli owner 3.2.
- Evidenze ICTC ordina i percorsi investigativi come: **Reticolo epistemico → Ricostruisci un elemento di lavoro → Decisioni e tracciabilità**.
- I tre percorsi sono chiusi di default ed espandibili su click; le sezioni evidence/technical successive restano progressive.

## Invarianti
1. `catalogueSummary != workspacePurpose` per 7/7 procedure.
2. Nessuna label legacy `Fonte + decisione`, `Scope + mapping`, `Prova` nel catalogo nativo.
3. Nessun owner precedente può sovrascrivere purpose/lead dei workspace correnti.
4. Le card usano righe `max-content`, `min-height: 0`, `height: auto`.
5. Evidenze non apre automaticamente Decisioni o altri disclosure.
6. EP-01 resta cross-cutting e non diventa un ottavo processo.

## Saturazione
`semantic-workspace-closure-3-2-1-saturation.mjs` esegue 10.000.000 trial deterministici su 64 famiglie del vocabolario di failure. Il conteggio misura saturazione model-vocabulary e non browser session o dieci milioni di mutazioni del codice.

## Acceptance
La slice entra nella suite `current-semantic-3.2.1`; exact-head GitHub CI resta acceptance esterna separata.
