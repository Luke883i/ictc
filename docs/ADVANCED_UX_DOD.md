# Definition of Done — Advanced UX/UI layer

## Claim bounded

Il layer è considerato pronto quando rende più comprensibili le proiezioni della SOT senza aggiungere claim, supporta le modalità di accesso dichiarate e supera i gate elencati. “Pronto” non significa certificato WCAG, validato da utenti reali o enterprise-ready.

## DoD obbligatoria

- [ ] Quattro proiezioni SOT deterministiche: Osserva, Decidi, Agisci, Verifica.
- [ ] Ogni proiezione contiene stato, produttore, input, limitazioni, metrica, next action e target.
- [ ] Assenza o fallimento di integrità non produce uno stato positivo.
- [ ] Una sola proiezione è espansa alla volta.
- [ ] Tablist utilizzabile con Tab, frecce, Home ed End.
- [ ] Stato selezionato coerente tra DOM, ARIA e stile.
- [ ] Target interattivi di almeno 44×44 CSS px.
- [ ] Testo scalabile tramite preferenza locale e reflow a viewport stretti.
- [ ] Contrasto alto e forced-colors supportati.
- [ ] Movimento ridotto supportato sia dal sistema sia dalla preferenza locale.
- [ ] Focus visibile e non occultato dalla UI iniziale.
- [ ] Le preferenze sono raggiungibili con `Alt+U` e annunciate tramite live region.
- [ ] Le preferenze non producono eventi di dominio.
- [ ] 18 journey strutturali superano il test.
- [ ] Almeno 7 modalità di input/uso sono rappresentate.
- [ ] Empty, integrity-failed, integrity-unknown e source-only sono testati.
- [ ] Saturazione `M=48`, `M+100=148`, novelty dopo M uguale a zero.
- [ ] Screenshot del runtime reale generato e accompagnato da hash SHA-256.
- [ ] Il visual check esercita toolbar, scala testo e navigazione con frecce.
- [ ] Nessun claim di conformità, rischio basso o completezza viene introdotto.

## Metriche

| Metrica | Target |
|---|---:|
| Projection contract completeness | 100% |
| Journey strutturali espressi | 100% |
| Named status rate | 100% |
| Explicit limitation rate | 100% |
| Proiezioni simultanee | 4 massimo |
| Azioni primarie per pannello espanso | 1 |
| Target size | ≥ 44×44 CSS px |
| Modalità di input/uso simulate | ≥ 7 |
| Stati degradati simulati | ≥ 4 |
| Novelty dopo M | 0 |
| Browser visual assertions | ≥ 7 |
| Screenshot artefatto | PNG non vuoto + SHA-256 |

## Journey e edge case

1. compliance analyst valuta una differenza;
2. auditor segue una receipt;
3. c-level individua una decisione aperta;
4. incident owner conferma responsabilità;
5. source curator revisiona una candidata;
6. utente low vision opera con testo e zoom elevati;
7. utente sensibile al movimento disabilita animazioni;
8. utente mobile usa target tattili;
9. utente screen reader naviga tab e pannelli;
10. utente interrotto riprende dalla coda locale;
11. empty state non diventa falso verde;
12. integrità fallita è esplicita;
13. integrità sconosciuta è indisponibile;
14. dati densi restano compressi;
15. lente executive non modifica i dati;
16. Codespaces mantiene reflow e focus;
17. etichette lunghe non rompono il layout;
18. voice control utilizza nomi visibili dei controlli.

## Gate

```bash
npm run audit:ux:advanced
npm run visual:ux
```

Artefatti:

- `artifacts/advanced-ux-audit.json`;
- `artifacts/advanced-ux-journeys.json`;
- `artifacts/advanced-ux-saturation.json`;
- `artifacts/advanced-ux-visual.json`;
- `artifacts/screenshots/advanced-ux.png`.

## Verifiche manuali ancora necessarie

- NVDA + Firefox/Chrome;
- VoiceOver + Safari;
- TalkBack + Chrome Android;
- zoom 200% e 400% su contenuto reale;
- high contrast Windows;
- test moderati con almeno un utente per persona critica;
- comprensione di “non significa” e differenza tra integrity e truth.
