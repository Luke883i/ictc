# ICTC — Compliance operativa e tracciabile

ICTC è un compliance operations system open-source per sette processi aziendali bounded, costruiti sopra un substrato comune di decisioni umane, versioni, relazioni, audit ed evidenze.

## Identità di rilascio

L'identità corrente è multidimensionale e dichiarata in `v3/release-identity.json`:

- package software: `1.8.0`;
- profilo semantico: `1.2-market-candidate`;
- esperienza: `1.9-experience-candidate`;
- profilo di raffinamento: `1.9.1-pre-candidate`;
- profilo epistemico in PR: `2.0-epistemic-lattice-pre-candidate`.

Queste dimensioni non vanno fuse in un unico numero: package, semantica, esperienza, refinement ed epistemica hanno autorità diverse. Il file `v3/release-identity.json` è la fonte cross-documenti per questa identità.

## Processi

- `RN-01` — Monitoraggio normativo
- `EC-01` — Eventi e segnalazioni
- `AO-01` — Inventario di sistemi e oggetti
- `MC-01` — Controlli e copertura
- `AP-01` — Azioni correttive
- `RC-01` — Rischi di compliance
- `AR-01` — Questionari e verifiche

`EV-01` resta un piano trasversale di ricostruzione, non un ottavo processo business.

La pre-candidate 2.0 aggiunge `EP-01 — Reticolo epistemico` come **meta-procedura cross-cutting** per admin e auditor. EP-01 non entra nel registry dei sette processi business: proietta versioni ed effetti semantici cumulati in modalità flat/raw e proto-grafo, con AI human-ON proposal-only.

## Esperienza

La navigazione canonica è:

**Home / Processi / Postura Standard & Security ICTC**

Su viewport stretti la terza voce può essere resa come **Postura ICTC**, mantenendo il nome completo come accessible name e titolo della superficie.

La superficie Postura collega controlli applicativi, standard, sicurezza, evidenze, deployment gap e limiti. Non è una certificazione, un parere legale o un security assessment del deployment.

Da **Processi**, admin e auditor possono aprire **Reticolo epistemico**. La vista flat/raw e il proto-grafo sono due rappresentazioni della stessa proiezione SQLite revision-bound; il grafo non costituisce una seconda fonte di verità.

## Autorità ed epistemica

L'AI è opzionale e proposal-only. Le decisioni operative, i rating, le approvazioni e le chiusure che richiedono autorità rimangono umane. La presenza di una prova, di un hash o di un mapping non equivale automaticamente a conformità, applicabilità, efficacia del controllo o sufficienza legale.

In EP-01 l'AI richiede un'esplicita attivazione umana per ogni analisi. Le derivazioni progressive L1-L4 restano `proposed`, devono citare gli atomi basis e i riferimenti standard/best-practice usati e possono essere revisionate separatamente senza modificare i record business originari.

## Avvio

Richiede Node.js 22 o successivo.

```bash
npm ci
./ictc.sh start --no-open
```

Apri `http://127.0.0.1:4173`.

## Verifica corrente

```bash
npm run test:current:semantic
npm run test:current:runtime
python -u v3/browser-v1-9-experience.py
```

Il profilo epistemico 2.0 aggiunge i gate di surface primitives, EP-01, AI human-ON, cross-procedure creation e `v3/epistemic-lattice-saturation.mjs`. Il saturation è bounded evidence e non prova l'assenza di classi di difetto ignote.

## Limiti

La stabilità software dichiarata non è una certificazione di conformità, una attestazione di un assessor esterno, né una garanzia che qualunque deployment sia production-ready. Prima di un uso regolato o business-critical leggere `SECURITY.md`, `SUPPORT.md`, i documenti di autorità e i claim boundary della release.
