# ICTC — Compliance operativa e tracciabile

ICTC `1.0_stable` è un compliance operations system open-source per sette processi aziendali bounded, costruiti sopra un substrato comune di decisioni umane, versioni, relazioni, audit ed evidenze.

- `RN-01` — Monitoraggio normativo
- `EC-01` — Eventi e segnalazioni
- `AO-01` — Inventario di sistemi e oggetti
- `MC-01` — Controlli e copertura
- `AP-01` — Azioni correttive
- `RC-01` — Rischi di compliance
- `AR-01` — Questionari e verifiche

`EV-01 — Prove e tracciabilità` è il piano trasversale di ricostruzione e non un ottavo processo business.

## Esperienza
La navigazione permanente è volutamente ridotta a **Oggi / Processi / Prove**.

- **Oggi**: il lavoro che richiede attenzione e la prossima azione.
- **Processi**: l'unico catalogo dei sette processi, con stato sintetico e ingresso diretto.
- **Prove**: decisioni, versioni, evidenze, limiti e traccia tecnica.

L'interfaccia usa al massimo cinque livelli di progressive disclosure; hash, audit raw ed epistemic detail restano al livello tecnico più profondo.

## Autorità
L'AI è opzionale e proposal-only. Le decisioni operative, i rating, le approvazioni e le chiusure che richiedono autorità rimangono umane. La presenza di una prova o di un mapping non equivale automaticamente a conformità, applicabilità, efficacia del controllo o sufficienza legale.

## Runtime
PR49 ha consolidato la baseline sperimentale con SQLite/WAL, audit separato, deployment-evidence envelopes, limiti allegati coerenti e falsifier runtime. `1.0_stable` costruisce sopra quella baseline e comprime il prodotto senza cambiare il principio di autorità.

Richiede Node.js 22 o successivo.

```bash
npm ci
./ictc.sh start --no-open
```

Apri `http://127.0.0.1:4173`.

## Verifica

```bash
npm run check
node v3/v1-stable-experience-saturation.mjs
node v3/v1-stable-process-hardening-check.mjs
```

Per i gate storici e runtime completi usa anche le suite del repository e i workflow CI.

## Stabilità e limiti
`1.0_stable` indica stabilità dei contratti software bounded dichiarati dalla release. Non è una certificazione di conformità, una conclusione legale, una attestazione di un assessor esterno, né una garanzia che qualunque deployment sia production-ready.

La definizione architetturale e la DoD sono in:

- `docs/V1_0_STABLE_ARCHITECTURE.md`
- `docs/V1_0_STABLE_DOD.md`
- `docs/OPEN_SOURCE_TERMS.md`

## Open source
ICTC è distribuito con licenza MIT. Prima di un uso regolato o business-critical, leggere `SECURITY.md`, `SUPPORT.md` e i claim boundary della release.
