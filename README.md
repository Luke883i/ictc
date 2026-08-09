# ICTC — Enterprise Nexus Compliance OS

ICTC V4.1 è un **compliance operating system evidence-first** per sette processi business governati sulla stessa autorità runtime:

- `RN-01` — Monitoraggio normativo
- `EC-01` — Eventi e segnalazioni
- `AO-01` — Inventario di sistemi e oggetti
- `MC-01` — Controlli e copertura
- `AP-01` — Azioni correttive
- `RC-01` — Rischi di compliance
- `AR-01` — Questionari e verifiche

La shell permanente è **Oggi / Processi / Prove**. Amministrazione è un control plane privilegiato, non un ottavo processo business.

## Stability profile

Il branch candidate di questa release introduce il profilo **`v4_experimental_stable`** sopra l'edition `V4.1 Experimental · Enterprise Nexus`, mantenendo il runtime package `1.8.0`.

`v4_experimental_stable` significa che gli invarianti runtime/epistemici dichiarati sono chiusi da falsifier eseguibili e regressioni sullo stesso candidate tree. **Non significa** production readiness, conformità legale, certificazione, HA/DR, accessibilità attestata o comprensione universale da parte degli utenti.

## Autorità e AI

Decisioni, stato epistemico, process definition ed evidence restano autorità runtime/human. L'AI produce solo proposte.

Esistono due controlli distinti:

1. **preferenza personale AI ON/OFF** — esperienza client; sceglie percorso assistito o manuale;
2. **policy AI organizzativa** — controllo server-side persistito; se `disabled`, il common AI boundary rifiuta la chiamata prima del provider/network. I workflow manuali restano disponibili.

## Persistenza

Lo Store usa SQLite/WAL con:

- snapshot canonico mutabile;
- audit ledger append-only separato;
- transazione unica snapshot + nuovi eventi audit;
- readback prima della pubblicazione dello stato in memoria;
- migrazione una tantum da `state.json` a `state.legacy-imported.json`.

Non esiste più il ceiling artificiale di 10.000 eventi audit. Questo migliora la baseline locale, ma non costituisce da solo HA, replica, backup/restore o database distribuito.

## Allegati e routing documenti

Il transport corrente è JSON/base64. Il contratto attivo è quindi intenzionalmente conservativo: massimo **10 file**, massimo **5 MiB per file** e massimo **5 MiB complessivi per richiesta**. Browser e Store rifiutano un set che supera il budget prima della persistenza parziale.

Nel routing novice, un documento viene usato soltanto tramite nome/contesto per scegliere il processo; il file deve essere allegato nel workflow dopo la scelta. ICTC non afferma di aver preservato un file prima che sia realmente persistito.

## Readiness enterprise

I vecchi booleani d'ambiente per TLS, storage, backup, malware scan, osservabilità, dependency audit e accessibility sono trattati solo come segnali legacy. Un controllo può diventare `verified` soltanto tramite un envelope di deployment legato a `deploymentId`, issuer, `observedAt`, `expiresAt`, evidence URI e SHA-256.

## Assurance

I vecchi rail cardinali (100k, 1.800 profili, 12.500 routing, M+100) restano **regression fixtures storici**. Non sono più l'autorità per dichiarare saturazione reale.

Il rail corrente `v4-stable-real-saturation.mjs` misura invece:

- scenari semanticamente unici;
- influenza effettiva di ogni asse;
- pairwise coverage e critical-triple coverage;
- frozen holdout;
- mutation discrimination;
- grado di indipendenza dell'evidenza.

L'evidenza interna di questo rail è **E2**. Browser/runtime exact-head possono elevare specifiche proprietà a E3. La comprensione umana resta `not-assessed` finché non esiste evidenza E4 da utenti reali o assessor indipendenti.

## Run

Richiede Node.js 22 o successivo.

```bash
npm ci
./ictc.sh start --no-open
```

Apri `http://127.0.0.1:4173`.

## Verify

```bash
npm test
node v3/v4-stable-real-saturation.mjs
node v3/v4-stable-governance-check.mjs
node v3/v4-stable-persistence-check.mjs
node v3/v4-stable-global-dod-check.mjs
```

La Definition of Done completa è in `docs/V4_EXPERIMENTAL_STABLE_DOD.md`.
