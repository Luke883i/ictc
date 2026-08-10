# START HERE — orientamento sviluppatore ICTC

Questa pagina è una **mappa**, non una nuova autorità. Serve a evitare che un nuovo manutentore debba ricostruire l'AS-IS leggendo la cronologia delle PR o tutti i documenti storici.

## Percorso da 5 minuti

1. Leggi `README.md` per capire prodotto, sette procedure, Postura, EP-01, persistenza ed export.
2. Leggi `AGENTS.md` per i vincoli epistemici che nessuna modifica può aggirare.
3. Apri `docs/authority-matrix.yaml` per individuare l'owner eseguibile prima di cambiare runtime, UI o dati.
4. Leggi `docs/11_ARCHITECTURE.md` per snapshot, audit, versioni, binding e limiti dell'AS-IS.
5. Esegui `npm test`; usa `docs/TESTING.md` solo quando devi diagnosticare o aggiungere un falsificatore.

Se questi cinque passaggi non bastano a capire dove intervenire, la documentazione o l'authority matrix hanno un gap: correggi prima quel gap, non creare un owner parallelo.

## Devo cambiare…

| Obiettivo | Parti da | Verifica minima |
|---|---|---|
| una regola di autorità/runtime | `docs/authority-matrix.yaml` + owner sotto `v3/` | `node v3/authority-contract-check.mjs` + `npm test` |
| una procedura business | registry/adapter/policy della procedura | contract/policy check + journey server-backed pertinente |
| navigazione o UI condivisa | `v3/public/ui/active-experience.js`, router e primitive esistenti | static UI gate + browser journey |
| gerarchia visuale, semantica di stato o proporzioni | `docs/ONTO_COMPLIANCE_HORIZON_V1.md` + owner UI esistente | `node v3/onto-compliance-horizon-check.mjs` + browser atlas |
| Postura o Reticolo epistemico | projection/owner esistente, poi renderer | authority/epistemic gate + browser |
| fascicoli/export | canonical evidence graph/dossier | evidence export/auth check; nessun ampliamento di lettura |
| persistenza | `v3/sqlite-state-persistence.mjs` | durability/integrity/runtime suite |
| AI | `docs/10_LOCAL_AI_CONTRACT.md` + provider/policy owner | AI/network policy; output sempre `proposed` |
| CI/release | `.github/workflows/`, current release suite, release identity | exact-head checks e artifact sullo stesso SHA |

## Ordine delle fonti

Quando due testi sembrano divergere, non scegliere quello più recente per data o PR. Usa questo ordine:

1. contratto eseguibile e owner dichiarato in `docs/authority-matrix.yaml`;
2. `AGENTS.md` per i limiti epistemici e di governance;
3. `docs/11_ARCHITECTURE.md`, `docs/TESTING.md`, `docs/DEVELOPMENT.md`, `SECURITY.md` per spiegare l'AS-IS;
4. documenti di candidate/DoD, incluso `docs/ONTO_COMPLIANCE_HORIZON_V1.md`, per il lavoro in corso;
5. documenti storici e trajectory come lineage progettuale, non come autorità corrente.

## Prima della PR

- modifica l'owner esistente invece di aggiungere un secondo owner;
- rendi esplicito l'impatto epistemico;
- per una modifica visuale verifica che gerarchia, ruolo e linguaggio non implichino autorità più forte dei dati;
- aggiungi un falsificatore che fallisca se il nuovo contratto regredisce;
- esegui `npm test` e i browser journey pertinenti;
- descrivi residui e non-goal senza trasformare test o receipt in conclusioni legali/compliance;
- considera valido il verde solo sull'exact HEAD che verrà revisionato.

Per il flusso operativo completo: `docs/DEVELOPMENT.md`. Per il profilo visuale/ontologico corrente: `docs/ONTO_COMPLIANCE_HORIZON_V1.md`. Per la baseline Procedure Journey 2.1: `docs/PR60_GLOBAL_DOD.md`. Per la storia: `docs/PROJECT_TRAJECTORY.md`.
