# ICTC — Integrated Compliance Tower Control

ICTC è una web application locale, proof-oriented e anti-overclaim per osservare il quadro normativo rilevante e gestire segnalazioni, quasi incidenti e incidenti con responsabilità, decisioni e receipt verificabili.

## Versione corrente proposta: v3 Living Evidence Atlas

La v3 introduce una UX orientata alle domande dell’utente: balloon di attenzione, Atlante semantico, percorsi guidati, change story, incident room, audit trail e catena tecnologica. Tutte le superfici consumano `OutcomeEnvelope` derivati dallo stesso runtime locale.

```bash
./ictc-v3.sh start
```

Aprire `http://127.0.0.1:4173` quando il browser non viene avviato automaticamente.

```bash
./ictc-v3.sh status
./ictc-v3.sh logs
./ictc-v3.sh audit
./ictc-v3.sh stop
```

La v2 già mergiata resta disponibile tramite `./ictc.sh`. La v3 usa una SOT separata in `v3/runtime/`, quindi può essere provata e rimossa senza migrare lo stato v2.

## Cosa si può usare nella v3

- Home con balloon derivati da oggetti runtime;
- Atlante SVG con relazioni deterministiche e lista alternativa;
- tre percorsi guidati end-to-end;
- inserimento di link e file come fonti candidate;
- review umana di fonti e differenze;
- scouting simulato senza promozione autonoma;
- change story con decisione e mapping astratto ai controlli;
- eventi con owner, RACI e transizioni consentite;
- trail schematici e ledger sanitizzato;
- assistente locale, session-scoped e senza write authority.

## Confine epistemico

ICTC attesta operazioni locali, persistenza, readback, review e decisioni registrate. Non dichiara automaticamente completezza del perimetro, applicabilità legale, conformità dell’organizzazione, efficacia dei controlli o obblighi di notifica.

Ogni elemento UI espone stato epistemico, produttore, input, limiti, prossima azione e receipt quando disponibile.

## Verifica

```bash
./ictc-v3.sh audit
```

Il comando esegue l’audit runtime e il gate di saturazione: `M = 36`, scenari fino a `M+100 = 136`, ultima nuova primitiva allo scenario 12. La conclusione è bounded e non costituisce completezza universale.

Il workflow `.github/workflows/v3-runtime.yml` verifica sintassi, audit, saturazione e ciclo reale `start → health → status → stop`.

## Documentazione v3

- [UX to-be](docs/UX_TO_BE_V3.md)
- [Runtime e wiring](docs/RUNTIME_AND_WIRING_V3.md)
- [Chiarezza onto-epistemica](docs/ONTO_EPISTEMIC_CLARITY_V3.md)
- [Simulazioni end-user](docs/ENDUSER_SIMULATIONS_V3.md)
- [Saturazione M+100](docs/SATURATION_M_PLUS_100.md)
- [Design system](docs/DESIGN_SYSTEM_V3.md)

## Requisiti e sicurezza

- Node.js 22 o successivo;
- `curl` per launcher e health check;
- bind predefinito `127.0.0.1`;
- uso supportato: workstation o ambiente di prova isolato.

Non esporre la beta direttamente su rete aziendale. Autenticazione enterprise, multi-tenancy, scheduler persistente, malware scanning, parsing profondo PDF/DOC, storage distribuito e provider LLM esterno governato non sono implementati.

## Sviluppo

La foundation v2, i contratti esistenti e la documentazione storica restano nel repository. Per contribuire consultare [AGENTS.md](AGENTS.md), [CONTRIBUTING.md](CONTRIBUTING.md), [docs/README.md](docs/README.md), [SECURITY.md](SECURITY.md) e [SUPPORT.md](SUPPORT.md).

## Licenza

Uso proprietario. Vedere [LICENSE.md](LICENSE.md).
