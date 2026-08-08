# ICTC V3 Experimental — Definition of Done

## Product outcome

V3 rende ICTC comprensibile a un utente nuovo senza creare un nuovo layer di authority: **un solo entrypoint operativo → proposta di procedura → scelta umana → guida della procedura → originale preservato → assistenza AI proposal-only → checkpoint umano → receipt/evidence → next work → aggregazioni deterministiche → eventuale lettura AI separata e validata da umano**.

Il catalogo di processo resta RN-01, EC-01, EV-01, AO-01, MC-01, AP-01, RC-01, AR-01 con FI-01, IA-01 e GA-01 come subprocessi/control semantics. V3 non introduce nuovi silos di evidenza, decisione, epistemica o navigazione.

## Global DoD

V3 è DoD-green soltanto se tutte le condizioni seguenti sono vere sull'exact head:

- una sola active UI composition;
- shell permanente invariata: Oggi, Processi, Prove; Amministrazione solo privilegiata;
- un solo entrypoint operativo su Oggi per esprimere cosa si deve fare;
- il routing propone procedure candidate ma `humanLaunchRequired=true` sempre;
- una sola work queue cross-process deterministica, role-scoped e senza ranking AI autoritativo;
- ogni processo attivo ha una ProcedureGuide derivata dal ProcessDefinition con entry, input, step, checkpoint, evidence, exit e claim boundary;
- ogni output AI V3 usa semantica assist-only e non può esprimere decisione, conformità, applicabilità, certificazione o transizione finale;
- i checkpoint umani sono proiettati in una sola Review Inbox senza perdere processo, soggetto, versione o evidence URL;
- KPI e segnali aggregati sono deterministici e hashati;
- una lettura AI della dashboard non modifica KPI, work queue, heatmap o decisioni;
- la validazione umana di una lettura AI richiede motivazione e fallisce se il digest della base KPI è cambiato;
- la heatmap consolidata continua a usare esclusivamente rating umani;
- coverage continua a distinguere mapped, gap, not-applicable e unresolved;
- ogni soggetto supportato può essere ricostruito tramite ProcedureTrace: originale → assist trace → DecisionRecord → EpistemicRecord → audit → dossier;
- export ed evidence restano same-as-read;
- un processo sintetico si registra con `expectedCoreEdits=0`;
- simulazione deterministica da 100.000 scenari: zero dead-end, authority leak, route mismatch, metric drift, heatmap leak, coverage error, process primitive inattesa;
- browser journey V3 copre nuovo utente, scelta procedura, RN/EC/AO/MC/AP/RC/AR, insight AI→validazione umana, Prove e boundary admin/user/auditor;
- tutti i rail V1/V2 esistenti restano verdi;
- PR mergeable e `main` invariato rispetto al preimage dichiarato;
- nessun merge senza autorizzazione umana esplicita.

### V3-S0 — V2 green baseline

DoD:
- i cinque failure originari di PR46 sono isolati e corretti senza indebolire runtime o authority boundaries;
- regression browser V2 e GRC browser usano il workspace visibile e il catalogo reale a sette servizi;
- onto-epistemic audit verifica sette servizi sotto una sola ProcessDefinition authority.

### V3-S1 — Unified work entry

DoD:
- `canonicalWorkQueue` fonde RN/EC/GRC in una sola coda;
- priorità deterministiche, documentate e actor-scoped;
- un candidato fonte che richiede decisione umana prevale su onboarding generico;
- `routeWorkIntent` restituisce fino a tre candidate procedure;
- l'utente deve sempre selezionare la procedura;
- auditor: sola lettura.

### V3-S2 — Procedure Guide

DoD:
- guida derivata dalla stessa ProcessDefinition authority;
- cinque fasi leggibili per procedura;
- AI marcata proposal-only nella fase assist;
- checkpoint umano ed evidence/exit espliciti;
- processo sintetico: zero core semantic edits.

### V3-S3 — Assist Envelope

DoD:
- envelope comune con subject, purpose, output, trace, digest e limiti;
- campi di authority AI vietati ricorsivamente;
- adozione separata, umana e motivata;
- auditor non può adottare.

### V3-S4 — Review Inbox

