# PR60 — Global convergence DoD

Questo documento chiude i prompt di convergenza della PR #60. È una checklist di candidate; non sostituisce i gate eseguibili né trasforma evidenza di test in certificazione.

## D1 — sette procedure e proiezioni

DoD: un end-user percorre RN-01, EC-01, AO-01, MC-01, AP-01, RC-01 e AR-01 tramite UI reale; ogni write avanza revisione, viene riletta e aggiorna le superfici dipendenti.

- [x] Journey server-backed 7/7.
- [x] MC-01 usa la superficie market attiva standard → scope → requisito → mapping.
- [x] `ictc:projection-committed` è monotonic e revision-bound.
- [x] Processi e workspace convergono dopo write.
- [x] Cross-procedure create usa target adapter/policy/RBAC e stato iniziale nativo.

## D2 — navigazione e complessità distribuita

DoD: la navigazione resta prevedibile con o senza motion; il contesto è disponibile senza introdurre un secondo menu/registry.

- [x] History e route sono indipendenti dalla View Transition API.
- [x] reduced-motion conserva piena funzionalità.
- [x] “Percorso corrente” deriva dalle authority esistenti.
- [x] Primitive canoniche sono applicate alle superfici.
- [x] Burst di eventi delle primitive è coalesciato in un solo microtask owner.

## D3 — EP-01 e chiarezza epistemica

DoD: admin/auditor esplorano la stessa projection/digest dal generale all'atomo senza confondere record e inferenze.

- [x] Esplora / Flat-raw / Proto-grafo condividono authority.
- [x] Quadro → Gruppi → Relazioni → Atomo è reversibile.
- [x] Gruppi senza famiglia hanno scope stabile.
- [x] Duplicazione del dettaglio Atomo rimossa.
- [x] AI derivations restano `proposed` e basis-bound; review umana separata.
- [x] Human-ON esplicito per run AI.

## D4 — evidence, receipt e Postura

DoD: evidenza tecnica leggibile e machine-readable mantiene same-as-read, lineage e limiti; Postura presenta prima ciò che conta e sposta dettaglio in disclosure.

- [x] Canonical evidence dossier resta unico owner.
- [x] Receipt PDF stampabile con intestazione ICTC.
- [x] XML strutturato escaped e senza DTD/ENTITY.
- [x] Markdown leggibile.
- [x] ZIP include graph/claims/decisions/audit/receipts, i tre formati e checksum.
- [x] Lineage include revision, actor/role, subject, previousHash/hash, input/result/state digest, semantic manifest, EpistemicStep quando disponibili.
- [x] UI usa una sola affordance “Fascicolo” con quattro formati.
- [x] Postura: Osservabile → Da completare → Confine → decisioni/runtime/deployment/riferimenti/export.
- [x] Nessun formato amplia autorizzazione o produce conclusioni sostanziali.

## D5 — documentazione e traiettoria

DoD: un nuovo sviluppatore può ricostruire AS-IS, authority e percorso di test senza leggere la cronologia delle PR; la storia resta separata come lineage.

- [x] README rifondato sull'AS-IS.
- [x] AGENTS e Architettura descrivono SQLite reale, non `state.json` corrente.
- [x] TESTING descrive `npm test → test:current`.
- [x] DEVELOPMENT usa `state.sqlite` e exact-head discipline.
- [x] SECURITY rende espliciti runtime/deployment boundary e CodeQL condizionale.
- [x] PROJECT_TRAJECTORY separa storia e autorità corrente.
- [x] release identity include journey profile 2.1.
- [x] documentation-authority gate impedisce regressione dei claim AS-IS principali.

## D6 — hardening, polish e saturation

DoD: capacità nuova non crea owner inutili, i fault principali sono falsificati e il claim di saturation resta bounded.

- [x] Surface primitive refresh coalesced.
- [x] Evidence representations derivano da un documento lineage canonico.
- [x] Nessun secondo ledger, graph DB o export authority.
- [x] Test semantic/runtime/browser precedenti restano nella suite.
- [ ] Exact PR HEAD: tutti i required executable checks non-skipped devono essere success.
- [ ] Evidence artifacts devono essere legati allo stesso exact head.

## Residui esterni

- Branch protection è un controllo GitHub server-side: GOV-01F resta compensativo finché GitHub non riporta enforcement attivo.
- CodeQL è condizionale a `ICTC_ENABLE_GHAS`; uno `skipped` significa non eseguito, non successo.
- CI browser non sostituisce review umana con tecnologie assistive né assessment del deployment.

## Stop condition

La PR è tecnicamente chiudibile solo quando l'exact HEAD corrente ha semantic suite, runtime suite, browser journey, UI assurance, security non-condizionale, authority/integrity e artifact generation senza failure/pending. Qualsiasi nuovo commit invalida il verde del commit precedente.
