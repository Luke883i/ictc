# PR60 — Global convergence DoD

Questo documento è la checklist della candidate PR #60. Non sostituisce i gate eseguibili e non trasforma test, hash, receipt o saturation in certificazione o conclusione di compliance.

## D1 — sette procedure e proiezioni

DoD: un end-user percorre RN-01, EC-01, AO-01, MC-01, AP-01, RC-01 e AR-01 tramite UI reale; ogni write avanza revisione, viene riletta e aggiorna le superfici dipendenti.

- [x] Journey server-backed 7/7.
- [x] MC-01 usa la superficie attiva standard → scope → requisito → mapping.
- [x] `ictc:projection-committed` è monotonic e revision-bound.
- [x] Processi e workspace convergono dopo write.
- [x] Cross-procedure create usa target adapter/policy/RBAC e stato iniziale nativo.

## D2 — navigazione e complessità distribuita

DoD: la navigazione resta prevedibile con o senza motion; route, History, focus e presentazione hanno responsabilità distinguibili e non introducono un secondo registry.

- [x] History e route sono indipendenti dalla View Transition API.
- [x] reduced-motion conserva piena funzionalità.
- [x] “Percorso corrente” deriva dalle authority esistenti.
- [x] Primitive canoniche sono applicate alle superfici.
- [x] Burst di eventi delle primitive è coalesciato in un solo microtask owner.
- [x] Il router espone separatamente normalizzazione route, History, focus, transition e semantic notification.
- [x] L'ordine degli installer della active experience è esplicito e ispezionabile senza cambiare la sequenza runtime.

## D3 — EP-01 e chiarezza epistemica

DoD: admin/auditor esplorano la stessa projection/digest dal generale all'atomo senza confondere record e inferenze.

- [x] Esplora / Flat-raw / Proto-grafo condividono authority.
- [x] Quadro → Gruppi → Relazioni → Atomo è reversibile.
- [x] Gruppi senza famiglia hanno scope stabile.
- [x] Duplicazione del dettaglio Atomo rimossa.
- [x] AI derivations restano `proposed` e basis-bound; review umana separata.
- [x] Human-ON esplicito per run AI.

## D4 — fascicoli, receipt e Postura

DoD: evidenza tecnica leggibile e machine-readable mantiene lo stesso perimetro di lettura, tracciabilità e limiti; Postura presenta prima ciò che conta e sposta dettaglio tecnico in disclosure.

- [x] Canonical evidence graph/dossier resta unico owner.
- [x] PDF stampabile con intestazione ICTC.
- [x] XML strutturato escaped e senza DTD/ENTITY.
- [x] Markdown leggibile.
- [x] ZIP include graph/claims/decisioni/audit/receipt, i tre formati e checksum.
- [x] Tracciabilità tecnica include revision, actor/role, subject, previousHash/hash, input/result/state digest, semantic manifest ed EpistemicStep quando disponibili.
- [x] UI usa una sola affordance “Fascicolo” con quattro formati.
- [x] Disclosure Fascicolo chiudibile con Escape e click esterno, con ritorno focus.
- [x] Controlli/disclosure della nuova UI ereditano target minimo 44px.
- [x] Renderer PDF spezza token senza spazi per evitare overflow di receipt stampabili.
- [x] Postura: Osservabile → Da completare → Confine → decisioni/runtime/requisiti esterni/riferimenti/export.
- [x] Cache Postura è legata a ruolo+revisione e scarta response stale.
- [x] Generic `ictc:rendered` non forza fetch della Postura; la convergenza dati usa `ictc:projection-committed`.
- [x] Nessun formato amplia autorizzazione o produce conclusioni sostanziali.

## D5 — documentazione e traiettoria

DoD: un nuovo sviluppatore può ricostruire AS-IS, authority e percorso di test senza leggere la cronologia delle PR; la storia resta separata come lineage progettuale.

- [x] README rifondato sull'AS-IS.
- [x] `docs/START_HERE.md` offre un'unica rotta di onboarding e si dichiara mappa, non authority.
- [x] AGENTS instrada le letture per responsabilità invece di imporre l'intera directory docs.
- [x] AGENTS e Architettura descrivono SQLite reale, non `state.json` corrente.
- [x] TESTING descrive `npm test → test:current`.
- [x] DEVELOPMENT usa `state.sqlite` ed exact-head discipline.
- [x] SECURITY rende espliciti runtime/deployment boundary e CodeQL condizionale.
- [x] PROJECT_TRAJECTORY separa storia e autorità corrente.
- [x] release identity include journey profile 2.1.
- [x] documentation-authority gate falsifica drift di storage, suite, identity, security e onboarding.

## D6 — audit UI/UX, hardening e saturation

DoD: la capacità nuova non crea owner inutili; le regressioni mappate sono rilevabili da gate diversi e il claim di saturation resta bounded.

- [x] Audit reticolare ridotto a quattro responsabilità: semplificazione, chiarificazione, hardening, polish/assurance.
- [x] Surface primitive refresh coalesced.
- [x] Evidence representations derivano da un documento di tracciabilità canonico.
- [x] Nessun secondo ledger, graph DB o export authority.
- [x] Test semantic/runtime/browser precedenti restano nella suite.
- [x] Browser PR60 verifica Postura desktop/mobile, no-overflow, 44px, disclosure da tastiera, refresh revision-bound e download reali PDF/XML/Markdown/ZIP.
- [x] PR60 saturation deriva il profilo dalle sorgenti correnti, non da un baseline `all true` separato dal codice.
- [x] Fault mutators coprono almeno refresh duplicato/stale/role leak, formato mancante, Escape trap, owner duplicato, small target, mobile overflow, token PDF lungo, XML unsafe, authorization widening, onboarding ambiguity e duplicate authority.
- [x] Discovery usa 12.000 scenari; la condizione specifica PR60 è **M + 100 holdout** senza nuova signature normalizzata misurata e con zero violazioni target nello spazio generato.
- [x] Simplification mutants devono produrre almeno una degradazione misurabile.
- [ ] Exact PR HEAD: tutti i check eseguibili non-skipped devono risultare `success`, senza failure/pending.
- [ ] Evidence artifact richiesti devono risultare legati allo stesso exact HEAD.

## Cosa significa “verde”

Per questa PR, “tutto verde” significa: sullo **stesso exact HEAD** tutti i check eseguibili/non-condizionali richiesti sono completati con successo e non esistono failure o pending. Un job condizionale `skipped` resta **non eseguito**, non viene reinterpretato come successo.

## Residui esterni e non-goal

- Branch protection è un controllo GitHub server-side: GOV-01F resta compensativo finché GitHub non riporta enforcement attivo.
- CodeQL è condizionale a `ICTC_ENABLE_GHAS`; uno `skipped` significa non eseguito, non successo.
- CI browser non sostituisce review umana con screen reader, osservazione ergonomica professionale o assessment del deployment.
- M+100 no-novelty significa soltanto che il holdout generato non ha introdotto nuove **signature misurate** rispetto alla discovery; non prova assenza di difetti sconosciuti fuori dal modello.

## Stop condition

La maturazione tecnica della PR si ferma solo quando l'exact HEAD corrente ha semantic suite, runtime suite, browser journey, UI assurance, security non-condizionale, authority/integrity e artifact generation senza failure/pending. Qualsiasi nuovo commit invalida il verde del commit precedente e richiede una nuova osservazione exact-head.