DoD:
- fonti, eventi, oggetti, mapping, action, rischi e assurance convergono in un'unica projection dei checkpoint;
- privacy incidenti rispettata;
- ogni item conserva process code, subject, version, checkpoint ed evidence URL;
- la inbox non rappresenta decisioni già assunte.

### V3-S5 — Deterministic Insight Board

DoD:
- base KPI deterministica e role-scoped con digest;
- AI cita soltanto metriche presenti nella base;
- proposta persistita con receipt;
- nessuna mutazione dei KPI dopo proposta o validazione narrativa;
- human validation motivata e stale-base check.

### V3-S6 — Procedure Trace

DoD:
- projection unica che collega authority già esistenti;
- nessuna nuova evidence authority;
- original/provenance, assist trace, decisioni, epistemica, audit ed evidence URL ricostruibili;
- privacy role-scoped.

### V3-S7 — Contract and 100k saturation

DoD:
- OpenAPI include ogni endpoint V3 montato;
- semantic bootstrap ratchet dichiara work, reviewInbox e insights;
- 100.000 scenari con seed fisso e replay digest;
- zero unexpected primitives e synthetic process core edits = 0;
- V2 capability rail resta attivo come regression contract.

### V3-S8 — UX cutover

DoD:
- Oggi mostra un solo ingresso "Cosa devi fare?";
- massimo tre procedure proposte e nessun avvio automatico;
- ProcedureFrame mostra perché, ingresso, passi, AI boundary, checkpoint, prova ed exit;
- work queue secondaria con una sola CTA primaria;
- Review Inbox e dettagli sono progressive disclosure;
- KPI deterministici distinti visivamente dalla lettura AI;
- nessun `prompt()`/`confirm()`;
- focus, tastiera, reduced-motion e terminologia business-facing preservati;
- nessun nuovo tab permanente.

### V3-S9 — Exact-head seal

DoD:
- syntax, product contract, API contract, semantic ratchet, domain, runtime, browser, V3 DoD, 100k saturation e rail storici verdi sul medesimo SHA;
- PR body/comment riportano exact head, base, commit lineage, limiti e readiness debt;
- PR resta draft/unmerged salvo diversa autorità umana.

## Weld DoD

La saldatura è completa solo se può essere ricostruito questo percorso senza salti semantici:

`intent/original → route suggestion → human procedure selection → ProcessDefinition/ProcedureGuide → preserved original → AssistEnvelope → human checkpoint → DecisionRecord → receipt → EpistemicRecord → evidence graph/dossier → work queue → deterministic aggregate → optional AI insight → human validation → reverse ProcedureTrace`.

Falsificatori obbligatori:
- AI output con campo decision/compliant/applicable/approved: reject;
- AI risk non reviewed: zero celle heatmap;
- N.A.: escluso dal denominatore applicabile, mai contato come mapped;
- insight AI: nessun cambio KPI;
- insight su base stale: conflict;
- auditor: zero write checkpoint;
- altro utente: zero leak di incidente privato;
- nuova procedura sintetica: zero edit a router/evidence/decision/epistemic core.

## UX / terminology / visual-load audit

Baricentro primario:
1. **Cosa devi fare?**
2. **Procedura proposta — scegli tu**
3. **Prossimo lavoro**
4. **Decisioni da rivedere**
5. **Indicatori**
6. **Lettura AI**, chiaramente subordinata e separata.

Terminologia primaria consentita: procedura, prossimo lavoro, inventario, copertura, action plan, rischi, assurance, responsabile, probabilità, impatto, evidenza, decisione, ricevuta.

Terminologia tecnica come projection, authority, digest, relation grammar resta nei dettagli di prova/diagnostica e non compete con la CTA primaria.

Limiti, history, provenance tecnica e opzioni avanzate usano progressive disclosure. Una schermata non deve presentare due azioni con uguale gerarchia visuale per la stessa decisione.

## Claim boundary

**V3 Experimental ready to use** significa baseline coerente per uso sperimentale controllato. Non significa produzione hardened, conformità legale, certificazione, completezza dell'inventario, completezza delle fonti, completezza dei controlli, alta disponibilità o assessment esterno.

Restano readiness debt separati: branch protection, supply pinning, produzione observability, hardening/rate budgets, durable-store evolution, DR e accessibility evidence.
