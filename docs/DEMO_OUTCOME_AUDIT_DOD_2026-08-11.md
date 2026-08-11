# Demo outcome audit — DoD locale, intermedia e globale

Baseline: `main@e918322235318784a3220a6d1ebc47b9d3d45e66` (merge PR #69).

## Scopo

Usare il dataset PMI sintetico come falsificatore del comportamento aggregato dei sette Processi di Compliance. Il seed non deve limitarsi a essere valido record-per-record: le proiezioni che l'utente vede devono conservare il significato dei lifecycle locali, non doppio-contare lo stesso lavoro e non ricomporre decisioni distinte in un verdetto implicito.

Questa è evidenza ingegneristica bounded. Il ruolo `demo auditor` non è assurance indipendente, non decide applicabilità legale e non certifica efficacia dei controlli.

## Falsificazioni osservate su main

1. **RN-01**: il seed contiene missioni `needs-plan`, ma il summary corrente può mostrare zero attenzione perché considera soltanto catalog review, impact review e run fallite.
2. **AO-01**: le relazioni vengono aggiunte dopo l'attivazione; il normalizzatore invalida correttamente l'attestazione della versione, ma il seed lascia quasi tutti gli oggetti relazionati immediatamente `attestation due`. È una sequenza legalmente ammessa dal modello, ma una demo distorta.
3. **MC-01**: il seed usa ancora `not-applicable` come stato legacy di `CoverageMapping`, mentre il contratto corrente separa `RequirementScopeDecision`. Nella projection 1.3 questo può far sovrapporre `notApplicable` e `unresolved` e rompere la conservazione della partizione del workflow.
4. **AP-01**: `ready-for-review` è già una azione aperta; sommare `open + ready-for-review` nel totale `attention` conta due volte lo stesso subject.
5. **RC-01**: `high`, `unreviewed` e `reviewDue` sono metriche potenzialmente sovrapposte; il totale di attenzione deve essere l'unione dei risk subject, non la somma cieca delle categorie.

## DoD locale

### RN-01
- 100 missioni demo.
- Ogni `needs-plan` è visibile nel segnale di attenzione.
- `attention` conta subject operativi distinti e non è un compliance score.

### EC-01
- La partizione `clarifying/review/submitted/closed` conserva esattamente i 100 incident record.
- Ogni chiusura sintetica ha disposition e nota; nessuna chiusura promuove automaticamente un downstream record.

### AO-01
- La partizione `active/candidate/retired/rejected` conserva esattamente i 100 oggetti.
- Una modifica successiva all'attestazione rende la versione da riesaminare.
- Il baseline demo mantiene un backlog di re-attestation intenzionale e minoritario, non quasi tutto il registry.

### MC-01
- L'applicabilità è registrata in `requirementScopes`; nessun nuovo mapping demo usa `not-applicable` come stato di mapping.
- `mapped`, `gap`, `rejected` e `unresolved` sono workflow bucket disgiunti.
- `mapped + gap + rejected + unresolved = declared` per i mapping actor-visible nel baseline demo.
- `notApplicable/unknown/deferred` appartengono alla projection di requirement scope e non vengono riclassificati come mapping irrisolti.

### AP-01
- Stati azione conservano 100 record.
- `attention` è il numero di action subject operativi distinti che richiedono lavoro; `ready-for-review` resta una metrica interna al medesimo insieme e non viene sommata due volte.

### RC-01
- `reviewed + unreviewed = total`.
- La heatmap usa solo rating umani registrati e preferisce residual.
- `attention` è l'unione dei risk subject high/critical, unreviewed o review-due.

### AR-01
- `intake + review + approved = total`.
- Una approval demo resta marcata sintetica e non diventa assurance reale.

## DoD intermedia

- Tutti i cross-reference risolvono verso subject esistenti e mantengono provenance.
- Nessun handoff trasferisce rating, applicabilità, efficacia o approval authority.
- I summary locali sono coerenti con le projection di dettaglio sullo stesso `ProjectionContext`.
- Il demo bootstrap espone una projection `demoAudit` read-only con outcome locali, check globali, limiti e base temporale.
- Il banner DEMO comunica anche il risultato dell'audit sintetico senza usare lessico di certificazione.

## DoD globale

- 700 primary record e support record di scope/use persistiti nel runtime canonico.
- `procedureSummary.counts.attention` è la somma dei sette segnali locali, ciascuno costruito senza doppio conteggio dello stesso subject nella propria procedura.
- Provenance sintetica completa sui primary record; nessuna `legalClassification` inferita.
- Runtime standard resta isolato.
- Restart demo resta idempotente.
- 10.000 simulazioni con seed pseudocasuale **unico e riproducibile** coprono profili bilanciato, backlog-heavy, incident-heavy, control-gap, action-overdue, risk-heavy, assurance-heavy e mixed.
- Nessuna simulazione target viola la DoD; 10.000 mutazioni distribuite sulle famiglie di incoerenza vengono tutte uccise.
- Discovery delle classi normalizzate converge prima dell'holdout; l'holdout non introduce nuove classi nel vocabolario dichiarato.

## Claim boundary

La convergenza dimostra coerenza rispetto al modello demo, agli operatori di perturbazione e agli oracle dichiarati. Non dimostra rappresentatività universale delle PMI italiane, conformità, applicabilità normativa, efficacia dei controlli, correttezza giuridica, sicurezza del deployment o assurance indipendente.
