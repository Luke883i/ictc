# ICTC Enterprise T Assurance Bundle

## Scopo

Questo bundle definisce una baseline ingegneristica enterprise elevata per ICTC e la rende eseguibile. Non certifica un deployment: distingue sempre evidenza di repository, evidenza runtime ed evidenza operativa esterna.

Baseline analizzata: `e427d8811ed91dbe530406d4fbacf42d73414d41`, merge della User Journey 2.0 in `main`.

## Baseline di riferimento

Il modello adatta outcome e pattern di controllo da NIST CSF 2.0, NIST SP 800-53 Rev. 5, ISO/IEC 27001:2022, ISO/IEC 25010:2023, ISO 22301:2019, OWASP ASVS 5.0.0, WCAG 2.2, SLSA 1.2, OpenTelemetry, NIST AI RMF 1.0 con GenAI Profile, RFC 9110 e RFC 9457.

È un profilo di ingegneria informato dagli standard, non una dichiarazione di conformità o certificazione. Nessun testo proprietario degli standard viene riprodotto.

## T = 18 dimensioni

1. governance, ownership e decisioni di rischio;
2. identità, autenticazione e least privilege;
3. sicurezza applicativa e di rete;
4. privacy, classificazione e retention;
5. integrità, durabilità e concorrenza dei dati;
6. affidabilità, resilienza e degradazione;
7. osservabilità, SLO e feedback operativo;
8. incident response e forensics;
9. business continuity, backup e disaster recovery;
10. supply chain e provenienza delle release;
11. architettura backend, contratti API e compatibilità;
12. performance, capacità e costo;
13. governance AI e model risk;
14. integrità semantica ed epistemica;
15. information architecture e user journey;
16. visual system e composizione enterprise compatta;
17. accessibilità, internazionalizzazione e interazione inclusiva;
18. assurance, falsificazione e miglioramento continuo.

Per ogni T, `v3/enterprise-t-model.json` registra audit logico, tecnico e funzionale, blocker e slice minima.

## Ricchezza enterprise senza inflazione visiva

ICTC deve copiare il rigore delle piattaforme enterprise, non il loro ingombro.

Principi:

- una Home compatta e role-aware;
- componenti enterprise comuni: hero, navigazione, status, attention, tabella, form, drawer, evidenze;
- hero limitata a identità, scopo, stato e una sola prossima azione;
- griglie dense, baseline allineate, bordi sobri;
- spazio bianco intenzionale per separare significati, mai come vuoto verticale gratuito;
- progressive disclosure invece di stack di card annidate;
- un concetto, una label preferita;
- target minimi 44 px e 48 px su coarse pointer;
- primo viewport ottimizzato per ruolo, stato, azione e lavoro corrente;
- profondità tecnica disponibile su richiesta.

L'ispirazione editoriale giapponese viene tradotta in gerarchia compatta, allineamento preciso, ritmo calmo e spazio negativo intenzionale. Non giustifica controlli piccoli, basso contrasto o imitazioni decorative.

## Saturazione 1 -> N -> N+15

Ogni T viene valutata indipendentemente sulle dimensioni:

- actor: anonymous, user, admin, auditor, service;
- lifecycle: create, read, update, approve, export, recover;
- operating mode: nominal, degraded, adversarial, recovery;
- load: single, concurrent, burst, capacity;
- evidence: complete, partial, conflicting.

Lo spazio dichiarato è `5 x 6 x 4 x 4 x 3 = 1.440` scenari di costruzione per T.

Per ogni scenario il checker estrae:

- invarianti universali;
- obblighi della dimensione;
- valori dei fattori;
- interazioni pairwise selezionate;
- stato completo dichiarato;
- stress profile applicato;
- disposizione attesa: allow, deny, degrade, recover o escalate.

N coincide con l'esaurimento dello spazio dichiarato e con l'ultima nuova primitiva. Il set viene congelato. I successivi 15 stress scenario devono produrre:

- zero nuove primitive;
- zero invarianti mancanti;
- zero outcome non limitati;
- zero successi silenziosi;
- zero escalation di autorità.

Stress profile:

1. identity spoof e role mismatch;
2. stale revision e duplicate command;
3. concurrent writers a capacità;
4. disk full durante persist;
5. stato e audit chain corrotti;
6. AI timeout e output malformato;
7. DNS rebinding e redirect chain;
8. attachment sovradimensionato o malevolo;
9. telemetry backpressure e high cardinality;
10. dependency compromise e build input non attendibile;
11. network partition e partial response;
12. restore dall'ultimo stato valido;
13. keyboard-only a 320 px;
14. assistive technology con update dinamici;
15. partial deployment e version skew.

