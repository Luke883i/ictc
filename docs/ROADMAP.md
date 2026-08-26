# Roadmap

## Stato corrente — candidate locale

ICTC ha sette processi canonici, Native Semantic Lattice 3.2, Workspace Closure 3.2.1, Workspace Chrome 3.3, Documentation Runtime 1.0, DEMO Suite 2.2 e current rail fail-closed. Lo stato repository-side non equivale a enterprise-ready o deployment assurance.

## Minimal semantic convergence chain

La progressione interna dopo `main` post-#115 è deliberatamente compressa in quattro PR lineari. Ogni PR deve partire dal `main` che contiene la precedente e chiudere exact-head current semantic/runtime/browser CI prima della successiva.

### P1 — Presentation Authority Retirement 4.0

Obiettivo: eliminare l'ultima presentation authority transitoria.

- ritirare `workspace-finetuning-3-4.css` e il relativo current runtime marker/loader;
- Home presentation -> owner nativo 3.2;
- Processi/Evidence presentation -> owner locale 3.2.1;
- stable chrome -> owner 3.3;
- eliminare da `enterprise-workspace-3-2.css` le cause storiche stable-chrome e `#procedureHub` già sostituite;
- mantenere i gate storicamente nominati 3.4 come retirement oracle, senza creare nuovi gate paralleli;
- current authority: `uiPresentation=local-owners`.

Exit: active final resolver = 0; comportamento osservabile e accessibilità repository-side non regrediscono.

### P2 — Procedure Worklist + RC Closure 1.0

Obiettivo: trasformare le sette procedure in lavoro operativo coerente senza introdurre uno status globale.

- una primitive strutturale 7/7: mini-dashboard -> semantic filters -> local ordering -> worklist;
- provider locali possiedono state vocabulary, actionable predicate, terminal predicate, facets, counters, ordering e primary action;
- default view = exact human-action set; terminal/quiescent hidden ma revealable;
- counters e default view derivano dalla stessa predicate family;
- RC actionable = unreviewed ∪ reviewed-without-current-treatment ∪ review-due;
- RC high/critical = informativo, non causa autonoma di attention;
- browser proof server-backed per 7/7 procedure, ruoli e mobile.

Exit: workbook S4.0-S4.7 chiuso per la parte materializzabile senza inventare AR invalidation.

### P3 — Temporal/Epistemic Procedure Closure 1.0

Obiettivo: chiudere i due gap semantici che non devono essere simulati dalla UI.

- AR: introdurre `review-needed` soltanto da una causa nativa esplicita, version/invalidation/expiry bound, preservando approvedVersions precedenti;
- AR request/type facet deriva dal dominio, non da label UI;
- material write paths espongono `metadata.epistemicEffects` espliciti;
- ridurre/eliminare il fallback di authority basato sul nome dell'action;
- review need preserva decisione precedente e apre nuovo lavoro, non riscrive verità o assurance.

Exit: nessuno stato operativo viene inventato dal presentation layer; causalità di riesame e producer/authority sono typed.

### P4 — Enterprise-Candidate Assurance + Reliability Closure 1.0

Obiettivo: contrarre il debito repository-side e rendere esplicite le capacità necessarie prima delle prove esterne.

- misurare responsibility coverage unica dei compatibility-regression gate e demotare/ritirare solo i gate realmente ridondanti;
- un oracle current per failure family sostanziale, mantenendo fail-closed su responsabilità non coperte;
- capability port storage/persistence adapter-neutral per evitare che una migrazione infrastrutturale riscriva business authority;
- scheduler lease/idempotency/duplicate semantics e capacity budget espliciti;
- API differential contract e bounded internal SLO/load envelope;
- accessibility core blocking repository-side, senza presentarlo come human AT certification.

Exit: repository-bounded enterprise-candidate engineering posture più piccola, più falsificabile e con meno compatibility debt. Non equivale a enterprise-ready.

## External evidence rail — non auto-chiudibile dal codice

Dopo P4 restano separati e osservabili: branch protection/ruleset e required reviews; independent security review/penetration test; human assistive-technology/usability evidence; production scanner efficacy; externally managed key custody; off-host backup/restore con RTO/RPO approvati; production telemetry/alert drills; identity/deployment hardening e capacity evidence nel target reale.

## Mutation evidence usata per la chain

Una nuova campagna E2 modellata da 10.000.000 trial su 12 livelli e 144 failure family ha trovato sette blind spot al primo passaggio; dopo il rafforzamento degli oracle il replay ha ucciso 10.000.000/10.000.000 mutazioni e un holdout separato 1.000.000/1.000.000, con negative controls senza falsi positivi nel campione dichiarato. Questa evidenza orienta la chain ma non sostituisce code mutation execution, browser evidence, review indipendente o deployment assurance.

## Regola di sviluppo

Non aprire P(n+1) prima che P(n) sia merged e il `main` risultante sia quiescente. Preferire negative authority delta, eliminazione di cause + compensazioni, owner locali e proof causali. Non introdurre UI 3.5, nuovi final resolver, un ottavo processo o una business write authority parallela per accelerare la roadmap.
