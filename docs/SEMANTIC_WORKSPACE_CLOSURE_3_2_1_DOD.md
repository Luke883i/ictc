# Semantic Workspace Closure 3.2.1 — DoD

Questa authority chiude il gap tra workbook e runtime senza introdurre una nuova business authority. Dopo il ritiro della presentation 3.4, 3.2.1 possiede anche la presentation locale di Processi di Compliance ed Evidenze ICTC.

## Contratto current e confine della storia

Questa pagina conserva anche i predicati storici dell’accettazione 3.2.1. Le **viste current** si leggono da [PRODUCT](PRODUCT.md): Processi ha sette procedure più due placeholder in row-list, Evidenze è facts-first secondo #234 e il reticolo non si duplica. I vincoli di card-grid/equal-height e dell’ordine epistemic-first riportati sotto sono **lineage di slice** e non descrivono la composizione corrente post-#233/#234/#237. La verifica corrente è [Testing](TESTING.md) sul runtime e sui browser probe degli owner locali.

## Obiettivi storici della slice 3.2.1
- 7/7 card espongono il catalogueSummary canonico con geometria equal-height desktop e natural-height mobile.
- Ogni workspace conserva workspacePurpose, valore operativo e boundary prima del lavoro.
- Semantic Foundation resta annotation-only e non riscrive business copy locale.
- Evidenze ordina: Reticolo epistemico -> Ricostruisci un elemento di lavoro -> Decisioni e tracciabilità.
- Processi ed Evidenze non dipendono da un final cascade resolver globale.

## Invarianti
1. catalogueSummary != workspacePurpose per 7/7 procedure.
2. Nessuna label legacy Fonte + decisione / Scope + mapping / Prova nel catalogo.
3. Desktop: grid-auto-rows:1fr; card height:100%, min-height:226px; CTA allineata.
4. Mobile <=719px: grid-auto-rows:auto; card height:auto; min-height:0.
5. Nel catalogo restano visibili soltanto header, titolo, purpose e footer canonici.
6. Processi landing e Evidence presentation sono applicate da semantic-workspace-closure-3-2-1.css.
7. Evidenze mantiene un solo Reticolo epistemico, first, e non apre automaticamente Decisioni.
8. EP-01 resta cross-cutting e non diventa un ottavo processo.
9. workspace-finetuning-3-4.css non è necessario né caricato per Processi/Evidence.

## Ownership boundary
semantic-workspace-closure-3-2-1.css possiede copy/layout/presentation di Processi ed Evidence, ma non Home, stable chrome, business state, routing o write authority. Home resta nel layer nativo 3.2; stable header/footer restano nel 3.3.

## Falsificazione
semantic-workspace-closure-3-2-1-saturation.mjs conserva la campagna modellata dichiarata. I retirement oracle storicamente nominati ui-finetuning-3-4-* verificano che gli invarianti relocati restino nei loro owner e che il resolver 3.4 non ritorni. I conteggi modellati non sono browser session, code mutants indipendenti o studio utenti.

## Acceptance
Current semantic, runtime e browser rail sullo stesso exact HEAD restano acceptance repository-side. Le prove esterne restano separate.
