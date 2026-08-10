# ICTC — Compliance operativa e tracciabile

ICTC è un compliance operations system open-source per sette processi aziendali bounded, costruiti sopra un substrato comune di decisioni umane, versioni, relazioni, audit ed evidenze.

## Identità di rilascio

L'identità corrente è multidimensionale e dichiarata in `v3/release-identity.json`:

- package software: `1.8.0`;
- profilo semantico: `1.2-market-candidate`;
- esperienza: `1.9-experience-candidate`;
- profilo di raffinamento in PR: `1.9.1-pre-candidate`.

Queste dimensioni non vanno fuse in un unico numero: package, semantica, esperienza e refinement hanno autorità diverse. Il file `v3/release-identity.json` è la fonte cross-documenti per questa identità.

## Processi

- `RN-01` — Monitoraggio normativo
- `EC-01` — Eventi e segnalazioni
- `AO-01` — Inventario di sistemi e oggetti
- `MC-01` — Controlli e copertura
- `AP-01` — Azioni correttive
- `RC-01` — Rischi di compliance
- `AR-01` — Questionari e verifiche

`EV-01` resta un piano trasversale di ricostruzione, non un ottavo processo business.

## Esperienza

La navigazione canonica è:

**Home / Processi / Postura Standard & Security ICTC**

Su viewport stretti la terza voce può essere resa come **Postura ICTC**, mantenendo il nome completo come accessible name e titolo della superficie.

La superficie Postura collega controlli applicativi, standard, sicurezza, evidenze, deployment gap e limiti. Non è una certificazione, un parere legale o un security assessment del deployment.

## Autorità ed epistemica

L'AI è opzionale e proposal-only. Le decisioni operative, i rating, le approvazioni e le chiusure che richiedono autorità rimangono umane. La presenza di una prova, di un hash o di un mapping non equivale automaticamente a conformità, applicabilità, efficacia del controllo o sufficienza legale.

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

Il refinement pre-candidate aggiunge anche `v3/refined-product-check.mjs`, `v3/refined-product-saturation.mjs` e il browser polish audit integrato nel journey V1.9.

## Limiti

La stabilità software dichiarata non è una certificazione di conformità, una attestazione di un assessor esterno, né una garanzia che qualunque deployment sia production-ready. Prima di un uso regolato o business-critical leggere `SECURITY.md`, `SUPPORT.md`, i documenti di autorità e i claim boundary della release.