La no-novelty resta model-bounded: non dimostra assenza di unknown unknowns.

## Convergenza degli invarianti universali

Dodici invarianti devono sopravvivere a tutte le T e alle code N+15:

1. autorità server-side o control-plane attestato;
2. fail-closed per evidenze mancanti, stale o conflittuali;
3. scritture atomiche, attribuite, persistite, rilette e con receipt;
4. una sola source of truth per concetto e state machine;
5. AI proposta, tracciata e subordinata all'autorità umana;
6. nessun overclaim legale, di sicurezza o operativo;
7. outcome nominali, degradati, avversariali e di recovery deterministici e bounded;
8. evidenza collegata a input, produttore, tempo, limiti e revisione;
9. minimizzazione e protezione di secret, dati personali e allegati;
10. journey compatta, role-aware, keyboard-operable e progressiva;
11. latenza, retry, code, payload e risorse bounded e osservabili;
12. rollback, restore o safe-stop per release e recovery.

Una dimensione può aggiungere controlli locali ma non indebolire un invariante universale. In caso di conflitto prevalgono safety, evidenza, privacy e autorità umana; la claim di prodotto viene ristretta.

## Audit consolidato

### Fondazioni forti

- confine epistemico esplicito;
- autorità umana sull'AI;
- tre ruoli canonici e permission server-side;
- boundary loopback/trusted-header;
- validazione endpoint e redirect AI;
- audit chain, revision check e command replay;
- artifact di contratto, runtime e browser legati al commit;
- Home compatta e journey per ruolo;
- readiness onesta, senza claim sintetiche.

### Gap a rischio più alto

1. `main` non protetto;
2. storage JSON process-local, non transazionale multi-instance;
3. IdP, TLS e secret management esterni;
4. backup, restore, RTO e RPO assenti;
5. osservabilità e SLO assenti;
6. nessuna pipeline malware/quarantine per allegati;
7. niente SBOM, firma o provenienza SLSA;
8. niente load, chaos, restart e partition evidence;
9. output AI senza strict schema e budget non reservation-based;
10. vocabolario e documenti IA legacy ancora presenti;
11. assenza di evidenza umana con assistive technology;
12. rischio false-green nei check statici.

## Percorso minimo verso runtime enterprise

1. **Proteggere l'autorità di delivery**: branch protection, review/check obbligatori, action pinning, artifact immutabili.
2. **Creare storage canonico durevole**: Store port, adapter transazionale, migration, backup envelope e restore verificato.
3. **Stabilire identità e edge production-grade**: IdP/session boundary, HTTP hardening, secret e data policy.
4. **Rendere il runtime osservabile e resiliente**: OTel, SLO, bounded retry, capacity budget, incident runbook.
5. **Consolidare API, AI e semantica**: schema API, RFC 9457, strict AI schema, budget reservation, semantic registry.
6. **Harden della human experience compatta**: IA unica, design token, density budget, accessibilità automatica e umana.

L'ordine segue autorità e irreversibilità: non conviene aggiungere nuova automazione prima di avere storage, recovery e osservabilità.

## Falsificazione

Il bundle rifiuta esplicitamente queste conclusioni:

- CI verde = deployment enterprise-ready;
- hash chain = verità o completezza;
- controllo nascosto = autorizzazione;
- JSON locale = durabilità multi-instance;
- compattezza = accessibilità;
- N+15 = completezza universale;
- JSON AI parseable = output sicuro;
- dependency audit = supply-chain integrity;
- browser journey = capacità o disaster recovery;
- ricchezza enterprise = componenti oversized.

La conclusione valida è limitata: `enterprise-t-assurance-model-validated` per il commit esatto quando tutti i checker e gli artifact sono verdi. Restano necessarie evidenze esterne per deployment, certificazioni, accessibilità e resilienza operativa.

## File del bundle

- `docs/ENTERPRISE_T_ASSURANCE.md`;
- `v3/enterprise-t-model.json`;
- `v3/enterprise-t-saturation.mjs`;
- `v3/enterprise-invariant-convergence.mjs`;
- `v3/enterprise-t-audit.mjs`;
- `v3/enterprise-t-runtime-stress.mjs`;
- `v3/enterprise-falsification-check.mjs`;
- artifact JSON generati in CI.
