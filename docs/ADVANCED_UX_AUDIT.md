# Audit UX/UI avanzato di ICTC main

## Scopo

Questo audit valuta `main` dopo la stabilizzazione v1 dal punto di vista di persone operative, compliance, auditor, direzione, CTO e utenti con esigenze di accessibilità. La conclusione è limitata al layer UI/UX locale e non costituisce certificazione WCAG, validazione legale o ricerca con utenti reali.

## Ciò che main esprime già adeguatamente

- ogni card end-user consuma una proiezione `OutcomeEnvelope`;
- `ActionFrame` risponde a “che cosa devo fare qui?”;
- `DecisionCheckpoint` espone stato prima/dopo, conseguenza e receipt attesa;
- il dettaglio separa azione, derivazione ed evidenza tecnica;
- grafi e percorsi dispongono di alternative testuali;
- focus visibile, skip link e `prefers-reduced-motion` sono presenti;
- gli stati sono nominati e non vengono sostituiti da un compliance score.

## Gap individuati

### UX-A01 — Assenza di una compressione trasversale

Gli oggetti sono corretti ma distribuiti tra viste. Una persona deve ancora ricostruire mentalmente dove si trovano segnali, decisioni, responsabilità e prove.

**Mitigazione:** `Projection Stack` derivato dal bootstrap con quattro livelli: Osserva, Decidi, Agisci, Verifica.

### UX-A02 — Preferenze ergonomiche non globali

La UI rispetta il movimento ridotto del sistema, ma non permette di adattare testo, densità e contrasto durante la sessione.

**Mitigazione:** toolbar locale persistente per testo, densità, contrasto e movimento. Le preferenze non modificano dati ICTC.

### UX-A03 — Tab avanzati non verificati nel browser

I pattern tab esistenti non hanno un gate dedicato per frecce, Home/End, stato selezionato e pannello associato.

**Mitigazione:** tablist del Projection Stack con frecce, Home/End, `aria-selected`, `aria-controls` e test Playwright.

### UX-A04 — Edge case degradati non contrattualizzati

Empty state, integrità sconosciuta, integrità fallita, dati densi, etichette lunghe e sessione interrotta non erano parte di una simulazione UX unica.

**Mitigazione:** 18 journey, 7 modalità di input e 4 stati degradati verificati con un test machine-readable.

### UX-A05 — Visual gate non collegato al runtime corrente

La repository dispone di audit visuali storici, ma la nuova UX richiede uno screenshot del runtime corrente e non soltanto una fixture statica.

**Mitigazione:** il workflow avvia ICTC, attende `data-ux-ready`, esercita tastiera e preferenze e acquisisce il PNG del runtime reale.

## Modello introdotto

```text
SOT e ledger
  ↓ project()
OutcomeEnvelope
  ↓ ActionFrame projector
Azione locale
  ↓ advanced-ux-projector
Projection Stack
  ├─ Osserva
  ├─ Decidi
  ├─ Agisci
  └─ Verifica
```

Il `Projection Stack` è una vista derivata e non persistita. Ogni livello dichiara:

- stato epistemico nominato;
- metrica derivata;
- produttore;
- input runtime;
- prossima azione;
- destinazione;
- limiti e non-equivalenze.

## No false green

- zero oggetti non diventa “tutto conforme”;
- integrità assente diventa `unavailable`, non `verified`;
- integrità fallita diventa `failed`;
- receipt e hash non diventano verità sostanziale;
- il colore non è l’unico portatore di stato;
- il layer non scrive nel ledger e non modifica priorità o autorità.

## Standard e riferimenti

La progettazione è orientata a WCAG 2.2 livello AA e ai pattern WAI-ARIA APG. La soglia interna dei target è 44×44 CSS pixel, più ampia del minimo normativo, per ergonomia touch e motor accessibility.

Riferimenti ufficiali:

- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum

L’APG è una guida di authoring e non una certificazione. La conformità reale richiede verifica manuale e combinazioni browser/tecnologie assistive.
